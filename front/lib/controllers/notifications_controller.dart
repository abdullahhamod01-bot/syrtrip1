import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'auth_controller.dart';

class NotificationsController {
  static const String baseUrl =
      'https://syr-trip-backend.vercel.app/api/notifications';
  static final ValueNotifier<bool> hasUnreadNotifications = ValueNotifier(
    false,
  );

  static bool _isUnread(Map<String, dynamic> notification) {
    final value = notification['isRead'] ?? notification['read'];
    return !(value == true || value?.toString().toLowerCase() == 'true');
  }

  static Future<List<Map<String, dynamic>>> getNotifications() async {
    final token = await AuthController.getToken();
    if (token == null || token.isEmpty) return [];

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final data =
            decoded['notifications'] ??
            decoded['data'] ??
            decoded['items'] ??
            decoded['results'] ??
            [];

        if (data is List) {
          final notifications = data
              .map<Map<String, dynamic>>(
                (item) => Map<String, dynamic>.from(item),
              )
              .toList();
          hasUnreadNotifications.value = notifications.any(_isUnread);
          return notifications;
        }
      }
    } catch (_) {}

    hasUnreadNotifications.value = false;
    return [];
  }

  static Future<void> registerFcmToken(String fcmToken) async {
    final token = await AuthController.getToken();
    if (token == null || token.isEmpty || fcmToken.trim().isEmpty) return;

    try {
      await http.post(
        Uri.parse('$baseUrl/fcm-token'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'fcmToken': fcmToken,
          'deviceToken': fcmToken,
          'token': fcmToken,
        }),
      );
    } catch (_) {}
  }

  static Future<bool> markAsRead(String notificationId) async {
    final token = await AuthController.getToken();
    if (token == null || token.isEmpty || notificationId.trim().isEmpty) {
      return false;
    }

    try {
      final response = await http.patch(
        Uri.parse('$baseUrl/${Uri.encodeComponent(notificationId)}/read'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );
      final success = response.statusCode >= 200 && response.statusCode < 300;
      if (success) {
        await getNotifications();
      }
      return success;
    } catch (_) {}

    return false;
  }
}
