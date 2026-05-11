
// lib/widgets/bottom_nav_bar.dart
import 'package:flutter/material.dart';

class BottomNavBar extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;
  const BottomNavBar({super.key, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color.fromARGB(255, 0, 128, 68),
      selectedItemColor: Colors.white,
      unselectedItemColor: Colors.white70,
      currentIndex: currentIndex,
      onTap: onTap,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.directions_bus), label: "المواصلات"),
        BottomNavigationBarItem(icon: Icon(Icons.hotel), label: "الفنادق"),
        BottomNavigationBarItem(icon: Icon(Icons.location_city), label: "المعالم"),
        BottomNavigationBarItem(icon: Icon(Icons.restaurant), label: "المطاعم"),
        BottomNavigationBarItem(icon: Icon(Icons.book), label: "الحجوزات"),
        BottomNavigationBarItem(icon: Icon(Icons.favorite), label: "المفضلة"),
      ],
    );
  }
}