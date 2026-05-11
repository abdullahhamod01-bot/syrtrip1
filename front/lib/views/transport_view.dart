import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../models/transport_model.dart';
import '../widgets/custom_card.dart';
import '../controllers/favorites_controller.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';
import '../providers/transport_filter_provider.dart';
import '../services/transport_service.dart';

class TransportView extends StatefulWidget {
  const TransportView({super.key});

  @override
  State<TransportView> createState() => _TransportViewState();
}

class _TransportViewState extends State<TransportView> {
  List<String> favs = [];
  List<TransportModel> transports = [];
  bool isLoading = true;

  final filters = ["تاكسي", "حافلة", "توصيل خاص", "سياحي", "مشترك"];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    favs = await FavoritesController.loadFavorites();
    transports = await fetchTransports();
    if (mounted) setState(() => isLoading = false);
  }

  Future<List<TransportModel>> fetchTransports() async {
    try {
      final response = await http.get(Uri.parse('https://tourism-app-1-fs9e.onrender.com/api/transport'));
      if (response.statusCode == 200) {
        final List data = json.decode(response.body);
        final list = data.map((e) => TransportModel.fromJson(e)).toList();
        await TransportService().cacheTransport(list); // حفظ في sqflite
        return list;
      } else {
        throw Exception('فشل تحميل وسائل النقل');
      }
    } catch (e) {
      // في حال فشل الاتصال، استخدم الكاش
      return await TransportService().getCachedTransport();
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
    final selectedFilter = context.watch<TransportFilterProvider>().selectedFilter;
    final filteredTransports = selectedFilter == null
        ? transports
        : transports.where((t) => t.type.contains(selectedFilter)).toList();

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
                              context.read<TransportFilterProvider>().selectFilter(filter);
                            },
                            icon: CircleAvatar(
                              radius: 12,
                              backgroundColor: isSelected ? Colors.white : const Color(0xFF00C2FF),
                              child: Icon(Icons.filter_alt, size: 14, color: isSelected ? Colors.black : Colors.white),
                            ),
                            label: Text(
                              filter,
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
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
                          imagePath: t.images.first,
                          rating: t.rating,
                          trailing: _buildTrailing(t.id),
                          onTap: () {
                            // يمكنك فتح صفحة تفاصيل لاحقًا
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
