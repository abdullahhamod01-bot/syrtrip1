import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:flutter/services.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;

import '../controllers/favorites_controller.dart';
import '../providers/app_provider.dart';
import 'detail_view.dart';

class FavoritesMapView extends StatefulWidget {
  const FavoritesMapView({super.key});

  @override
  State<FavoritesMapView> createState() => _FavoritesMapViewState();
}

class _FavoritesMapViewState extends State<FavoritesMapView> {
  static const _locationChannel = MethodChannel('syrtrip/location');
  final MapController _mapController = MapController();
  int _favoriteCount = 0;
  LatLng? _currentLocation;
  List<LatLng> _routePoints = [];
  bool _isLoadingLocation = false;
  final List<Map<String, dynamic>> _syriaCities = [
    {'name': 'دمشق', 'lat': 33.5138, 'lng': 36.2765},
    {'name': 'حلب', 'lat': 36.2021, 'lng': 37.1343},
    {'name': 'حمص', 'lat': 34.7308, 'lng': 36.7094},
    {'name': 'اللاذقية', 'lat': 35.5198, 'lng': 35.7840},
    {'name': 'طرطوس', 'lat': 34.8890, 'lng': 35.8866},
    {'name': 'حماة', 'lat': 35.1333, 'lng': 36.7500},
    {'name': 'دير الزور', 'lat': 35.3333, 'lng': 40.1500},
    {'name': 'الرقة', 'lat': 35.9500, 'lng': 39.0167},
    {'name': 'إدلب', 'lat': 35.9308, 'lng': 36.6339},
    {'name': 'السويداء', 'lat': 32.7083, 'lng': 36.5667},
  ];

  static const LatLng _syriaCenter = LatLng(35.0, 38.5);
  static const double _defaultZoom = 6.8;

  @override
  void initState() {
    super.initState();
    _loadFavoriteCount();
    _loadCurrentLocation();
  }

