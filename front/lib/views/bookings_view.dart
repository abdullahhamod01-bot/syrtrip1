import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../controllers/bookings_controller.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';
import '../providers/app_provider.dart';
import '../models/hotel_model.dart';
import '../models/restaurant_model.dart';
import '../models/transport_model.dart';
import 'detail_view.dart';

class BookingsView extends StatefulWidget {
  const BookingsView({super.key});

  @override
  State<BookingsView> createState() => _BookingsViewState();
}

class _BookingsViewState extends State<BookingsView> {
  List<Map<String, dynamic>> bookings = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadBookings();
  }

  Future<void> _loadBookings() async {
    final data = await BookingsController.getBookings();

    if (mounted) {
      setState(() {
        bookings = data;
        isLoading = false;
      });
    }
  }

  Future<void> _refreshBookings() async {
    await _loadBookings();
  }

  String _extractImage(Map<String, dynamic> booking) {
    final item = _itemData(booking);
    final itemImages = item['images'];
    if (itemImages is List && itemImages.isNotEmpty) {
      return itemImages.first.toString();
    }

    final itemImage = item['image'];
    if (itemImage is String && itemImage.trim().isNotEmpty) {
      return itemImage;
    }

    final image = booking['image'];
    if (image is String && image.trim().isNotEmpty) return image;

    final images = booking['images'];
    if (images is List && images.isNotEmpty) return images.first.toString();

    return 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4';
  }

  Map<String, dynamic> _itemData(Map<String, dynamic> booking) {
    final itemType = (booking['itemType'] ?? booking['type'] ?? '')
        .toString()
        .toUpperCase();
    final relation = itemType.contains('HOTEL')
        ? booking['hotel']
        : itemType.contains('RESTAURANT')
        ? booking['restaurant']
        : itemType.contains('CAR')
        ? booking['car']
        : null;
    if (relation is Map) return Map<String, dynamic>.from(relation);
    return {
      ...booking,
      'name': booking['itemName'] ?? booking['name'] ?? booking['title'],
      'description': booking['itemDescription'] ?? booking['description'] ?? '',
      'images': booking['itemImages'] ?? booking['images'] ?? const [],
      'location': booking['itemLocation'] ?? booking['location'] ?? '',
      'latitude':
          booking['itemLatitude'] ?? booking['latitude'] ?? booking['lat'],
      'longitude':
          booking['itemLongitude'] ?? booking['longitude'] ?? booking['lng'],
      'pricePerNight': booking['itemPrice'] ?? booking['pricePerNight'],
      'type':
          booking['itemVehicleType'] ??
          booking['vehicleType'] ??
          booking['type'],
    };
  }

  DetailArguments? _detailArguments(Map<String, dynamic> booking) {
    final itemType = (booking['itemType'] ?? booking['type'] ?? '')
        .toString()
        .toUpperCase();
    final item = _itemData(booking);
    final isHotel = itemType.contains('HOTEL');
    final isRestaurant = itemType.contains('RESTAURANT');
    final isCar = itemType.contains('CAR');
    if (!isHotel && !isRestaurant && !isCar) return null;

    final id =
        (item['id'] ??
                item['_id'] ??
                booking['hotelId'] ??
                booking['restaurantId'] ??
                booking['carId'])
            ?.toString();
    if (id == null || id.isEmpty) return null;
    final images = item['images'] is List
        ? (item['images'] as List).map((image) => image.toString()).toList()
        : <String>[];

    if (isHotel) {
      final hotel = HotelModel.fromJson(item);
      return DetailArguments(
        id: hotel.id,
        name: hotel.name,
        description: hotel.description,
        images: images,
        rating: hotel.rating,
        type: DetailType.hotel,
        phoneNumber: hotel.phoneNumber,
        locationUrl: hotel.location,
        latitude: hotel.latitude,
        longitude: hotel.longitude,
        pricePerNight: hotel.pricePerNight,
      );
    }
    if (isRestaurant) {
      final restaurant = RestaurantModel.fromJson(item);
      return DetailArguments(
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description,
        images: images,
        rating: restaurant.rating,
        type: DetailType.restaurant,
        phoneNumber: restaurant.phoneNumber,
        locationUrl: restaurant.location,
        latitude: restaurant.latitude,
        longitude: restaurant.longitude,
      );
    }

    final car = TransportModel.fromJson(item);
    return DetailArguments(
      id: car.id,
      name: car.name,
      description: car.description,
      images: images,
      rating: car.rating,
      type: DetailType.transport,
      locationUrl: car.location,
      latitude: car.latitude,
      longitude: car.longitude,
      vehicleType: car.type,
      pricePerNight: car.fare,
    );
  }

  Future<void> _openBookingDetails(Map<String, dynamic> booking) async {
    final arguments = _detailArguments(booking);
    if (arguments == null) return;
    await Navigator.pushNamed(
      context,
      DetailView.routeName,
      arguments: arguments,
    );
  }

  Future<void> _confirmDelete(int index) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('تأكيد الحذف'),
        content: const Text('هل تريد حذف هذا الحجز؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('إلغاء'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    await BookingsController.deleteBooking(index);
    if (mounted) await _loadBookings();
  }

  Color _statusColor(String status) {
    switch (BookingsController.getStatusLabel(status)) {
      case 'تمت الموافقة':
        return Colors.green;
      case 'قيد الانتظار':
        return Colors.orange;
      case 'مرفوض':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  IconData _typeIcon(String type) {
    switch (type.toLowerCase()) {
      case 'فندق':
      case 'hotel':
        return Icons.hotel;
      case 'مطعم':
      case 'restaurant':
        return Icons.restaurant;
      case 'معلم سياحي':
      case 'attraction':
        return Icons.location_city;
      case 'سيارة':
      case 'car':
        return Icons.directions_car;
      default:
        return Icons.bookmark;
    }
  }

  Widget _buildStatusSteps(String status) {
    final steps = BookingsController.getStatusSteps(status);

    return Padding(
      padding: const EdgeInsets.only(top: 16),
      child: Row(
        children: List.generate(steps.length, (index) {
          final step = steps[index];
          final active = step['active'] == true;

          return Expanded(
            child: Column(
              children: [
                Container(
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    color: active ? _statusColor(status) : Colors.grey[300],
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: active ? Colors.white : Colors.grey[400]!,
                      width: 2,
                    ),
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  step['label'].toString(),
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 10,
                    color: active ? _statusColor(status) : Colors.grey[600],
                    fontWeight: active ? FontWeight.bold : FontWeight.normal,
                  ),
                ),
              ],
            ),
          );
        }),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = context.watch<AppProvider>().isArabic;
    final theme = Theme.of(context);

    return Scaffold(
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshBookings,
              child: bookings.isEmpty
                  ? ListView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      children: [
                        SizedBox(
                          height: 500,
                          child: Center(
                            child: Text(
                              isArabic
                                  ? 'لا توجد حجوزات حالياً'
                                  : 'No bookings yet',
                              style: const TextStyle(fontSize: 16),
                            ),
                          ),
                        ),
                      ],
                    )
                  : ListView.builder(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(12),
                      itemCount: bookings.length,
                      itemBuilder: (context, i) {
                        final b = bookings[i];
                        final item = _itemData(b);
                        final status = BookingsController.getStatusLabel(
                          b['status']?.toString(),
                        );
                        final type =
                            b['itemType']?.toString() ??
                            b['type']?.toString() ??
                            '';
                        final imageUrl = _extractImage(b);

                        return InkWell(
                          onTap: () => _openBookingDetails(b),
                          borderRadius: BorderRadius.circular(18),
                          child: Container(
                            margin: const EdgeInsets.only(bottom: 14),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(18),
                              color: theme.colorScheme.surface,
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.06),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(14),
                                  child: Image.network(
                                    imageUrl,
                                    width: 90,
                                    height: 90,
                                    fit: BoxFit.cover,
                                    errorBuilder: (_, __, ___) => Container(
                                      width: 90,
                                      height: 90,
                                      color: Colors.grey[200],
                                      child: const Icon(
                                        Icons.image_not_supported,
                                        color: Colors.grey,
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Expanded(
                                            child: Text(
                                              item['name']?.toString() ??
                                                  b['title']?.toString() ??
                                                  b['name']?.toString() ??
                                                  (isArabic
                                                      ? 'حجز'
                                                      : 'Booking'),
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 6,
                                            ),
                                            decoration: BoxDecoration(
                                              color: _statusColor(
                                                status,
                                              ).withOpacity(0.12),
                                              borderRadius:
                                                  BorderRadius.circular(20),
                                            ),
                                            child: Text(
                                              status,
                                              style: TextStyle(
                                                color: _statusColor(status),
                                                fontWeight: FontWeight.bold,
                                                fontSize: 12,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Row(
                                        children: [
                                          Icon(
                                            _typeIcon(type),
                                            size: 16,
                                            color: Colors.grey[700],
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            type.isNotEmpty
                                                ? type
                                                : (isArabic
                                                      ? 'نوع الحجز'
                                                      : 'Booking type'),
                                            style: TextStyle(
                                              color: Colors.grey[700],
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 8),
                                      Row(
                                        children: [
                                          const Icon(
                                            Icons.date_range,
                                            size: 16,
                                            color: Colors.grey,
                                          ),
                                          const SizedBox(width: 6),
                                          Text(
                                            b['date']?.toString() ??
                                                b['startDate']?.toString() ??
                                                (isArabic
                                                    ? 'غير محدد'
                                                    : 'Not specified'),
                                            style: TextStyle(
                                              color: Colors.grey[700],
                                              fontSize: 12,
                                            ),
                                          ),
                                        ],
                                      ),
                                      _buildStatusSteps(status),
                                      const SizedBox(height: 8),
                                      Align(
                                        alignment: Alignment.centerRight,
                                        child: TextButton.icon(
                                          onPressed: () async {
                                            await _confirmDelete(i);
                                          },
                                          icon: const Icon(
                                            Icons.delete,
                                            color: Colors.red,
                                          ),
                                          label: Text(
                                            isArabic ? 'حذف' : 'Delete',
                                            style: const TextStyle(
                                              color: Colors.red,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
