import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:SyrTrip/controllers/bookings_controller.dart'
    show BookingsController;
import 'package:url_launcher/url_launcher.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';
import '../controllers/reviews_controller.dart';
import '../controllers/favorites_controller.dart';
import '../providers/app_provider.dart';
import 'paypal_payment_view.dart';

enum DetailType { hotel, restaurant, attraction, transport }

class DetailArguments {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final double rating;
  final DetailType type;
  final String? phoneNumber;
  final String? locationUrl;
  final String? vehicleType;
  final double? pricePerNight;

  DetailArguments({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.rating,
    required this.type,
    this.phoneNumber,
    this.locationUrl,
    this.vehicleType,
    this.pricePerNight,
  });
}

class DetailView extends StatefulWidget {
  static const routeName = '/details';

  static bool isRemoteImage(String path) {
    final trimmed = path.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://');
  }

  static ImageProvider resolveImageProvider(String path) {
    if (isRemoteImage(path)) {
      return NetworkImage(path);
    }
    return AssetImage(path);
  }

  const DetailView({super.key});

  @override
  State<DetailView> createState() => _DetailViewState();
}

class _DetailViewState extends State<DetailView> {
  final _controller = TextEditingController();
  final _pageController = PageController();
  int selectedStars = 0;
  int currentImageIndex = 0;
  bool isFavorite = false;
  bool _isLoadingReviews = true;
  List<ReviewItem> _reviews = [];

