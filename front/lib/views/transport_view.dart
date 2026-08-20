import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/transport_model.dart';
import '../models/office_model.dart';
import '../services/car_service.dart';
import '../services/office_service.dart';
import '../widgets/custom_card.dart';
import '../controllers/favorites_controller.dart';
import '../widgets/custom_appbar.dart';
import 'detail_view.dart';
import '../widgets/main_drawer.dart';

class TransportView extends StatefulWidget {
  const TransportView({super.key});

  @override
  State<TransportView> createState() => _TransportViewState();
}

class _TransportViewState extends State<TransportView> {
  List<String> favs = [];
  List<TransportModel> cars = [];
  List<OfficeModel> offices = [];
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

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    favs = await FavoritesController.loadFavorites();
    await _fetchOffices();
    await _fetchCars();
    if (mounted) setState(() {});
  }

  Future<void> _fetchOffices() async {
    try {
      final response = await http.get(
        Uri.parse('https://syr-trip-backend.vercel.app/api/offices'),
      );
      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        final List data = body['offices'] ?? [];
        offices = data
            .map<OfficeModel>((e) => OfficeModel.fromJson(e))
            .toList();
        await OfficeService().cacheOffices(offices);
      }
    } catch (_) {
      offices = await OfficeService().getCachedOffices();
    }
  }

  Future<void> _fetchCars() async {
    try {
      final response = await http.get(
        Uri.parse('https://syr-trip-backend.vercel.app/api/cars'),
      );
      if (response.statusCode == 200) {
        final body = json.decode(response.body);
        final List data = body['cars'] ?? [];
        cars = data
            .map<TransportModel>((e) => TransportModel.fromJson(e))
            .toList();
        await CarService().cacheCars(cars);
      }
    } catch (_) {
      cars = await CarService().getCachedCars();
    }
  }

  Future<void> _loadFavorites() async {
    favs = await FavoritesController.loadFavorites();
    if (mounted) setState(() {});
  }

  Future<void> _refreshTransport() async {
    await _loadData();
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
        await _loadFavorites();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredTransports = cars.where((t) {
      final matchesSearch =
          _searchQuery.isEmpty ||
          t.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t.description.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          t.location.toLowerCase().contains(_searchQuery.toLowerCase());
      final matchesCity =
          _selectedCity == 'الكل' || t.location.contains(_selectedCity);
      return matchesSearch && matchesCity;
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: RefreshIndicator(
        onRefresh: _refreshTransport,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
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
                        hintText: 'ابحث عن سيارة أو مدينة...',
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
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: GridView.builder(
                  itemCount: filteredTransports.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.74,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemBuilder: (context, i) {
                    final t = filteredTransports[i];
                    return CustomCard(
                      id: t.id,
                      title: t.name,
                      subtitle: t.location,
                      imagePath: t.images.isNotEmpty
                          ? t.images.first
                          : 'assets/images/placeholder.WebP',
                      rating: t.rating,
                      price: t.fare,
                      type: 'car',
                      trailing: _buildTrailing(t.id),
                      onTap: () {
                        Navigator.pushNamed(
                          context,
                          DetailView.routeName,
                          arguments: DetailArguments(
                            id: t.id,
                            name: t.name,
                            description: t.description,
                            images: t.images.isNotEmpty
                                ? t.images
                                : ['assets/images/placeholder.WebP'],
                            rating: t.rating,
                            type: DetailType.transport,
                            phoneNumber: null,
                            locationUrl: t.location,
                            vehicleType: t.type,
                            pricePerNight: t.fare,
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
