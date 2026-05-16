import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/booking_provider.dart';
import '../providers/app_provider.dart';
import '../utils/translations.dart';

class BookingsView extends StatefulWidget {
  const BookingsView({super.key});

  @override
  State<BookingsView> createState() => _BookingsViewState();
}

class _BookingsViewState extends State<BookingsView> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final appProvider = context.read<AppProvider>();
      context.read<BookingProvider>().fetchUserBookings(
            token: appProvider.token ?? '',
          );
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(Translations.tr(context, 'bookings')),
        centerTitle: true,
      ),
      body: Consumer<BookingProvider>(
        builder: (context, bookingProvider, child) {
          if (bookingProvider.isLoading) {
            return const Center(
              child: CircularProgressIndicator(),
            );
          }

          if (bookingProvider.errorMessage != null) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 48, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(bookingProvider.errorMessage ?? 'حدث خطأ'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      final appProvider = context.read<AppProvider>();
                      bookingProvider.fetchUserBookings(
                        token: appProvider.token ?? '',
                      );
                    },
                    child: const Text('إعادة محاولة'),
                  ),
                ],
              ),
            );
          }

          if (bookingProvider.bookings.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.calendar_today, size: 48, color: Colors.grey),
                  const SizedBox(height: 16),
                  Text(
                    'لا توجد حجوزات',
                    style: const TextStyle(fontSize: 18),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('العودة'),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: bookingProvider.bookings.length,
            itemBuilder: (context, index) {
              final booking = bookingProvider.bookings[index];
              return BookingCard(booking: booking);
            },
          );
        },
      ),
    );
  }
}

class BookingCard extends StatelessWidget {
  final dynamic booking;

  const BookingCard({Key? key, required this.booking}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final checkInDate = DateTime.parse(booking['checkInDate']);
    final checkOutDate = DateTime.parse(booking['checkOutDate']);
    final nights =
        context.read<BookingProvider>().getNumberOfNights(checkInDate, checkOutDate);

    Color statusColor;
    String statusLabel;

    switch (booking['status']) {
      case 'confirmed':
        statusColor = Colors.green;
        statusLabel = 'مؤكد';
        break;
      case 'pending':
        statusColor = Colors.orange;
        statusLabel = 'قيد الانتظار';
        break;
      case 'cancelled':
        statusColor = Colors.red;
        statusLabel = 'ملغي';
        break;
      default:
        statusColor = Colors.grey;
        statusLabel = 'غير معروف';
    }

    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _showBookingDetails(context, booking, nights),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          booking['itemName'],
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.location_on,
                                size: 16, color: Colors.grey),
                            const SizedBox(width: 4),
                            Text(
                              booking['location'],
                              style: const TextStyle(
                                fontSize: 14,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: statusColor.withOpacity(0.2),
                      border: Border.all(color: statusColor),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      statusLabel,
                      style: TextStyle(
                        color: statusColor,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'تاريخ الوصول',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          DateFormat('dd/MM/yyyy').format(checkInDate),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward, color: Colors.grey),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text(
                          'تاريخ المغادرة',
                          style: TextStyle(
                            fontSize: 12,
                            color: Colors.grey,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          DateFormat('dd/MM/yyyy').format(checkOutDate),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),

              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _InfoColumn(
                      icon: Icons.nights_stay,
                      label: 'الليالي',
                      value: '$nights ليلة',
                    ),
                    _InfoColumn(
                      icon: Icons.people,
                      label: 'الضيوف',
                      value: '${booking['numberOfGuests']} ضيف',
                    ),
                    _InfoColumn(
                      icon: Icons.attach_money,
                      label: 'السعر',
                      value: '\$${booking['totalPrice']}',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  const Icon(Icons.person, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    booking['contactPerson'],
                    style: const TextStyle(fontSize: 14),
                  ),
                  const Spacer(),
                  const Icon(Icons.phone, size: 16, color: Colors.grey),
                  const SizedBox(width: 8),
                  Text(
                    booking['phoneNumber'],
                    style: const TextStyle(fontSize: 14),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              Row(
                children: [
                  if (booking['status'] != 'cancelled')
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => _showEditDialog(context, booking),
                        child: const Text('تعديل'),
                      ),
                    ),
                  if (booking['status'] != 'cancelled')
                    const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor:
                            booking['status'] == 'cancelled' ? Colors.grey : Colors.red,
                      ),
                      onPressed: () => _showCancelDialog(context, booking),
                      child: Text(
                        booking['status'] == 'cancelled' ? 'ملغي' : 'إلغاء',
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showBookingDetails(BuildContext context, dynamic booking, int nights) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(20),
        child: ListView(
          shrinkWrap: true,
          children: [
            const Text(
              'تفاصيل الحجز',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            _buildDetailRow('الاسم', booking['itemName']),
            _buildDetailRow('الموقع', booking['location']),
            _buildDetailRow('نوع الحجز', booking['itemType']),
            if (booking['roomNumber'] != null)
              _buildDetailRow('رقم الغرفة', booking['roomNumber']),
            if (booking['tableNumber'] != null)
              _buildDetailRow('رقم الطاولة', booking['tableNumber']),
            _buildDetailRow('عدد الضيوف', '${booking['numberOfGuests']}'),
            _buildDetailRow('عدد الليالي', '$nights ليلة'),
            _buildDetailRow('الشخص المسؤول', booking['contactPerson']),
            _buildDetailRow('رقم الهاتف', booking['phoneNumber']),
            _buildDetailRow('السعر الإجمالي', '\$${booking['totalPrice']}'),
            if (booking['notes'] != null && booking['notes'].isNotEmpty)
              _buildDetailRow('ملاحظات', booking['notes']),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  void _showEditDialog(BuildContext context, dynamic booking) {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('ميزة التعديل قريباً')),
    );
  }

  void _showCancelDialog(BuildContext context, dynamic booking) {
    if (booking['status'] == 'cancelled') return;

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الحجز'),
        content: const Text('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('إلغاء'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () {
              Navigator.pop(context);
              final bookingProvider = context.read<BookingProvider>();
              final appProvider = context.read<AppProvider>();

              bookingProvider.cancelBooking(
                token: appProvider.token ?? '',
                bookingId: booking['_id'],
              );
            },
            child: const Text('تأكيد الإلغاء'),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: const TextStyle(color: Colors.grey, fontSize: 14),
          ),
          Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
          ),
        ],
      ),
    );
  }
}

class _InfoColumn extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoColumn({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.green, size: 24),
        const SizedBox(height: 4),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.grey),
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
