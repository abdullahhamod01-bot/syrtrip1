// lib/widgets/bottom_nav_bar.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_provider.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  const BottomNavBar({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isArabic = context.watch<AppProvider>().isArabic;

    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color.fromARGB(255, 0, 128, 68),
      selectedItemColor: Colors.white,
      unselectedItemColor: Colors.white70,
      currentIndex: currentIndex,
      onTap: onTap,
      items: [
        BottomNavigationBarItem(
          icon: Icon(Icons.car_crash),
          label: isArabic ? "إيجار سيارة" : "Car rental",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.hotel),
          label: isArabic ? "الفنادق" : "Hotels",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.mosque_outlined),
          label: isArabic ? "المعالم" : "Attractions",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.restaurant),
          label: isArabic ? "المطاعم" : "Restaurants",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.event),
          label: isArabic ? "الحجوزات" : "Bookings",
        ),
        BottomNavigationBarItem(
          icon: Icon(Icons.favorite),
          label: isArabic ? "المفضلة" : "Favorites",
        ),
      ],
    );
  }
}
