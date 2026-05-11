import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class BookingsController {
  static const String key = "bookings";

  // 📌 جلب الحجوزات
  static Future<List<Map<String, dynamic>>> getBookings() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(key);

    if (data == null || data.isEmpty) return [];

    final decoded = jsonDecode(data);

    return List<Map<String, dynamic>>.from(decoded);
  }

  // 📌 إضافة حجز جديد
  static Future<void> addBooking(Map<String, dynamic> booking) async {
    final prefs = await SharedPreferences.getInstance();

    final list = await getBookings();

    list.add(booking);

    await prefs.setString(key, jsonEncode(list));
  }

  // 📌 حذف حجز معين
  static Future<void> deleteBooking(int index) async {
    final prefs = await SharedPreferences.getInstance();

    final list = await getBookings();

    if (index >= 0 && index < list.length) {
      list.removeAt(index);
    }

    await prefs.setString(key, jsonEncode(list));
  }

  // 📌 حذف كل الحجوزات
  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(key);
  }
}