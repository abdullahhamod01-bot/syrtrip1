import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../models/restaurant_model.dart';
import '../widgets/custom_card.dart';
import '../controllers/favorites_controller.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';
import '../providers/restaurant_filter_provider.dart';
import '../providers/app_provider.dart';
import '../services/restaurant_service.dart';
import 'detail_view.dart';

class RestaurantsView extends StatefulWidget {
  const RestaurantsView({super.key});

  @override
  State<RestaurantsView> createState() => _RestaurantsViewState();
}

class _RestaurantsViewState extends State<RestaurantsView> {
  List<String> favs = [];
  List<RestaurantModel> restaurants = [];
  bool isLoading = true;
  String _searchQuery = '';
  String _selectedCity = 'الكل';
  final List<String> _cities = [
    'الكل',
    'دمشق',
    'حماه',
    'حلب',
    'اللاذقية',
    'حمص',
  ];
  // filters removed — search + city dropdown are used instead

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    favs = await FavoritesController.loadFavorites();
    restaurants = await fetchRestaurants();
    if (mounted) setState(() => isLoading = false);
  }

  Future<List<RestaurantModel>> fetchRestaurants() async {
    try {
      final response = await http.get(
        Uri.parse('https://syr-trip-backend.vercel.app/api/restaurants'),
      );
      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        final List data = body['restaurants'] ?? [];
        final list = data
            .map<RestaurantModel>((e) => RestaurantModel.fromJson(e))
            .toList();
        await RestaurantService().cacheRestaurants(list); // حفظ في sqflite
        return list;
      } else {
        throw Exception('فشل تحميل المطاعم');
      }
    } catch (e) {
      // في حال فشل الاتصال، استخدم الكاش
      return await RestaurantService().getCachedRestaurants();
    }
  }

  Future<void> _refreshRestaurants() async {
    favs = await FavoritesController.loadFavorites();
    restaurants = await fetchRestaurants();
    if (mounted) setState(() {});
  }

  Widget _buildTrailing(String id) {
    final isFav = favs.contains(id);
    return IconButton(
      icon: Icon(
        isFav ? Icons.favorite : Icons.favorite_border,
        color: Colors.red,
      ),
      onPressed: () async {
        await FavoritesController.toggleFavorite(id);
        await _loadData();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isArabic = context.watch<AppProvider>().isArabic;
    final selectedFilter = context
        .watch<RestaurantFilterProvider>()
        .selectedFilter;
    final filteredRestaurants = restaurants.where((r) {
      final matchesSearch =
          _searchQuery.isEmpty ||
          r.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          r.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          r.location.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCity =
          _selectedCity == 'الكل' || r.location.contains(_selectedCity);
      final matchesType =
          selectedFilter == null || r.cuisineType.contains(selectedFilter);
      return matchesSearch && matchesCity && matchesType;
    }).toList();

    return Scaffold(
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshRestaurants,
              child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 2,
                          child: TextField(
                            onChanged: (value) =>
                                setState(() => _searchQuery = value),
                            decoration: InputDecoration(
                              hintText: isArabic
                                  ? 'ابحث عن مطعم أو مدينة...'
                                  : 'Search for a restaurant or city...',
                              prefixIcon: const Icon(Icons.search),
                              suffixIcon: _searchQuery.isNotEmpty
                                  ? IconButton(
                                      icon: const Icon(Icons.clear),
                                      onPressed: () =>
                                          setState(() => _searchQuery = ''),
                                    )
                                  : null,
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          flex: 1,
                          child: DropdownButtonFormField<String>(
                            value: _selectedCity,
                            items: _cities
                                .map(
                                  (city) => DropdownMenuItem(
                                    value: city,
                                    child: Text(city),
                                  ),
                                )
                                .toList(),
                            onChanged: (value) {
                              if (value != null)
                                setState(() => _selectedCity = value);
                            },
                            decoration: InputDecoration(
                              labelText: isArabic ? 'المدينة' : 'City',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  // category filter removed
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: GridView.builder(
                        itemCount: filteredRestaurants.length,
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.74,
                              crossAxisSpacing: 12,
                              mainAxisSpacing: 12,
                            ),
                        itemBuilder: (context, i) {
                          final r = filteredRestaurants[i];
                          return CustomCard(
                            id: r.id,
                            title: r.name,
                            subtitle: r.location,
                            imagePath: r.images.first,
                            rating: r.rating,
                            trailing: _buildTrailing(r.id),
                            onTap: () {
                              Navigator.pushNamed(
                                context,
                                DetailView.routeName,
                                arguments: DetailArguments(
                                  id: r.id,
                                  name: r.name,
                                  description: r.description,
                                  images: r.images,
                                  rating: r.rating,
                                  phoneNumber: r.phoneNumber,
                                  locationUrl: r.location,
                                  latitude: r.latitude,
                                  longitude: r.longitude,
                                  type: DetailType.restaurant,
                                ),
                              );
                            },
                          );
                        },
                      ),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
