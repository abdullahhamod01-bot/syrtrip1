import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_controller.dart';

class BookingsController {
  static const String keyPrefix = 'bookings';
  static const String baseUrl =
      'https://syr-trip-backend.vercel.app/api/bookings';

  static Future<String> _userKey() async {
    final userId = await AuthController.getUserId();
    return userId == null || userId.isEmpty
        ? '${keyPrefix}_guest'
        : '${keyPrefix}_$userId';
  }

  static String normalizeStatus(String? status) {
    final value = (status ?? '').toString().trim().toLowerCase();

    if (value.isEmpty) return 'قيد الانتظار';
    if (value.contains('approved') ||
        value.contains('موافق') ||
        value.contains('accept')) {
      return 'تمت الموافقة';
    }
    if (value.contains('pending') ||
        value.contains('انتظار') ||
        value.contains('review')) {
      return 'قيد الانتظار';
    }
    if (value.contains('rejected') || value.contains('رفض')) {
      return 'مرفوض';
    }
    if (value.contains('cancel') || value.contains('إلغاء')) {
      return 'ملغي';
    }

    return status ?? 'قيد الانتظار';
  }

  static String getStatusLabel(String? status) => normalizeStatus(status);

  static List<Map<String, dynamic>> getStatusSteps(String? status) {
    final labels = ['تم الطلب', 'قيد الانتظار', 'تمت الموافقة'];
    final current = normalizeStatus(status);
    final activeIndex = current == 'تمت الموافقة'
        ? 2
        : current == 'قيد الانتظار'
        ? 1
        : 0;

    return List.generate(labels.length, (index) {
      return {
        'label': labels[index],
        'active': index <= activeIndex,
        'done': index < activeIndex,
      };
    });
  }

  static Future<List<Map<String, dynamic>>> _readLocalBookings() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(await _userKey());
    if (data == null || data.isEmpty) return [];

    try {
      final decoded = jsonDecode(data);
      if (decoded is List) {
        return decoded
            .map<Map<String, dynamic>>(
              (item) => Map<String, dynamic>.from(item),
            )
            .toList();
      }
    } catch (_) {}

    return [];
  }

  static Future<void> _saveLocalBookings(
    List<Map<String, dynamic>> list,
  ) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(await _userKey(), jsonEncode(list));
  }

  static Future<List<Map<String, dynamic>>> getBookings() async {
    final localBookings = await _readLocalBookings();

    try {
      final token = await AuthController.getToken();
      if (token == null || token.isEmpty) {
        return localBookings;
      }

      final response = await http.get(
        Uri.parse('$baseUrl/my-bookings'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final data =
            decoded['bookings'] ?? decoded['data'] ?? decoded['items'] ?? [];

        if (data is List) {
          final remoteBookings = data
              .map<Map<String, dynamic>>(
                (item) => Map<String, dynamic>.from(item),
              )
              .toList();

          if (remoteBookings.isNotEmpty) {
            final merged = [...remoteBookings, ...localBookings];
            final unique = <Map<String, dynamic>>[];
            final seen = <String>{};

            for (final item in merged) {
              final key = (item['id'] ?? item['bookingId'] ?? jsonEncode(item))
                  .toString();
              if (!seen.contains(key)) {
                seen.add(key);
                unique.add(item);
              }
            }

            await _saveLocalBookings(unique);
            return unique;
          }
        }
      }
    } catch (_) {
      // fallback to local storage if backend is unavailable
    }

    return localBookings;
  }

  static Future<void> addBooking(Map<String, dynamic> booking) async {
    final token = await AuthController.getToken();
    final payload = {...booking, 'status': booking['status'] ?? 'pending'};

    final localBookings = await _readLocalBookings();
    localBookings.add(payload);
    await _saveLocalBookings(localBookings);

    if (token == null || token.isEmpty) {
      return;
    }

    try {
      final response = await http.post(
        Uri.parse(baseUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(payload),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final decoded = jsonDecode(response.body);
        final createdBooking = decoded['booking'] ?? decoded['data'] ?? decoded;

        if (createdBooking is Map) {
          final updated = await _readLocalBookings();
          final merged = [
            ...updated,
            Map<String, dynamic>.from(createdBooking),
          ];
          await _saveLocalBookings(merged);
        }
      }
    } catch (_) {}
  }

  static Future<void> updateBookingStatus(
    String bookingId,
    String status,
  ) async {
    final token = await AuthController.getToken();
    if (token == null || token.isEmpty) return;

    try {
      final response = await http.put(
        Uri.parse('$baseUrl/$bookingId/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'status': status}),
      );

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return;
      }
    } catch (_) {}
  }

  static Future<void> deleteBooking(int index) async {
    final list = await _readLocalBookings();
    if (index >= 0 && index < list.length) {
      list.removeAt(index);
      await _saveLocalBookings(list);
    }
  }

  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(await _userKey());
  }
}
