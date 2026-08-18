import 'package:flutter/material.dart';
import '../controllers/bookings_controller.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';

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

  String _extractImage(Map<String, dynamic> booking) {
    final image = booking['image'];
    if (image is String && image.trim().isNotEmpty) return image;

    final images = booking['images'];
    if (images is List && images.isNotEmpty) return images.first.toString();

    return 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4';
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
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : bookings.isEmpty
          ? const Center(
              child: Text(
                'لا توجد حجوزات حالياً',
                style: TextStyle(fontSize: 16),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: bookings.length,
              itemBuilder: (context, i) {
                final b = bookings[i];
                final status = BookingsController.getStatusLabel(
                  b['status']?.toString(),
                );
                final type = b['type']?.toString() ?? '';
                final imageUrl = _extractImage(b);

                return Container(
                  margin: const EdgeInsets.only(bottom: 14),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(18),
                    color: Colors.white,
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
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    b['title']?.toString() ??
                                        b['name']?.toString() ??
                                        'حجز',
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
                                    borderRadius: BorderRadius.circular(20),
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
                                  type.isNotEmpty ? type : 'نوع الحجز',
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
                                      'غير محدد',
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
                                  await BookingsController.deleteBooking(i);
                                  if (mounted) _loadBookings();
                                },
                                icon: const Icon(
                                  Icons.delete,
                                  color: Colors.red,
                                ),
                                label: const Text(
                                  'حذف',
                                  style: TextStyle(color: Colors.red),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }
}
