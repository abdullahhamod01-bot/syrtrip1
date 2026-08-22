import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';
import '../controllers/favorites_controller.dart';
import '../models/place_model.dart';
import 'detail_view.dart';

class EventsView extends StatefulWidget {
  const EventsView({super.key});

  @override
  State<EventsView> createState() => _EventsViewState();
}

class _EventsViewState extends State<EventsView> {
  List<String> favs = [];
  List<Map<String, dynamic>> _events = [];
  bool _isLoading = true;
  String _searchQuery = '';
  String _selectedCity = 'الكل';
  String _selectedCategory = 'all';
  final List<String> _cities = [
    'الكل',
    'دمشق',
    'حماه',
    'حلب',
    'اللاذقية',
    'حمص',
    'طرطوس',
    'السويداء',
    'تدمر',
  ];

  List<Map<String, dynamic>> get _categories {
    return [
      {'key': 'all', 'labelAr': 'الكل', 'labelEn': 'All', 'icon': Icons.apps},
      {
        'key': 'favorites',
        'labelAr': 'المفضلة',
        'labelEn': 'Favorites',
        'icon': Icons.favorite,
      },
      {
        'key': 'culture',
        'labelAr': 'ثقافة',
        'labelEn': 'Culture',
        'icon': Icons.palette,
      },
      {
        'key': 'music',
        'labelAr': 'موسيقى',
        'labelEn': 'Music',
        'icon': Icons.music_note,
      },
      {
        'key': 'sports',
        'labelAr': 'رياضة',
        'labelEn': 'Sports',
        'icon': Icons.sports,
      },
      {
        'key': 'food',
        'labelAr': 'طعام',
        'labelEn': 'Food',
        'icon': Icons.restaurant,
      },
      {
        'key': 'heritage',
        'labelAr': 'تراث',
        'labelEn': 'Heritage',
        'icon': Icons.account_balance,
      },
    ];
  }

