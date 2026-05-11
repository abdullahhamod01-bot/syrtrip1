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
  final filters = ["شعبي", "شرقي", "غربي", "حلويات", "إطلالة"];

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
      final response = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/restaurants'));
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        final list = data.map((e) => RestaurantModel.fromJson(e)).toList();
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

  Widget _buildTrailing(String id) {
    final isFav = favs.contains(id);
    return IconButton(
      icon: Icon(isFav ? Icons.favorite : Icons.favorite_border, color: Colors.red),
      onPressed: () async {
        await FavoritesController.toggleFavorite(id);
        await _loadData();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedFilter = context.watch<RestaurantFilterProvider>().selectedFilter;
    final filteredRestaurants = selectedFilter == null
        ? restaurants
        : restaurants.where((r) => r.cuisineType.contains(selectedFilter)).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
              children: [
                SizedBox(
                  height: 60,
                  child: SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    child: Row(
                      children: filters.map((filter) {
                        final isSelected = selectedFilter == filter;
                        return Padding(
                          padding: const EdgeInsets.only(right: 8),
                          child: ElevatedButton.icon(
                            onPressed: () {
                              context.read<RestaurantFilterProvider>().selectFilter(filter);
                            },
                            icon: CircleAvatar(
                              radius: 12,
                              backgroundColor: isSelected ? Colors.white : const Color(0xFF00C2FF),
                              child: Icon(Icons.filter_alt, size: 14, color: isSelected ? Colors.black : Colors.white),
                            ),
                            label: Text(filter, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13)),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isSelected ? const Color(0xFF00C2FF) : Colors.white,
                              foregroundColor: isSelected ? Colors.white : Colors.black87,
                              elevation: 1,
                              padding: const EdgeInsets.symmetric(horizontal: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(25),
                                side: const BorderSide(color: Color(0xFF00C2FF), width: 1),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: GridView.builder(
                      itemCount: filteredRestaurants.length,
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
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
    );
  }
}
