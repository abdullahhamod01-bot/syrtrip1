import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:SyrTrip/widgets/custom_appbar.dart';
import 'package:SyrTrip/widgets/main_drawer.dart';
import '../models/hotel_model.dart';
import '../widgets/custom_card.dart';
import '../controllers/favorites_controller.dart';
import '../providers/hotelas_filter_provider.dart';
import '../services/hotel_service.dart';
import 'detail_view.dart';

class HotelsView extends StatefulWidget {
  const HotelsView({super.key});

  @override
  State<HotelsView> createState() => _HotelsViewState();
}

class _HotelsViewState extends State<HotelsView> {
  List<String> favs = [];
  List<HotelModel> hotels = [];
  bool isLoading = true;
  String? errorMessage;

  final filters = ["فلترة حسب الطقس", "فلترة حسب الفصل", "فلترة حسب المدينة"];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    favs = await FavoritesController.loadFavorites();
    await _fetchHotels();
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔥 هون التعديل الرئيسي — بدل ما نبعت HTTP مباشرة، نستخدم HotelService
  // ═══════════════════════════════════════════════════════════════
  Future<void> _fetchHotels() async {
    try {
      // ✅ HotelService بيعمل كلشي: API → JSON → HotelModel → SQLite Cache
      final hotelsList = await HotelService().getHotels();

      if (mounted) {
        setState(() {
          hotels = hotelsList;
          isLoading = false;
          errorMessage = null;
        });
      }
    } catch (e) {
      // ⚠️ لو فشل الـ API (offline أو خطأ)، HotelService جواته بيجيب من الكاش
      // بس لو بدك تتأكد، بتقدر تجيب من الكاش يدوياً:
      try {
        final cached = await HotelService().getCachedHotels();
        if (mounted) {
          setState(() {
            hotels = cached;
            isLoading = false;
            errorMessage = cached.isEmpty ? 'ما فيه بيانات مخزنة' : null;
          });
        }
      } catch (cacheError) {
        if (mounted) {
          setState(() {
            isLoading = false;
            errorMessage = 'فشل تحميل الفنادق';
          });
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // 🔄 Pull-to-Refresh — بيجيب بيانات جديدة من السيرفر
  // ═══════════════════════════════════════════════════════════════
  Future<void> _refreshHotels() async {
    setState(() => isLoading = true);
    await _fetchHotels();
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
    final selectedFilter = context.watch<FilterProvider>().selectedFilter;

    final filteredHotels = selectedFilter == null
        ? hotels
        : hotels.where((h) => h.location.contains("دمشق")).toList();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),

      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshHotels, // ⬅️ سحب للأسفل بيعيد التحميل
              child: errorMessage != null && hotels.isEmpty
                  ? _buildErrorWidget()
                  : Column(
                      children: [
                        // ─── الفلاتر ───
                        SizedBox(
                          height: 60,
                          child: SingleChildScrollView(
                            scrollDirection: Axis.horizontal,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 10,
                            ),
                            child: Row(
                              children: filters.map((filter) {
                                final isSelected = selectedFilter == filter;

                                return Padding(
                                  padding: const EdgeInsets.only(right: 8),
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      context.read<FilterProvider>().selectFilter(
                                        filter,
                                      );
                                    },
                                    icon: CircleAvatar(
                                      radius: 12,
                                      backgroundColor: isSelected
                                          ? Colors.white
                                          : const Color(0xFF00C2FF),
                                      child: Icon(
                                        Icons.filter_alt,
                                        size: 14,
                                        color: isSelected ? Colors.black : Colors.white,
                                      ),
                                    ),
                                    label: Text(
                                      filter,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: isSelected
                                          ? const Color(0xFF00C2FF)
                                          : Colors.white,
                                      foregroundColor: isSelected
                                          ? Colors.white
                                          : Colors.black87,
                                      elevation: 1,
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 12,
                                      ),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(25),
                                        side: const BorderSide(
                                          color: Color(0xFF00C2FF),
                                          width: 1,
                                        ),
                                      ),
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ),
                        ),

                        // ─── Grid ───
                        Expanded(
                          child: Padding(
                            padding: const EdgeInsets.all(12),
                            child: GridView.builder(
                              itemCount: filteredHotels.length,
                              gridDelegate:
                                  const SliverGridDelegateWithFixedCrossAxisCount(
                                    crossAxisCount: 2,
                                    childAspectRatio: 0.74,
                                    crossAxisSpacing: 12,
                                    mainAxisSpacing: 12,
                                  ),
                              itemBuilder: (context, i) {
                                final h = filteredHotels[i];

                                return CustomCard(
                                  id: h.id,
                                  title: h.name,
                                  subtitle: h.location,
                                  imagePath: h.images.isNotEmpty ? h.images.first : '',
                                  rating: h.rating,
                                  type: "hotel",
                                  price: h.pricePerNight,
                                  trailing: _buildTrailing(h.id),
                                  onTap: () {
                                    Navigator.pushNamed(
                                      context,
                                      DetailView.routeName,
                                      arguments: DetailArguments(
                                        id: h.id,
                                        name: h.name,
                                        description: h.description,
                                        images: h.images,
                                        rating: h.rating,
                                        phoneNumber: h.phoneNumber,
                                        pricePerNight: h.pricePerNight,
                                        locationUrl: h.location,
                                        type: DetailType.hotel,
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

  Widget _buildErrorWidget() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.wifi_off, size: 64, color: Colors.grey),
          const SizedBox(height: 16),
          Text(
            errorMessage ?? 'فشل الاتصال',
            style: const TextStyle(fontSize: 16, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: _refreshHotels,
            child: const Text('إعادة المحاولة'),
          ),
        ],
      ),
    );
  }
}