  List<Map<String, dynamic>> get _filteredEvents {
    return _events.where((event) {
      bool matchesCategory;
      if (_selectedCategory == 'all') {
        matchesCategory = true;
      } else if (_selectedCategory == 'favorites') {
        matchesCategory = favs.contains(event['id'].toString());
      } else {
        matchesCategory = event['category'] == _selectedCategory;
      }
      final matchesSearch =
          _searchQuery.isEmpty ||
          event['titleAr'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          event['titleEn'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          ) ||
          event['city'].toString().toLowerCase().contains(
            _searchQuery.toLowerCase(),
          );
      final matchesCity =
          _selectedCity == 'الكل' || event['city'] == _selectedCity;
      return matchesCategory && matchesSearch && matchesCity;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _loadFavorites();
    _loadEvents();
  }

  Future<void> _loadFavorites() async {
    favs = await FavoritesController.loadFavorites();
    if (mounted) setState(() {});
  }

  Future<void> _loadEvents() async {
    try {
      final response = await http.get(
        Uri.parse('https://syr-trip-backend.vercel.app/api/events'),
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final List<dynamic> data = decoded['events'] ?? [];
        final loadedEvents = data
            .map<Map<String, dynamic>>((event) => _normalizeEvent(event))
            .toList();

        if (mounted) {
          setState(() {
            _events = loadedEvents;
            _isLoading = false;
          });
        }
        return;
      }
    } catch (_) {
      // تجاهل الخطأ وسيبقى العرض على البيانات الاحتياطية
    }

    if (mounted) {
      setState(() {
        _events = [];
        _isLoading = false;
      });
    }
  }

  Future<void> _refreshEvents() async {
    await Future.wait([_loadFavorites(), _loadEvents()]);
  }

  Map<String, dynamic> _normalizeEvent(Map<String, dynamic> event) {
    final rawName = (event['name'] ?? event['titleAr'] ?? 'فعالية').toString();
    final rawDescription =
        (event['description'] ?? event['descriptionAr'] ?? 'لا توجد تفاصيل')
            .toString();
    final rawLocation = (event['location'] ?? 'غير محدد').toString();
    final rawDate = (event['startDate'] ?? event['date'] ?? '').toString();
    final rawCategory = (event['type'] ?? event['category'] ?? 'culture')
        .toString();
    final rawImages = event['images'];
    final imageUrls = rawImages is List
        ? rawImages
              .map((image) => image.toString().trim())
              .where((image) => image.isNotEmpty)
              .toList()
        : <String>[];
    const fallbackImage =
        'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800';
    final imageUrl = imageUrls.isNotEmpty ? imageUrls.first : fallbackImage;

    final city = _extractCity(rawLocation);
    final type = _mapCategory(rawCategory);
    final dateValue = _parseDate(rawDate);
    final priceValue = event['price'];

    return {
      'id': event['id'] ?? rawName,
      'titleAr': rawName,
      'titleEn': rawName,
      'descriptionAr': rawDescription,
      'descriptionEn': rawDescription,
      'city': city,
      'cityEn': _cityToEnglish(city),
      'date': dateValue,
      'time': (event['time'] ?? '00:00').toString(),
      'category': type,
      'image': imageUrl,
      'images': imageUrls.isNotEmpty ? imageUrls : [fallbackImage],
      'location': rawLocation,
      'locationEn': rawLocation,
      'latitude': PlaceModel.parseLatitude(event),
      'longitude': PlaceModel.parseLongitude(event),
      'price': _formatPrice(priceValue),
      'priceEn': _formatPrice(priceValue),
    };
  }

  String _extractCity(String location) {
    if (location.contains('-')) {
      return location.split('-').first.trim();
    }
    return location.trim().isEmpty ? 'دمشق' : location.trim();
  }

  String _mapCategory(String value) {
    final normalized = value.toLowerCase();
    if (normalized.contains('موسي') || normalized.contains('music')) {
      return 'music';
    }
    if (normalized.contains('رياض') || normalized.contains('sport')) {
      return 'sports';
    }
    if (normalized.contains('طعام') || normalized.contains('food')) {
      return 'food';
    }
    if (normalized.contains('تراث') || normalized.contains('heritage')) {
      return 'heritage';
    }
    return 'culture';
  }

  String _cityToEnglish(String city) {
    switch (city) {
      case 'دمشق':
        return 'Damascus';
      case 'حلب':
        return 'Aleppo';
      case 'حماه':
        return 'Hama';
      case 'اللاذقية':
        return 'Latakia';
      case 'حمص':
        return 'Homs';
      case 'طرطوس':
        return 'Tartus';
      case 'السويداء':
        return 'Sweida';
      case 'تدمر':
        return 'Palmyra';
      default:
        return city;
    }
  }

  String _parseDate(String rawDate) {
    if (rawDate.isEmpty) return 'غير محدد';
    final parsed = DateTime.tryParse(rawDate);
    if (parsed == null) return rawDate;
    return '${parsed.year}-${parsed.month.toString().padLeft(2, '0')}-${parsed.day.toString().padLeft(2, '0')}';
  }

  String _formatPrice(dynamic value) {
    if (value == null) return 'مجاني';
    final number = num.tryParse(value.toString());
    if (number == null) return value.toString();
    if (number == 0) return 'مجاني';
    return '${number.toInt()} ل.س';
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = Provider.of<AppProvider>(context);
    final isAr = appProvider.isArabic;
    final isDark = appProvider.isDarkMode;
    final filteredEvents = _filteredEvents;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'فعاليات سوريا' : 'Syria Events',
          style: const TextStyle(
            fontFamily: 'Tajawal',
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_month),
            onPressed: () => _showCalendarView(context, isAr),
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshEvents,
              child: Column(
                children: [
                  // ===== Search + City Filter =====
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
                              hintText: isAr
                                  ? 'ابحث عن فعالية...'
                                  : 'Search for an event...',
                              hintStyle: const TextStyle(fontFamily: 'Tajawal'),
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
                              if (value != null) {
                                setState(() => _selectedCity = value);
                              }
                            },
                            decoration: InputDecoration(
                              labelText: isAr ? 'المدينة' : 'City',
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // ===== Categories =====
                  Container(
                    height: 50,
                    padding: const EdgeInsets.symmetric(horizontal: 8),
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        final isSelected = _selectedCategory == cat['key'];
                        return Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ChoiceChip(
                            label: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  cat['icon'],
                                  size: 16,
                                  color: isSelected
                                      ? Colors.white
                                      : Colors.grey[600],
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  isAr ? cat['labelAr'] : cat['labelEn'],
                                  style: TextStyle(
                                    color: isSelected ? Colors.white : null,
                                    fontFamily: 'Tajawal',
                                  ),
                                ),
                              ],
                            ),
                            selected: isSelected,
                            selectedColor: const Color(0xFF1B5E20),
                            backgroundColor: isDark
                                ? Colors.grey[800]
                                : Colors.grey[200],
                            onSelected: (selected) {
                              if (selected)
                                setState(() => _selectedCategory = cat['key']);
                            },
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 8),

                  // ===== Events List =====
                  Expanded(
                    child: filteredEvents.isEmpty
                        ? _buildEmptyState(isAr)
                        : ListView.builder(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            itemCount: filteredEvents.length,
                            itemBuilder: (context, index) => _buildEventCard(
                              context,
                              filteredEvents[index],
                              isAr,
                              isDark,
                            ),
                          ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildEventCard(
    BuildContext context,
    Map<String, dynamic> event,
    bool isAr,
    bool isDark,
  ) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: InkWell(
        onTap: () => _showEventDetails(context, event, isAr),
        borderRadius: BorderRadius.circular(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Stack(
                children: [
                  Image.network(
                    event['image'],
                    height: 180,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => Container(
                      height: 180,
                      color: Colors.grey[300],
                      child: const Icon(
                        Icons.image_not_supported,
                        size: 50,
                        color: Colors.grey,
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 0,
                    left: 0,
                    right: 0,
                    child: Container(
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [
                            Colors.transparent,
                            Colors.black.withOpacity(0.7),
                          ],
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    right: isAr ? 12 : null,
                    left: isAr ? null : 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getCategoryColor(
                          event['category'],
                        ).withOpacity(0.9),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        _getCategoryLabel(event['category'], isAr),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          fontFamily: 'Tajawal',
                        ),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 12,
                    right: isAr ? 12 : null,
                    left: isAr ? null : 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.calendar_today,
                            size: 14,
                            color: Color(0xFF1B5E20),
                          ),
                          const SizedBox(width: 4),
                          Text(
                            event['date'],
                            style: const TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1B5E20),
                              fontFamily: 'Tajawal',
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isAr ? event['titleAr'] : event['titleEn'],
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Tajawal',
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    isAr ? event['descriptionAr'] : event['descriptionEn'],
                    style: TextStyle(
                      fontSize: 14,
                      color: isDark ? Colors.grey[400] : Colors.grey[600],
                      fontFamily: 'Tajawal',
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildInfoChip(
                        Icons.location_on,
                        isAr ? event['city'] : event['cityEn'],
                        Colors.red,
                      ),
                      const SizedBox(width: 8),
                      _buildInfoChip(
                        Icons.access_time,
                        event['time'],
                        Colors.blue,
                      ),
                      const SizedBox(width: 8),
                      _buildInfoChip(
                        Icons.attach_money,
                        isAr ? event['price'] : event['priceEn'],
                        Colors.green,
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoChip(IconData icon, String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: color),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: color,
              fontWeight: FontWeight.w600,
              fontFamily: 'Tajawal',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(bool isAr) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, size: 80, color: Colors.grey[400]),
          const SizedBox(height: 16),
          Text(
            isAr ? 'لا توجد فعاليات' : 'No events found',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontFamily: 'Tajawal',
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isAr
                ? 'جرب تغيير الفلتر أو البحث'
                : 'Try changing the filter or search',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[500],
              fontFamily: 'Tajawal',
            ),
          ),
        ],
      ),
    );
  }

  List<String> _eventImages(Map<String, dynamic> event) {
    final images = event['images'];
    if (images is List) {
      final imageUrls = images
          .map((image) => image.toString().trim())
          .where((image) => image.isNotEmpty)
          .toList();
      if (imageUrls.isNotEmpty) return imageUrls;
    }

    final image = event['image']?.toString().trim();
    return image == null || image.isEmpty ? const [] : [image];
  }

  void _showEventDetails(
    BuildContext context,
    Map<String, dynamic> event,
    bool isAr,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.7,
        maxChildSize: 0.9,
        minChildSize: 0.5,
        expand: false,
        builder: (context, scrollController) {
          final images = _eventImages(event);
          var currentImageIndex = 0;

          return StatefulBuilder(
            builder: (context, setModalState) => SingleChildScrollView(
              controller: scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Center(
                    child: Container(
                      margin: const EdgeInsets.only(top: 12, bottom: 8),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(
                      top: Radius.circular(24),
                    ),
                    child: SizedBox(
                      height: 250,
                      width: double.infinity,
                      child: PageView.builder(
                        itemCount: images.length,
                        onPageChanged: (index) =>
                            setModalState(() => currentImageIndex = index),
                        itemBuilder: (context, index) => Image.network(
                          images[index],
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => Container(
                            color: Colors.grey[300],
                            child: const Icon(
                              Icons.image_not_supported,
                              size: 60,
                              color: Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                  if (images.length > 1)
                    Padding(
                      padding: const EdgeInsets.only(top: 10),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          images.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 200),
                            margin: const EdgeInsets.symmetric(horizontal: 3),
                            width: index == currentImageIndex ? 20 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: index == currentImageIndex
                                  ? const Color(0xFF1B5E20)
                                  : Colors.grey[300],
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                      ),
                    ),
                  Padding(
                    padding: const EdgeInsets.all(20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: _getCategoryColor(
                              event['category'],
                            ).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _getCategoryLabel(event['category'], isAr),
                            style: TextStyle(
                              color: _getCategoryColor(event['category']),
                              fontWeight: FontWeight.bold,
                              fontFamily: 'Tajawal',
                            ),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          isAr ? event['titleAr'] : event['titleEn'],
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Tajawal',
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          isAr
                              ? event['descriptionAr']
                              : event['descriptionEn'],
                          style: TextStyle(
                            fontSize: 16,
                            color: Colors.grey[600],
                            fontFamily: 'Tajawal',
                            height: 1.5,
                          ),
                        ),
                        const SizedBox(height: 20),
                        _buildDetailCard(
                          Icons.calendar_today,
                          isAr ? 'التاريخ' : 'Date',
                          event['date'],
                          Colors.blue,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailCard(
                          Icons.access_time,
                          isAr ? 'الوقت' : 'Time',
                          event['time'],
                          Colors.orange,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailCard(
                          Icons.location_on,
                          isAr ? 'الموقع' : 'Location',
                          isAr ? event['location'] : event['locationEn'],
                          Colors.red,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailCard(
                          Icons.attach_money,
                          isAr ? 'السعر' : 'Price',
                          isAr ? event['price'] : event['priceEn'],
                          Colors.green,
                        ),
                        const SizedBox(height: 12),
                        _buildDetailCard(
                          Icons.location_city,
                          isAr ? 'المدينة' : 'City',
                          isAr ? event['city'] : event['cityEn'],
                          Colors.purple,
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () async {
                                  final id = event['id'].toString();
                                  await FavoritesController.toggleFavorite(id);
                                  await _loadFavorites();
                                  final isNowFav =
                                      await FavoritesController.isFavorite(id);
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(
                                        isAr
                                            ? (isNowFav
                                                  ? 'أضيفت إلى المفضلة'
                                                  : 'أزيلت من المفضلة')
                                            : (isNowFav
                                                  ? 'Added to favorites'
                                                  : 'Removed from favorites'),
                                      ),
                                    ),
                                  );
                                },
                                icon: Icon(
                                  favs.contains(event['id'])
                                      ? Icons.favorite
                                      : Icons.favorite_border,
                                ),
                                label: Text(
                                  favs.contains(event['id'])
                                      ? (isAr
                                            ? 'إزالة من المفضلة'
                                            : 'Remove from Favorites')
                                      : (isAr
                                            ? 'إضافة للمفضلة'
                                            : 'Add to Favorites'),
                                ),
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: ElevatedButton.icon(
                                onPressed: () => Navigator.pushNamed(
                                  context,
                                  '/favorites-map',
                                  arguments: DetailArguments(
                                    id: event['id'].toString(),
                                    name:
                                        (isAr
                                                ? event['titleAr']
                                                : event['titleEn'])
                                            .toString(),
                                    description:
                                        (isAr
                                                ? event['descriptionAr']
                                                : event['descriptionEn'])
                                            .toString(),
                                    images: _eventImages(event),
                                    rating: 0,
                                    type: DetailType.attraction,
                                    locationUrl: event['location']?.toString(),
                                    latitude: PlaceModel.parseCoordinate(
                                      event['latitude'],
                                    ),
                                    longitude: PlaceModel.parseCoordinate(
                                      event['longitude'],
                                    ),
                                  ),
                                ),
                                icon: const Icon(Icons.location_on),
                                label: Text(
                                  isAr ? 'عرض الموقع' : 'View Location',
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 14,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildDetailCard(
    IconData icon,
    String label,
    String value,
    Color color,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.05),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[600],
                    fontFamily: 'Tajawal',
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                    fontFamily: 'Tajawal',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showCalendarView(BuildContext context, bool isAr) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          isAr ? 'تقويم الفعاليات' : 'Events Calendar',
          style: const TextStyle(
            fontFamily: 'Tajawal',
            fontWeight: FontWeight.bold,
          ),
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.builder(
            shrinkWrap: true,
            itemCount: _events.length,
            itemBuilder: (context, index) {
              final event = _events[index];
              return ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: _getCategoryColor(
                      event['category'],
                    ).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(
                    _getCategoryIcon(event['category']),
                    color: _getCategoryColor(event['category']),
                  ),
                ),
                title: Text(
                  isAr ? event['titleAr'] : event['titleEn'],
                  style: const TextStyle(
                    fontFamily: 'Tajawal',
                    fontWeight: FontWeight.w600,
                  ),
                ),
                subtitle: Text(
                  '${event['date']} - ${isAr ? event['city'] : event['cityEn']}',
                  style: const TextStyle(fontFamily: 'Tajawal', fontSize: 12),
                ),
                trailing: Text(
                  event['date'].toString().substring(5),
                  style: TextStyle(
                    fontFamily: 'Tajawal',
                    fontWeight: FontWeight.bold,
                    color: _getCategoryColor(event['category']),
                  ),
                ),
              );
            },
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(isAr ? 'إغلاق' : 'Close'),
          ),
        ],
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category) {
      case 'favorites':
        return Colors.pink;
      case 'culture':
        return Colors.purple;
      case 'music':
        return Colors.blue;
      case 'sports':
        return Colors.orange;
      case 'food':
        return Colors.green;
      case 'heritage':
        return Colors.brown;
      default:
        return Colors.grey;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category) {
      case 'favorites':
        return Icons.favorite;
      case 'culture':
        return Icons.palette;
      case 'music':
        return Icons.music_note;
      case 'sports':
        return Icons.sports;
      case 'food':
        return Icons.restaurant;
      case 'heritage':
        return Icons.account_balance;
      default:
        return Icons.event;
    }
  }

  String _getCategoryLabel(String category, bool isAr) {
    switch (category) {
      case 'favorites':
        return isAr ? 'المفضلة' : 'Favorites';
      case 'culture':
        return isAr ? 'ثقافة' : 'Culture';
      case 'music':
        return isAr ? 'موسيقى' : 'Music';
      case 'sports':
        return isAr ? 'رياضة' : 'Sports';
      case 'food':
        return isAr ? 'طعام' : 'Food';
      case 'heritage':
        return isAr ? 'تراث' : 'Heritage';
      default:
        return isAr ? 'عام' : 'General';
    }
  }
}
