// lib/views/home_view.dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:SyrTrip/views/bookings_view.dart';
import '../views/transport_view.dart';
import '../views/hotels_view.dart';
import '../views/attractions_view.dart';
import '../views/restaurants_view.dart';
import '../views/favorites_view.dart';
import '../widgets/bottom_nav_bar.dart';
import '../providers/app_provider.dart';

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
    BookingsView(),
    FavoritesView(),
  ];

  void _handleSwipe(DragEndDetails details) {
    final velocity = details.primaryVelocity ?? 0;
    if (velocity.abs() < 250) return;

    final isArabic = context.read<AppProvider>().isArabic;
    final movingForward = isArabic ? velocity > 0 : velocity < 0;
    final nextIndex = movingForward ? _index + 1 : _index - 1;
    if (nextIndex < 0 || nextIndex >= _screens.length) return;
    setState(() => _index = nextIndex);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: GestureDetector(
        behavior: HitTestBehavior.translucent,
        onHorizontalDragEnd: _handleSwipe,
        child: _screens[_index],
      ),
      bottomNavigationBar: BottomNavBar(
        currentIndex: _index,
        onTap: (i) => setState(() => _index = i),
      ),
    );
  }
}
