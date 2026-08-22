import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';

import '../controllers/favorites_controller.dart';
import '../providers/app_provider.dart';
import 'detail_view.dart';

class FavoritesMapView extends StatefulWidget {
  const FavoritesMapView({super.key});

  @override
  State<FavoritesMapView> createState() => _FavoritesMapViewState();
}

class _FavoritesMapViewState extends State<FavoritesMapView> {
  final MapController _mapController = MapController();
  int _favoriteCount = 0;
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
                MarkerLayer(
                  markers: _buildMarkers(
                    context,
                    isAr,
                    detail,
                    selectedLocation,
                  ),
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
            onPressed: () => _mapController.move(_syriaCenter, _defaultZoom),
            child: const Icon(Icons.my_location),
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
