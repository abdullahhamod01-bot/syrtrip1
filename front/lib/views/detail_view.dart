import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';
import '../providers/comments_provider.dart';
import '../controllers/favorites_controller.dart';

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
    this.pricePerNight,
  });
}

class DetailView extends StatefulWidget {
  static const routeName = '/details';
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

  bool get isCommentValid =>
      selectedStars > 0 && _controller.text.trim().isNotEmpty;

  @override
  void initState() {
    super.initState();
    Future.delayed(Duration.zero, () async {
      final args =
          ModalRoute.of(context)!.settings.arguments as DetailArguments;
      final fav = await FavoritesController.isFavorite(args.id);
      if (mounted) setState(() => isFavorite = fav);
    });
  }

  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as DetailArguments;
    final comments = context.watch<CommentsProvider>().getComments(args.id);

    return Scaffold(
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),
      backgroundColor: const Color(0xFFF7FBFF),
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
                    itemCount: args.images.length,
                    onPageChanged: (index) =>
                        setState(() => currentImageIndex = index),
                    itemBuilder: (context, index) => Image.asset(
                      args.images[index],
                      width: double.infinity,
                      fit: BoxFit.cover,
                    ),
                  ),
                  if (args.images.length > 1) ...[
                    Positioned(
                      left: 8,
                      top: 90,
                      child: IconButton(
                        icon: const Icon(
                          Icons.arrow_back_ios,
                          color: Colors.white,
                        ),
                        onPressed: currentImageIndex > 0
                            ? () {
                                currentImageIndex--;
                                _pageController.animateToPage(
                                  currentImageIndex,
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
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
                        onPressed: currentImageIndex < args.images.length - 1
                            ? () {
                                currentImageIndex++;
                                _pageController.animateToPage(
                                  currentImageIndex,
                                  duration: const Duration(milliseconds: 300),
                                  curve: Curves.easeInOut,
                                );
                              }
                            : null,
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
                  if (args.type == DetailType.hotel ||
                      args.type == DetailType.restaurant) ...[
                    ElevatedButton.icon(
                 onPressed: () {
  int selectedCount = args.type == DetailType.hotel ? 1 : 2;
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
            title: Text(args.type == DetailType.hotel ? 'تفاصيل حجز الغرفة' : 'تفاصيل حجز الطاولة'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(args.type == DetailType.hotel ? 'عدد الغرف (حتى 7):' : 'عدد الأشخاص (حتى 15):'),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.remove),
                      onPressed: selectedCount > 1
                          ? () {
                              setState(() {
                                selectedCount--;
                                if (args.type == DetailType.hotel) {
                               totalPrice = (args.pricePerNight ?? 0) * selectedCount;

                                }
                              });
                            }
                          : null,
                    ),
                    Text('$selectedCount', style: const TextStyle(fontSize: 18)),
                    IconButton(
                      icon: const Icon(Icons.add),
                      onPressed: selectedCount < (args.type == DetailType.hotel ? 7 : 15)
                          ? () {
                              setState(() {
                                selectedCount++;
                                if (args.type == DetailType.hotel) {
                                  totalPrice = (args.pricePerNight ?? 0) * selectedCount;
                                }
                              });
                            }
                          : null,
                    ),
                  ],
                ),
                if (args.type == DetailType.hotel) ...[
                  const SizedBox(height: 8),
                  Text('السعر الإجمالي: ${totalPrice.toStringAsFixed(1)} ل.س',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                ],
                const SizedBox(height: 16),
                const Text('موعد الحجز:'),
                ElevatedButton.icon(
                  icon: const Icon(Icons.calendar_today),
                  label: Text(selectedDate == null
                      ? 'اختر التاريخ'
                      : '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}'),
                  onPressed: () async {
                    final now = DateTime.now();
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: now,
                      firstDate: now,
                      lastDate: now.add(const Duration(days: 365)),
                    );
                    if (picked != null) setState(() => selectedDate = picked);
                  },
                ),
                const SizedBox(height: 8),
                const Text('الساعة:'),
                ElevatedButton.icon(
                  icon: const Icon(Icons.access_time),
                  label: Text(selectedTime == null
                      ? 'اختر الساعة'
                      : '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}'),
                  onPressed: () async {
                    final picked = await showTimePicker(
                      context: context,
                      initialTime: TimeOfDay.now(),
                    );
                    if (picked != null) setState(() => selectedTime = picked);
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
                onPressed: (selectedDate != null && selectedTime != null)
                    ? () {
                        Navigator.pop(context);
                        final timeStr = '${selectedTime!.hour.toString().padLeft(2, '0')}:${selectedTime!.minute.toString().padLeft(2, '0')}';
                        final dateStr = '${selectedDate!.day}/${selectedDate!.month}/${selectedDate!.year}';
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(
                              args.type == DetailType.hotel
                                  ? "تم حجز $selectedCount غرفة بتاريخ $dateStr الساعة $timeStr ✅\nالسعر الإجمالي: ${totalPrice.toStringAsFixed(1)} ل.س"
                                  : "تم حجز طاولة لـ $selectedCount شخص بتاريخ $dateStr الساعة $timeStr ✅",
                            ),
                          ),
                        );
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
                    const SizedBox(height: 12),
                    if (args.locationUrl != null)
                      ElevatedButton.icon(
                        onPressed: () =>
                            launchUrl(Uri.parse(args.locationUrl!)),
                        icon: const Icon(Icons.location_on),
                        label: const Text("عرض الموقع"),
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
                  const Text(
                    "أضف تقييمك وتعليقك",
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
                      hintText: "اكتب تعليقك هنا...",
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: isCommentValid
                            ? () {
                                final comment = Comment(
                                  userName: "أبو عمر",
                                  userImage: "assets/yong.png",
                                  text: _controller.text.trim(),
                                  stars: selectedStars,
                                );
                                context.read<CommentsProvider>().addComment(
                                  args.id,
                                  comment,
                                );
                                _controller.clear();
                                setState(() => selectedStars = 0);
                              }
                            : null,
                      ),
                    ),
                    onChanged: (_) => setState(() {}),
                  ),
                  const SizedBox(height: 24),
                  const Text(
                    "تعليقات الزوار",
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  ...comments.asMap().entries.map((entry) {
                    final i = entry.key;
                    final c = entry.value;
                    return Card(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundImage: AssetImage(c.userImage),
                        ),
                        title: Text(c.userName),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: List.generate(
                                5,
                                (j) => Icon(
                                  Icons.star,
                                  size: 14,
                                  color: j < c.stars
                                      ? Colors.amber
                                      : Colors.grey[300],
                                ),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(c.text),
                          ],
                        ),
                        trailing: IconButton(
                          icon: const Icon(Icons.delete, color: Colors.red),
                          onPressed: () {
                            context.read<CommentsProvider>().deleteComment(
                              args.id,
                              i,
                            );
                          },
                        ),
                      ),
                    );
                  }),
                  if (comments.isEmpty)
                    const Text(
                      "لا توجد تعليقات بعد.",
                      style: TextStyle(color: Colors.grey),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