  bool get isCommentValid =>
      selectedStars > 0 && _controller.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () async {
      final args =
          ModalRoute.of(context)!.settings.arguments as DetailArguments;
      final fav = await FavoritesController.isFavorite(args.id);
      if (mounted) {
        setState(() => isFavorite = fav);
        _loadReviews(args);
      }
    });
  }

  Future<void> _loadReviews(DetailArguments args) async {
    setState(() => _isLoadingReviews = true);
    final reviews = await ReviewsController.getReviews(
      type: args.type,
      itemId: args.id,
    );

    if (mounted) {
      setState(() {
        _reviews = reviews;
        _isLoadingReviews = false;
      });
    }
  }

  Future<void> _submitReview(DetailArguments args) async {
    if (!isCommentValid) return;

    final result = await ReviewsController.submitReview(
      type: args.type,
      itemId: args.id,
      rating: selectedStars,
      comment: _controller.text.trim(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      _controller.clear();
      setState(() => selectedStars = 0);
      await _loadReviews(args);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('تمت إضافة التعليق بنجاح ✅')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(result['message'] ?? 'فشل إضافة التعليق')),
      );
    }
  }

  void _goToImage(int index) {
    if (index < 0 || index >= _safeImages.length) return;
    setState(() => currentImageIndex = index);
    _pageController.animateToPage(
      index,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
    );
  }

  Future<void> _bookByDateRange(
    DetailArguments args, {
    required String itemType,
  }) async {
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 365)),
    );

    if (picked == null) return;

    final days = picked.end.difference(picked.start).inDays + 1;
    final totalPrice = (args.pricePerNight ?? 0) * days;
    final booking = {
      'itemType': args.type == DetailType.hotel ? 'HOTEL' : 'CAR',
      if (args.type == DetailType.hotel) 'hotelId': args.id,
      if (args.type == DetailType.transport) 'carId': args.id,
      'startDate': picked.start.toIso8601String(),
      'endDate': picked.end.toIso8601String(),
    };

    final bookingResult = await BookingsController.addBooking(booking);
    if (!bookingResult['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(bookingResult['message'].toString())),
        );
      }
      return;
    }

    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => PayPalPaymentView(
          itemName: args.name,
          itemType: itemType,
          amount: '${totalPrice.toStringAsFixed(1)} ل.س',
        ),
      ),
    );

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          result == true
              ? 'تم الحجز والدفع بنجاح ✅'
              : 'تم حفظ الحجز (دون دفع) ✅',
        ),
      ),
    );
  }

  List<String> get _safeImages {
    final input =
        ModalRoute.of(context)?.settings.arguments as DetailArguments?;
    if (input == null || input.images.isEmpty) {
      return const ['assets/images/bridge.WebP'];
    }
    return input.images.where((image) => image.trim().isNotEmpty).toList();
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as DetailArguments;
    final isArabic = context.watch<AppProvider>().isArabic;

    return Scaffold(
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 220,
              child: Stack(
                children: [
                  PageView.builder(
                    controller: _pageController,
                    itemCount: _safeImages.length,
                    onPageChanged: (index) =>
                        setState(() => currentImageIndex = index),
                    itemBuilder: (context, index) {
                      final imagePath = _safeImages[index];
                      final imageProvider = DetailView.resolveImageProvider(
                        imagePath,
                      );

                      return Image(
                        image: imageProvider,
                        width: double.infinity,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            color: Colors.grey.shade200,
                            child: const Center(
                              child: Icon(
                                Icons.image_not_supported_outlined,
                                size: 52,
                                color: Colors.grey,
                              ),
                            ),
                          );
                        },
                      );
                    },
                  ),
                  if (_safeImages.length > 1) ...[
                    Positioned(
                      left: 8,
                      top: 90,
                      child: IconButton(
                        icon: const Icon(
                          Icons.arrow_back_ios,
                          color: Colors.white,
                        ),
                        onPressed: currentImageIndex > 0
                            ? () => _goToImage(currentImageIndex - 1)
                            : null,
                      ),
                    ),
                    Positioned(
                      right: 8,
                      top: 90,
                      child: IconButton(
                        icon: const Icon(
                          Icons.arrow_forward_ios,
                          color: Colors.white,
                        ),
                        onPressed: currentImageIndex < _safeImages.length - 1
                            ? () => _goToImage(currentImageIndex + 1)
                            : null,
                      ),
                    ),
                    Positioned(
                      bottom: 8,
                      right: 0,
                      left: 0,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: List.generate(
                          _safeImages.length,
                          (index) => AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: currentImageIndex == index ? 12 : 8,
                            height: 8,
                            decoration: BoxDecoration(
                              color: currentImageIndex == index
                                  ? Colors.white
                                  : Colors.white.withOpacity(0.5),
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          args.name,
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      IconButton(
                        icon: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          color: Colors.red,
                        ),
                        onPressed: () async {
                          await FavoritesController.toggleFavorite(args.id);
                          final fav = await FavoritesController.isFavorite(
                            args.id,
                          );
                          if (mounted) setState(() => isFavorite = fav);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    args.description,
                    style: TextStyle(fontSize: 14, color: Colors.grey.shade700),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          ...List.generate(
                            5,
                            (i) => Icon(
                              Icons.star,
                              size: 16,
                              color: i < args.rating.round()
                                  ? Colors.amber
                                  : Colors.grey[300],
                            ),
                          ),
                          const SizedBox(width: 6),
                          Text(
                            args.rating.toStringAsFixed(1),
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                      if ((args.type == DetailType.hotel ||
                              args.type == DetailType.restaurant) &&
                          args.phoneNumber != null)
                        InkWell(
                          onTap: () =>
                              launchUrl(Uri.parse('tel:${args.phoneNumber}')),
                          child: Text(
                            args.phoneNumber!,
                            style: const TextStyle(
                              fontSize: 18,
                              color: Colors.blue,
                              decoration: TextDecoration.underline,
                            ),
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 16),

                  // تفاصيل خاصة بالسيارات (نوع السيارة، السعر باليوم)
                  if (args.type == DetailType.transport) ...[
                    if (args.vehicleType != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 8.0),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.directions_car,
                              color: Colors.black54,
                            ),
                            const SizedBox(width: 6),
                            Text(
                              args.vehicleType!,
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),

                    if (args.pricePerNight != null)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 12.0),
                        child: Text(
                          '${args.pricePerNight!.toStringAsFixed(0)} ل.س / يوم',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.green,
                          ),
                        ),
                      ),

                    ElevatedButton.icon(
                      icon: const Icon(Icons.event_available),
                      label: Text(isArabic ? 'احجز السيارة' : 'Book car'),
                      onPressed: () =>
                          _bookByDateRange(args, itemType: 'استئجار سيارة'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C2FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (args.type == DetailType.hotel) ...[
                    ElevatedButton.icon(
                      icon: const Icon(Icons.event_available),
                      label: Text(isArabic ? 'احجز غرفة' : 'Book room'),
                      onPressed: () =>
                          _bookByDateRange(args, itemType: 'غرفة الفندق'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C2FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                  if (args.type == DetailType.restaurant) ...[
                    ElevatedButton.icon(
                      onPressed: () {
                        int selectedCount = args.type == DetailType.hotel
                            ? 1
                            : 2;
                        DateTime? selectedDate;
                        TimeOfDay? selectedTime;
                        double totalPrice = args.type == DetailType.hotel
                            ? (args.pricePerNight ?? 0) * 1
                            : 0;

                        showDialog(
                          context: context,
                          builder: (context) {
                            return StatefulBuilder(
                              builder: (context, setState) {
                                return AlertDialog(
                                  title: Text(
                                    args.type == DetailType.hotel
                                        ? 'تفاصيل حجز الغرفة'
                                        : 'تفاصيل حجز الطاولة',
                                  ),
                                  content: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(
                                        args.type == DetailType.hotel
                                            ? 'عدد الغرف (حتى 7):'
                                            : 'عدد الأشخاص (حتى 15):',
                                      ),
                                      Row(
                                        mainAxisAlignment:
                                            MainAxisAlignment.center,
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.remove),
                                            onPressed: selectedCount > 1
                                                ? () {
                                                    setState(() {
                                                      selectedCount--;
                                                      if (args.type ==
                                                          DetailType.hotel) {
                                                        totalPrice =
                                                            (args.pricePerNight ??
                                                                0) *
                                                            selectedCount;
                                                      }
                                                    });
                                                  }
                                                : null,
                                          ),
                                          Text(
                                            '$selectedCount',
                                            style: const TextStyle(
                                              fontSize: 18,
                                            ),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.add),
                                            onPressed:
                                                selectedCount <
                                                    (args.type ==
                                                            DetailType.hotel
                                                        ? 7
                                                        : 15)
                                                ? () {
                                                    setState(() {
                                                      selectedCount++;
                                                      if (args.type ==
                                                          DetailType.hotel) {
                                                        totalPrice =
                                                            (args.pricePerNight ??
                                                                0) *
                                                            selectedCount;
                                                      }
                                                    });
                                                  }
                                                : null,
                                          ),
                                        ],
                                      ),
                                      if (args.type == DetailType.hotel) ...[
                                        const SizedBox(height: 8),
                                        Text(
                                          'السعر الإجمالي: ${totalPrice.toStringAsFixed(1)} ل.س',
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                          ),
                                        ),
                                      ],
                                      const SizedBox(height: 16),
                                      const Text('موعد الحجز:'),
                                      ElevatedButton.icon(
                                        icon: const Icon(Icons.calendar_today),
                                        label: Text(
                                          selectedDate == null
                                              ? 'اختر التاريخ'
                                              : '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}',
                                        ),
                                        onPressed: () async {
                                          final now = DateTime.now();
                                          final picked = await showDatePicker(
                                            context: context,
                                            initialDate: now,
                                            firstDate: now,
                                            lastDate: now.add(
                                              const Duration(days: 365),
                                            ),
                                          );
                                          if (picked != null)
                                            setState(
                                              () => selectedDate = picked,
                                            );
                                        },
                                      ),
                                      const SizedBox(height: 8),
                                      const Text('الساعة:'),
                                      ElevatedButton.icon(
                                        icon: const Icon(Icons.access_time),
                                        label: Text(
                                          selectedTime == null
                                              ? 'اختر الساعة'
                                              : '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}',
                                        ),
                                        onPressed: () async {
                                          final picked = await showTimePicker(
                                            context: context,
                                            initialTime: TimeOfDay.now(),
                                          );
                                          if (picked != null)
                                            setState(
                                              () => selectedTime = picked,
                                            );
                                        },
                                      ),
                                    ],
                                  ),
                                  actions: [
                                    TextButton(
                                      child: const Text('إلغاء'),
                                      onPressed: () => Navigator.pop(context),
                                    ),
                                    ElevatedButton(
                                      child: const Text('تأكيد الحجز'),
                                      onPressed:
                                          (selectedDate != null &&
                                              selectedTime != null)
                                          ? () async {
                                              final timeStr =
                                                  '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}';
                                              final dateStr =
                                                  '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}';
                                              final booking = {
                                                'itemType': 'RESTAURANT',
                                                'restaurantId': args.id,
                                                'bookingTime': timeStr,
                                              };

                                              final bookingResult =
                                                  await BookingsController.addBooking(
                                                    booking,
                                                  );
                                              if (!bookingResult['success']) {
                                                if (context.mounted) {
                                                  ScaffoldMessenger.of(
                                                    context,
                                                  ).showSnackBar(
                                                    SnackBar(
                                                      content: Text(
                                                        bookingResult['message']
                                                            .toString(),
                                                      ),
                                                    ),
                                                  );
                                                }
                                                return;
                                              }

                                              Navigator.pop(context);

                                              if (args.type ==
                                                  DetailType.hotel) {
                                                final result = await Navigator.push(
                                                  context,
                                                  MaterialPageRoute(
                                                    builder: (_) =>
                                                        PayPalPaymentView(
                                                          itemName: args.name,
                                                          itemType:
                                                              'غرفة الفندق',
                                                          amount:
                                                              '${totalPrice.toStringAsFixed(1)} ل.س',
                                                        ),
                                                  ),
                                                );

                                                if (result == true && mounted) {
                                                  ScaffoldMessenger.of(
                                                    context,
                                                  ).showSnackBar(
                                                    const SnackBar(
                                                      content: Text(
                                                        'تم الدفع بنجاح وحفظ الحجز ✅',
                                                      ),
                                                    ),
                                                  );
                                                }
                                              } else if (mounted) {
                                                ScaffoldMessenger.of(
                                                  context,
                                                ).showSnackBar(
                                                  SnackBar(
                                                    content: Text(
                                                      "تم حجز طاولة لـ $selectedCount شخص بتاريخ $dateStr الساعة $timeStr ✅",
                                                    ),
                                                  ),
                                                );
                                              }
                                            }
                                          : null,
                                    ),
                                  ],
                                );
                              },
                            );
                          },
                        );
                      },

                      icon: const Icon(Icons.event_available),
                      label: Text(
                        args.type == DetailType.hotel
                            ? "احجز غرفة"
                            : "احجز طاولة",
                      ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00C2FF),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                  if (args.locationUrl != null) ...[
                    const SizedBox(height: 12),
                    ElevatedButton.icon(
                      onPressed: () =>
                          Navigator.pushNamed(context, '/favorites-map'),
                      icon: const Icon(Icons.location_on),
                      label: Text(isArabic ? "عرض الموقع" : "View location"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 24),
                  Text(
                    isArabic
                        ? "أضف تقييمك وتعليقك"
                        : "Add your rating and review",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: List.generate(
                      5,
                      (i) => IconButton(
                        icon: Icon(
                          Icons.star,
                          color: i < selectedStars
                              ? Colors.amber
                              : Colors.grey[300],
                        ),
                        onPressed: () => setState(() => selectedStars = i + 1),
                      ),
                    ),
                  ),
                  TextField(
                    controller: _controller,
                    keyboardType: TextInputType.multiline,
                    textInputAction: TextInputAction.done,
                    decoration: InputDecoration(
                      hintText: isArabic
                          ? "اكتب تعليقك هنا..."
                          : "Write your review...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: isCommentValid
                            ? () => _submitReview(args)
                            : null,
                      ),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 24),
                  Text(
                    isArabic ? "تعليقات الزوار" : "Visitor reviews",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  if (_isLoadingReviews)
                    const Padding(
                      padding: EdgeInsets.all(8.0),
                      child: Center(child: CircularProgressIndicator()),
                    )
                  else if (_reviews.isEmpty)
                    Text(
                      isArabic ? "لا توجد تعليقات بعد." : "No reviews yet.",
                      style: TextStyle(color: Colors.grey),
                    )
                  else
                    ..._reviews.map((review) {
                      return Card(
                        margin: const EdgeInsets.symmetric(vertical: 6),
                        child: ListTile(
                          leading: const CircleAvatar(
                            backgroundColor: Colors.green,
                            child: Icon(Icons.person, color: Colors.white),
                          ),
                          title: Text(review.userName),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: List.generate(
                                  5,
                                  (j) => Icon(
                                    Icons.star,
                                    size: 14,
                                    color: j < review.rating
                                        ? Colors.amber
                                        : Colors.grey[300],
                                  ),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(review.comment),
                            ],
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
