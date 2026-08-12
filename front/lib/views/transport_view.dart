import 'package:flutter/material.dart';
import '../models/transport_model.dart';
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

  final fixedCars = <TransportModel>[
    TransportModel(
      id: 'lexus-1',
      name: 'ليكزيس LX 600',
      description: 'سيارة فاخرة مع مكتب المدينة لخدمات الرحلات الخاصة.',
      images: ['assets/images/placeholder.WebP'],
      location: 'مكتب المدينة',
      rating: 4.8,
      type: 'Lexus',
      fare: 150.0,
    ),
    TransportModel(
      id: 'mercedes-1',
      name: 'مرسيدس GLE 450',
      description: 'سيارة فاخرة مع مكتب النور لتجربة قيادة مميزة.',
      images: ['assets/images/placeholder.WebP'],
      location: 'مكتب النور',
      rating: 4.7,
      type: 'Mercedes',
      fare: 140.0,
    ),
    TransportModel(
      id: 'bmw-1',
      name: 'بي إم دبليو X5',
      description: 'سيارة رياضية فاخرة مع مكتب المدينة لرحلات عائلية.',
      images: ['assets/images/placeholder.WebP'],
      location: 'مكتب المدينة',
      rating: 4.6,
      type: 'BMW',
      fare: 130.0,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _loadFavorites();
  }

  Future<void> _loadFavorites() async {
    favs = await FavoritesController.loadFavorites();
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
        await _loadFavorites();
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final filteredTransports = fixedCars;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: GridView.builder(
                itemCount: filteredTransports.length,
                gridDelegate:
                    const SliverGridDelegateWithFixedCrossAxisCount(
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
    );
  }
}

   
