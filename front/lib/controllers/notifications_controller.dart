import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_controller.dart';

class NotificationsController {
  static const String baseUrl =
      'https://syr-trip-backend.vercel.app/api/notifications';

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
          return data
              .map<Map<String, dynamic>>(
                (item) => Map<String, dynamic>.from(item),
              )
              .toList();
        }
      }
    } catch (_) {}

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

  static Future<void> markAllAsRead({String? notificationId}) async {
    final token = await AuthController.getToken();
    if (token == null || token.isEmpty) return;

    try {
      final payload = <String, dynamic>{};
      if (notificationId != null && notificationId.isNotEmpty) {
        payload['notificationId'] = notificationId;
        payload['id'] = notificationId;
      }

      await http.post(
        Uri.parse('$baseUrl/read'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );
    } catch (_) {}
  }
}
