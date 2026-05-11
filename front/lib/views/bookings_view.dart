import 'package:flutter/material.dart';

class BookingsView extends StatefulWidget {
  const BookingsView({super.key});

  @override
  State<BookingsView> createState() => _BookingsViewState();
}

class _BookingsViewState extends State<BookingsView> {
  // بيانات وهمية (لاحقاً تربطها بقاعدة بيانات أو API)
  final List<Map<String, dynamic>> bookings = [
    {
      "title": "فندق الشام",
      "type": "فندق",
      "date": "2026-05-10",
      "status": "مؤكد",
      "image": "https://images.unsplash.com/photo-hotel"
    },
    {
      "title": "مطعم دمشق القديم",
      "type": "مطعم",
      "date": "2026-05-12",
      "status": "قيد الانتظار",
      "image": "https://images.unsplash.com/photo-restaurant"
    },
    {
      "title": "قلعة حلب",
      "type": "معلم سياحي",
      "date": "2026-05-15",
      "status": "مؤكد",
      "image": "https://images.unsplash.com/photo-place"
    },
  ];

  Color _statusColor(String status) {
    switch (status) {
      case "مؤكد":
        return Colors.green;
      case "قيد الانتظار":
        return Colors.orange;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),

      appBar: AppBar(
        title: const Text("الحجوزات"),
        backgroundColor: Colors.green,
      ),

      body: bookings.isEmpty
          ? const Center(
              child: Text(
                "لا توجد حجوزات حالياً",
                style: TextStyle(fontSize: 16),
              ),
            )
          : ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: bookings.length,
              itemBuilder: (context, i) {
                final b = bookings[i];

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ListTile(
                    leading: const Icon(Icons.bookmark, color: Colors.green),

                    title: Text(
                      b['title'],
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),

                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("النوع: ${b['type']}"),
                        Text("التاريخ: ${b['date']}"),
                        const SizedBox(height: 4),
                        Text(
                          b['status'],
                          style: TextStyle(
                            color: _statusColor(b['status']),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),

                    trailing: IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () {
                        setState(() {
                          bookings.removeAt(i);
                        });
                      },
                    ),
                  ),
                );
              },
            ),
    );
  }
}