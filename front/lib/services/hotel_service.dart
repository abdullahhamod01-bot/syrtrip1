import 'dart:convert';
import 'package:http/http.dart' as http;
import '../database/local_database.dart';
import '../models/hotel_model.dart';

class HotelService {
  // ←←← نفس الـ base_url اللي في Bruno environment
  static const String baseUrl = 'https://syr-trip-backend.vercel.app/api';

  // ═══════════════════════════════════════════════════
  // 1️⃣ جلب كل الفنادق (API أولاً → Cache احتياطي)
  // ═══════════════════════════════════════════════════
  Future<List<HotelModel>> getHotels({String? token}) async {
    try {
      // نبعت طلب GET للـ API (Bruno قد يرجّع كائن يحتوي على { meta, hotels: [...] })
      final response = await http.get(
        Uri.parse('$baseUrl/hotels'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        // الدعم لشكلين: (1) قائمة مباشرة، (2) { meta, hotels: [...] }
        final List<dynamic> jsonList = decoded is List
            ? decoded
            : (decoded is Map && decoded['hotels'] is List)
            ? decoded['hotels'] as List<dynamic>
            : [];

        final hotels = jsonList
            .map((json) => HotelModel.fromJson(json as Map<String, dynamic>))
            .toList();

        // نحفظهم في SQLite (Cache) عشان يشتغلوا offline
        await cacheHotels(hotels);

        return hotels;
      }

      // الـ API رجع خطأ → نجيب من الكاش
      return await getCachedHotels();
    } catch (e) {
      // ما فيه نت أو السيرفر مقفول → نجيب من الكاش
      print('⚠️ API Error: $e → Loading from cache...');
      return await getCachedHotels();
    }
  }

  // ═══════════════════════════════════════════════════
  // 2️⃣ جلب فندق واحد بالـ ID
  // ═══════════════════════════════════════════════════
  Future<HotelModel?> getHotelById(String id, {String? token}) async {
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/hotels/$id'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final hotel = HotelModel.fromJson(
          jsonDecode(response.body) is Map
              ? jsonDecode(response.body)
              : (jsonDecode(response.body) is List &&
                        jsonDecode(response.body).isNotEmpty
                    ? jsonDecode(response.body)[0]
                    : {}),
        );
        await LocalDatabase.insertHotel(hotel.toMap()); // تحديث الكاش
        return hotel;
      }
      return null;
    } catch (e) {
      print('⚠️ API Error: $e');
      final cached = await LocalDatabase.getHotelById(id);
      return cached != null ? HotelModel.fromMap(cached) : null;
    }
  }

  // ═══════════════════════════════════════════════════
  // 3️⃣ إضافة فندق جديد (POST /hotels)
  // ═══════════════════════════════════════════════════
  Future<HotelModel?> createHotel(
    Map<String, dynamic> data, {
    required String token,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/hotels'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token', // ←←← نفس اللي في Bruno
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 201) {
      final hotel = HotelModel.fromJson(jsonDecode(response.body));
      await LocalDatabase.insertHotel(hotel.toMap());
      return hotel;
    }
    throw Exception('❌ Failed to create hotel: ${response.body}');
  }

  // ═══════════════════════════════════════════════════
  // 4️⃣ تعديل فندق (PUT /hotels/:id)
  // ═══════════════════════════════════════════════════
  Future<HotelModel?> updateHotel(
    String id,
    Map<String, dynamic> data, {
    required String token,
  }) async {
    final response = await http.put(
      Uri.parse('$baseUrl/hotels/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(data),
    );

    if (response.statusCode == 200) {
      final hotel = HotelModel.fromJson(jsonDecode(response.body));
      await LocalDatabase.updateHotel(id, hotel.toMap());
      return hotel;
    }
    throw Exception('❌ Failed to update hotel: ${response.body}');
  }

  // ═══════════════════════════════════════════════════
  // 5️⃣ حذف فندق (DELETE /hotels/:id)
  // ═══════════════════════════════════════════════════
  Future<void> deleteHotel(String id, {required String token}) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/hotels/$id'),
      headers: {'Authorization': 'Bearer $token'},
    );

    if (response.statusCode == 200) {
      await LocalDatabase.deleteHotel(id);
    } else {
      throw Exception('❌ Failed to delete hotel: ${response.body}');
    }
  }

  // ═══════════════════════════════════════════════════
  // 6️⃣ الكاش (نفس الكود القديم — ما تغيّر)
  // ═══════════════════════════════════════════════════
  Future<List<HotelModel>> getCachedHotels() async {
    final data = await LocalDatabase.getHotels();
    return data.map((map) => HotelModel.fromMap(map)).toList();
  }

  Future<void> cacheHotels(List<HotelModel> hotels) async {
    final maps = hotels.map((hotel) => hotel.toMap()).toList();
    await LocalDatabase.insertHotels(maps);
  }
}