  Future<void> _loadCurrentLocation() async {
    if (mounted) setState(() => _isLoadingLocation = true);

    try {
      final permission = await Permission.locationWhenInUse.request();
      if (!permission.isGranted && !permission.isLimited) {
        _showLocationMessage('يرجى السماح للتطبيق بالوصول إلى موقعك الحالي');
        return;
      }

      final result = await _locationChannel.invokeMethod<Map<Object?, Object?>>(
        'getCurrentLocation',
      );
      if (result == null) {
        _showLocationMessage(
          'تعذر تحديد موقعك. تأكد من تشغيل GPS ومنح صلاحية الموقع.',
        );
        return;
      }
      final latitude = (result['latitude'] as num?)?.toDouble();
      final longitude = (result['longitude'] as num?)?.toDouble();
      if (latitude == null || longitude == null) {
        _showLocationMessage('لم يتم الحصول على إحداثيات موقعك الحالي.');
        return;
      }
      if (mounted) {
        setState(() {
          _currentLocation = LatLng(latitude, longitude);
        });
        final arguments = ModalRoute.of(context)?.settings.arguments;
        final detail = arguments is DetailArguments ? arguments : null;
        if (detail?.latitude != null && detail?.longitude != null) {
          final itemLocation = LatLng(detail!.latitude!, detail.longitude!);
          setState(() => _routePoints = [itemLocation, _currentLocation!]);
          _loadRoute(itemLocation, _currentLocation!);
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _mapController.fitCamera(
              CameraFit.bounds(
                bounds: LatLngBounds.fromPoints([
                  itemLocation,
                  _currentLocation!,
                ]),
                padding: const EdgeInsets.all(56),
              ),
            );
          });
        } else {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            _mapController.move(_currentLocation!, 15);
          });
        }
      }
    } catch (_) {
      _showLocationMessage('حدث خطأ أثناء تحديد موقعك الحالي.');
    } finally {
      if (mounted) setState(() => _isLoadingLocation = false);
    }
  }

  Future<void> _loadRoute(LatLng itemLocation, LatLng currentLocation) async {
    try {
      final uri = Uri.parse(
        'https://router.project-osrm.org/route/v1/driving/'
        '${currentLocation.longitude},${currentLocation.latitude};'
        '${itemLocation.longitude},${itemLocation.latitude}'
        '?overview=full&geometries=geojson',
      );
      final response = await http.get(uri);
      if (response.statusCode != 200) return;

      final decoded = jsonDecode(response.body);
      final coordinates = decoded['routes']?[0]?['geometry']?['coordinates'];
      if (coordinates is! List || coordinates.isEmpty || !mounted) return;

      final points = coordinates
          .whereType<List>()
          .where((point) => point.length >= 2)
          .map(
            (point) => LatLng(
              (point[1] as num).toDouble(),
              (point[0] as num).toDouble(),
            ),
          )
          .toList();
      if (points.length >= 2) setState(() => _routePoints = points);
    } catch (_) {
      // Keep the straight fallback line when routing is unavailable.
    }
  }

  void _showLocationMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  void _centerOnCurrentLocation() {
    final location = _currentLocation;
    if (location == null) {
      _loadCurrentLocation();
      return;
    }
    _mapController.move(location, 15);
  }

  Future<void> _loadFavoriteCount() async {
    final favorites = await FavoritesController.loadFavorites();
    if (mounted) {
      setState(() => _favoriteCount = favorites.length);
    }
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final isAr = appProvider.isArabic;
    final args = ModalRoute.of(context)?.settings.arguments;
    final detail = args is DetailArguments ? args : null;
    final selectedLocation =
        detail?.latitude != null && detail?.longitude != null
        ? LatLng(detail!.latitude!, detail.longitude!)
        : null;
    final center = selectedLocation ?? _syriaCenter;
    final zoom = selectedLocation == null ? _defaultZoom : 15.0;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'المفضلة على الخريطة' : 'Favorites on Map',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          IconButton(
            onPressed: () => _showLegend(context, isAr),
            icon: const Icon(Icons.legend_toggle),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            color: Theme.of(
              context,
            ).colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
            child: Text(
              isAr
                  ? 'تم العثور على $_favoriteCount عنصرًا مفضلًا قريبًا من مواقع سوريا'
                  : 'Found $_favoriteCount favorite items near Syrian locations',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
          Expanded(
            child: FlutterMap(
              mapController: _mapController,
              options: MapOptions(initialCenter: center, initialZoom: zoom),
              children: [
                TileLayer(
                  urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                  userAgentPackageName: 'com.example.syrtrip',
                ),
                if (_routePoints.length >= 2)
                  PolylineLayer(
                    polylines: [
                      Polyline(
                        points: _routePoints,
                        color: Colors.blue,
                        strokeWidth: 5,
                      ),
                    ],
                  ),
                MarkerLayer(
                  markers: [
                    ..._buildMarkers(context, isAr, detail, selectedLocation),
                    if (_currentLocation != null)
                      _buildCurrentLocationMarker(context, isAr),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          FloatingActionButton.small(
            heroTag: 'zoom_in',
            onPressed: () {
              final currentZoom = _mapController.camera.zoom;
              _mapController.move(
                _mapController.camera.center,
                currentZoom + 1,
              );
            },
            child: const Icon(Icons.add),
          ),
          const SizedBox(height: 8),
          FloatingActionButton.small(
            heroTag: 'zoom_out',
            onPressed: () {
              final currentZoom = _mapController.camera.zoom;
              _mapController.move(
                _mapController.camera.center,
                currentZoom - 1,
              );
            },
            child: const Icon(Icons.remove),
          ),
          const SizedBox(height: 8),
          FloatingActionButton.small(
            heroTag: 'center',
            onPressed: _centerOnCurrentLocation,
            child: _isLoadingLocation
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.my_location),
          ),
        ],
      ),
    );
  }

  List<Marker> _buildMarkers(
    BuildContext context,
    bool isAr,
    DetailArguments? detail,
    LatLng? selectedLocation,
  ) {
    final markers = <Marker>[];

    if (detail != null && selectedLocation != null) {
      markers.add(
        Marker(
          point: selectedLocation,
          width: 180,
          height: 70,
          child: GestureDetector(
            onTap: () => _showMarkerInfo(
              context,
              detail.name,
              detail.locationUrl ?? '',
              isAr,
            ),
            child: Column(
              children: [
                const Icon(Icons.location_pin, color: Colors.red, size: 42),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  color: Colors.white,
                  child: Text(
                    detail.name,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
      return markers;
    }

    for (int i = 0; i < 6; i++) {
      final city = _syriaCities[i % _syriaCities.length];
      final location = LatLng(city['lat'], city['lng']);
      final title = isAr ? 'المفضلة ${i + 1}' : 'Favorite ${i + 1}';
      markers.add(
        Marker(
          point: location,
          width: 48,
          height: 56,
          child: GestureDetector(
            onTap: () => _showMarkerInfo(context, title, city['name'], isAr),
            child: Column(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: const BoxDecoration(
                    color: Colors.redAccent,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.favorite,
                    color: Colors.white,
                    size: 18,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 6,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    boxShadow: const [
                      BoxShadow(color: Colors.black12, blurRadius: 4),
                    ],
                  ),
                  child: Text(
                    city['name'],
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return markers;
  }

  Marker _buildCurrentLocationMarker(BuildContext context, bool isAr) {
    return Marker(
      point: _currentLocation!,
      width: 150,
      height: 62,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: const BoxDecoration(
              color: Colors.blue,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.person_pin_circle, color: Colors.white),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
            color: Colors.white,
            child: Text(
              isAr ? 'موقعي الحالي' : 'My location',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  void _showMarkerInfo(
    BuildContext context,
    String title,
    String city,
    bool isAr,
  ) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) {
        return Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(isAr ? 'الموقع: $city' : 'Location: $city'),
              const SizedBox(height: 12),
              Text(
                isAr
                    ? 'هذا العنصر يظهر على الخريطة كإشارة مفضلة.'
                    : 'This item is shown as a favorite marker on the map.',
              ),
            ],
          ),
        );
      },
    );
  }

  void _showLegend(BuildContext context, bool isAr) {
    showDialog(
      context: context,
      builder: (_) {
        return AlertDialog(
          title: Text(isAr ? 'دليل المعالم' : 'Legend'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _legendItem(
                Icons.favorite,
                Colors.redAccent,
                isAr ? 'مفضلة' : 'Favorite',
              ),
              _legendItem(
                Icons.place,
                Colors.green,
                isAr ? 'موقع' : 'Location',
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(isAr ? 'إغلاق' : 'Close'),
            ),
          ],
        );
      },
    );
  }

  Widget _legendItem(IconData icon, Color color, String label) {
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: color.withValues(alpha: 0.15),
        child: Icon(icon, color: color),
      ),
      title: Text(label),
    );
  }
}
