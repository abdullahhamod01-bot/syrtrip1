import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../controllers/favorites_controller.dart';
import '../widgets/custom_card.dart';
import 'detail_view.dart';
import '../models/hotel_model.dart';
import '../models/restaurant_model.dart';
import '../models/place_model.dart';
import '../models/transport_model.dart';
import '../services/hotel_service.dart';
import '../services/restaurant_service.dart';
import '../services/place_service.dart';
import '../services/transport_service.dart';

class FavoritesView extends StatefulWidget {
  const FavoritesView({super.key});
  @override
  State<FavoritesView> createState() => _FavoritesViewState();
}

class _FavoritesViewState extends State<FavoritesView> {
  List<String> favs = [];
  List<dynamic> allItems = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAll();
  }

  Future<void> _loadAll() async {
    favs = await FavoritesController.loadFavorites();
    final results = await Future.wait([
      fetchHotels(),
      fetchRestaurants(),
      fetchAttractions(),
      fetchTransports(),
    ]);

    final list = <Map<String, dynamic>>[];

    for (var h in results[0]) {
      if (favs.contains(h.id)) list.add({'type': 'hotel', 'item': h});
    }
    for (var r in results[1]) {
      if (favs.contains(r.id)) list.add({'type': 'restaurant', 'item': r});
    }
    for (var p in results[2]) {
      if (favs.contains(p.id)) list.add({'type': 'attraction', 'item': p});
    }
    for (var t in results[3]) {
      if (favs.contains(t.id)) list.add({'type': 'transport', 'item': t});
    }

    if (mounted) {
      setState(() {
        allItems = list;
        isLoading = false;
      });
    }
  }

  Future<List<HotelModel>> fetchHotels() async {
    try {
      final res = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/hotels'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data.map<HotelModel>((e) => HotelModel.fromJson(e)).toList();
        await HotelService().cacheHotels(list);
        return list;
      }
    } catch (_) {}
    return await HotelService().getCachedHotels();
  }

  Future<List<RestaurantModel>> fetchRestaurants() async {
    try {
      final res = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/restaurants'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data.map<RestaurantModel>((e) => RestaurantModel.fromJson(e)).toList();
        await RestaurantService().cacheRestaurants(list);
        return list;
      }
    } catch (_) {}
    return await RestaurantService().getCachedRestaurants();
  }

  Future<List<PlaceModel>> fetchAttractions() async {
    try {
      final res = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/places?category=attraction'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data.map<PlaceModel>((e) => PlaceModel.fromJson(e)).toList();
        await PlaceService().cacheAttractions(list);
        return list;
      }
    } catch (_) {}
    return await PlaceService().getCachedAttractions();
  }

  Future<List<TransportModel>> fetchTransports() async {
    try {
      final res = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/transport'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        final list = data.map<TransportModel>((e) => TransportModel.fromJson(e)).toList();
        await TransportService().cacheTransport(list);
        return list;
      }
    } catch (_) {}
    return await TransportService().getCachedTransport();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      appBar: AppBar(backgroundColor: const Color.fromARGB(255, 0, 171, 9), title: const Text('المفضلة'), centerTitle: true),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : Padding(
              padding: const EdgeInsets.all(12),
              child: allItems.isEmpty
                  ? Center(child: Text('لا توجد عناصر مفضلة بعد', style: TextStyle(color: Colors.grey[600])))
                  : ListView.builder(
                      itemCount: allItems.length,
                      itemBuilder: (context, i) {
                        final m = allItems[i];
                        final item = m['item'];
                        final type = m['type'];

                        return GestureDetector(
                          onTap: () {
                            Navigator.pushNamed(
                              context,
                              DetailView.routeName,
                              arguments: DetailArguments(
                                id: item.id,
                                name: item.name,
                                description: item.description,
                                images: item.images,
                                rating: item.rating,
                                type: type == 'hotel'
                                    ? DetailType.hotel
                                    : type == 'restaurant'
                                        ? DetailType.restaurant
                                        : type == 'attraction'
                                            ? DetailType.attraction
                                            : DetailType.transport,
                                phoneNumber: item.phoneNumber,
                                locationUrl: item.location,
                                pricePerNight: item is HotelModel ? item.pricePerNight : null,
                              ),
                            );
                          },
                          child: CustomCard(
                            id: item.id,
                            title: item.name,
                            subtitle: item.location,
                            imagePath: item.images.isNotEmpty ? item.images.first : 'assets/images/placeholder.WebP',
                            rating: item.rating,
                            trailing: IconButton(
                              icon: const Icon(Icons.delete, color: Colors.red),
                              onPressed: () async {
                                await FavoritesController.toggleFavorite(item.id);
                                await _loadAll();
                              },
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
