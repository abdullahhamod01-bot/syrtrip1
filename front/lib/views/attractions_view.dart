import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:SyrTrip/widgets/main_drawer.dart';
import '../widgets/custom_card.dart';
import '../controllers/favorites_controller.dart';
import '../widgets/custom_appbar.dart';
import '../providers/attraction_filter_provider.dart';
import '../models/place_model.dart';
import '../services/place_service.dart';
import 'detail_view.dart';

class AttractionsView extends StatefulWidget {
  const AttractionsView({super.key});

  @override
  State<AttractionsView> createState() => _AttractionsViewState();
}

class _AttractionsViewState extends State<AttractionsView> {
  List<String> favs = [];
  List<PlaceModel> attractions = [];
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
    attractions = await fetchAttractions();
    if (mounted) setState(() => isLoading = false);
  }

  Future<List<PlaceModel>> fetchAttractions() async {
    try {
      final response = await http.get(
        Uri.parse('https://syr-trip-backend.vercel.app/api/landmarks'),
      );
      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        final List data = body['landmarks'] ?? [];
        final places = data.map((e) => PlaceModel.fromJson(e)).toList();
        await PlaceService().cacheAttractions(places); // حفظ في sqflite
        return places;
      } else {
        throw Exception('فشل تحميل الأماكن السياحية');
      }
    } catch (e) {
      // في حال فشل الاتصال، استخدم الكاش
      return await PlaceService().getCachedAttractions();
    }
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
    final selectedFilter = context
        .watch<AttractionFilterProvider>()
        .selectedFilter;
    final filteredAttractions = attractions.where((a) {
      final matchesSearch =
          _searchQuery.isEmpty ||
          a.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          a.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          a.location.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCity =
          _selectedCity == 'الكل' || a.location.contains(_selectedCity);
      final matchesCategory =
          selectedFilter == null || a.description.contains(selectedFilter);
      return matchesSearch && matchesCity && matchesCategory;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Column(
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
                            hintText: 'ابحث عن معلم أو مدينة...',
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
                            labelText: 'المدينة',
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
                      itemCount: filteredAttractions.length,
                      gridDelegate:
                          const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.74,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                      itemBuilder: (context, i) {
                        final p = filteredAttractions[i];
                        return CustomCard(
                          id: p.id,
                          title: p.name,
                          subtitle: p.location,
                          imagePath: p.images.first,
                          rating: p.rating,
                          trailing: _buildTrailing(p.id),
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              DetailView.routeName,
                              arguments: DetailArguments(
                                id: p.id,
                                name: p.name,
                                description: p.description,
                                images: p.images,
                                rating: p.rating,
                                type: DetailType.attraction,
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
