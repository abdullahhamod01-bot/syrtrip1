// lib/views/home_view.dart
import 'package:flutter/material.dart';
import 'package:SyrTrip/views/bookings_view.dart';
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
  late final PageController _pageController;

  final List<Widget> _screens = const [
    TransportView(),
    HotelsView(),
    AttractionsView(),
    RestaurantsView(),
    BookingsView(),
    FavoritesView(),
  ];

  @override
  void initState() {
    super.initState();
    _pageController = PageController(initialPage: _index);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        controller: _pageController,
        onPageChanged: (index) {
          if (_index != index) setState(() => _index = index);
        },
        children: _screens,
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _index,
        onTap: (i) {
          setState(() => _index = i);
          _pageController.animateToPage(
            i,
            duration: const Duration(milliseconds: 280),
            curve: Curves.easeInOut,
          );
        },
      ),
    );
  }
}
