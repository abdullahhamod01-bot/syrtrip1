
// lib/views/home_view.dart
import 'package:flutter/material.dart';
import '../views/transport_view.dart';
import '../views/hotels_view.dart';
import '../views/attractions_view.dart';
import '../views/restaurants_view.dart';
import '../views/favorites_view.dart';
import '../widgets/bottom_nav_bar.dart';

class HomeView extends StatefulWidget {
  const HomeView({super.key});
  @override
  State<HomeView> createState() => _HomeViewState();
}

class _HomeViewState extends State<HomeView> {
  int _index = 2; // default to attractions like original

  final List<Widget> _screens = const [
    TransportView(),
    HotelsView(),
    AttractionsView(),
    RestaurantsView(),
    FavoritesView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_index],
      bottomNavigationBar: BottomNavBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
      ),
    );
  }
}

