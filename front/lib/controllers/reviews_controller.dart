import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../views/detail_view.dart';
import 'auth_controller.dart';

class ReviewItem {
  final String id;
  final int rating;
  final String comment;
  final String userName;
  final String? userId;
  final DateTime createdAt;

  ReviewItem({
    required this.id,
    required this.rating,
    required this.comment,
    required this.userName,
    this.userId,
    required this.createdAt,
  });

  factory ReviewItem.fromJson(Map<String, dynamic> json) {
    final user = json['user'] is Map
        ? json['user'] as Map<String, dynamic>
        : <String, dynamic>{};

    return ReviewItem(
      id: (json['id'] ?? '').toString(),
      rating: (json['rating'] ?? 0).toInt(),
      comment: (json['comment'] ?? '').toString(),
      userName: (user['name'] ?? 'مستخدم').toString(),
      userId: json['userId']?.toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
    );
  }
}

class ReviewsController {
  static const String _baseUrl =
      'https://syr-trip-backend.vercel.app/api/interactions/reviews';

  static String mapType(DetailType type) {
    switch (type) {
      case DetailType.hotel:
        return 'HOTEL';
      case DetailType.restaurant:
        return 'RESTAURANT';
      case DetailType.attraction:
        return 'LANDMARK';
      case DetailType.transport:
        return 'CAR';
    }
  }

  static Future<String?> getToken() => AuthController.getToken();

  static Future<List<ReviewItem>> getReviews({
    required DetailType type,
    required String itemId,
  }) async {
    final token = await getToken();
    final query = '?itemType=${mapType(type)}&itemId=$itemId';

    try {
      final response = await http.get(
        Uri.parse('$_baseUrl$query'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null && token.isNotEmpty)
            'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        return const [];
      }

      final decoded = jsonDecode(response.body);
      final reviews = decoded['reviews'];
      if (reviews is! List) return const [];

      return reviews
          .map<ReviewItem>(
            (review) => ReviewItem.fromJson(Map<String, dynamic>.from(review)),
          )
          .toList();
    } catch (_) {
      return const [];
    }
  }

  static Future<Map<String, dynamic>> submitReview({
    required DetailType type,
    required String itemId,
    required int rating,
    required String comment,
  }) async {
    final token = await getToken();
    if (token == null || token.isEmpty) {
      return {'success': false, 'message': 'يجب تسجيل الدخول أولاً'};
    }

    try {
      final response = await http.post(
        Uri.parse(_baseUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'itemType': mapType(type),
          'itemId': itemId,
          'rating': rating,
          'comment': comment,
        }),
      );

      final decoded = jsonDecode(response.body);

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return {'success': true, 'data': decoded};
      }

      return {
        'success': false,
        'message': decoded['message'] ?? 'فشل في إضافة التعليق',
      };
    } catch (_) {
      return {'success': false, 'message': 'تعذر الاتصال بالسيرفر'};
    }
  }

  static ReviewItem fromJson(Map<String, dynamic> json) =>
      ReviewItem.fromJson(json);

  static Future<void> _saveCachedReviews(
    String itemKey,
    List<ReviewItem> reviews,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(
      itemKey,
      jsonEncode(
        reviews
            .map(
              (review) => {
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'userName': review.userName,
                'userId': review.userId,
                'createdAt': review.createdAt.toIso8601String(),
              },
            )
            .toList(),
      ),
    );
  }

  static Future<List<ReviewItem>> getCachedReviews(String itemKey) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(itemKey);
    if (raw == null || raw.isEmpty) return const [];

    try {
      final decoded = jsonDecode(raw);
      if (decoded is! List) return const [];

      return decoded
          .map<ReviewItem>(
            (review) => ReviewItem.fromJson(Map<String, dynamic>.from(review)),
          )
          .toList();
    } catch (_) {
      return const [];
    }
  }
}
