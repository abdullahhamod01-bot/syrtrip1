import 'package:flutter/material.dart';
import 'dart:io';

class CustomCard extends StatelessWidget {
  final String id;
  final String title;
  final String subtitle;
  final String imagePath;
  final double rating;
  final VoidCallback? onTap;
  final Widget? trailing;

  // ✅ الإضافات الجديدة
  final double? price;
  final String? type; // hotel / restaurant / etc

  const CustomCard({
    super.key,
    required this.id,
    required this.title,
    required this.subtitle,
    required this.imagePath,
    required this.rating,
    this.onTap,
    this.trailing,
    this.price,
    this.type,
  });

  Widget _buildImage(String path) {
    if (path.startsWith('http')) {
      return Image.network(
        path,
        width: double.infinity,
        height: 110,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Icon(Icons.broken_image),
      );
    } else if (File(path).existsSync()) {
      return Image.file(
        File(path),
        width: double.infinity,
        height: 110,
        fit: BoxFit.cover,
      );
    } else {
      return Image.asset(
        path,
        width: double.infinity,
        height: 110,
        fit: BoxFit.cover,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: const [
            BoxShadow(
              color: Colors.black12,
              blurRadius: 6,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: _buildImage(imagePath),
            ),

            Padding(
              padding: const EdgeInsets.fromLTRB(10, 10, 10, 12),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // النصوص
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),

                        const SizedBox(height: 4),

                        Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              size: 13,
                              color: Colors.cyan,
                            ),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                subtitle,
                                style: const TextStyle(
                                  color: Colors.grey,
                                  fontSize: 11,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ],
                        ),

                        const SizedBox(height: 6),

                        Row(
                          children: [
                            ...List.generate(
                              5,
                              (i) => Icon(
                                Icons.star,
                                size: 13,
                                color: i < rating.round()
                                    ? Colors.amber
                                    : Colors.grey[300],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Text(
                              rating.toStringAsFixed(1),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),

                        // ⭐ السعر (فقط للفنادق)
                        if (type == "hotel" && price != null)
                          Padding(
                            padding: const EdgeInsets.only(top: 4),
                            child: Text(
                              "${price!.toStringAsFixed(0)} ل.س / ليلة",
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.green,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  // trailing
                  if (trailing != null)
                    Padding(
                      padding: const EdgeInsets.only(left: 6.0),
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 30),
                        child: trailing!,
                      ),
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