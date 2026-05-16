import 'package:dio/dio.dart';
import 'dart:async';

class BookingService {
  final Dio _dio = Dio();
  static const String baseUrl = 'http://10.0.2.3:5000/api';

  Future<dynamic> createBooking({
    required String token,
    required String itemId,
    required String itemType,
    required String itemName,
    required String location,
    required DateTime checkInDate,
    required DateTime checkOutDate,
    required int numberOfGuests,
    required double totalPrice,
    required String contactPerson,
    required String phoneNumber,
    String? notes,
    String? roomNumber,
    String? tableNumber,
  }) async {
    try {
      final response = await _dio.post(
        '$baseUrl/bookings',
        data: {
          'itemId': itemId,
          'itemType': itemType,
          'itemName': itemName,
          'location': location,
          'checkInDate': checkInDate.toIso8601String(),
          'checkOutDate': checkOutDate.toIso8601String(),
          'numberOfGuests': numberOfGuests,
          'totalPrice': totalPrice,
          'contactPerson': contactPerson,
          'phoneNumber': phoneNumber,
          'notes': notes,
          'roomNumber': roomNumber,
          'tableNumber': tableNumber,
        },
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Content-Type': 'application/json',
          },
        ),
      );

      return response.data;
    } catch (e) {
      throw Exception('خطأ في إنشاء الحجز: $e');
    }
  }

  Future<List<dynamic>> getUserBookings({
    required String token,
    String? itemType,
    String? status,
  }) async {
    try {
      String url = '$baseUrl/bookings';
    final Map<String, dynamic> params = {};

      if (itemType != null) params['itemType'] = itemType;
      if (status != null) params['status'] = status;

      final response = await _dio.get(
        url,
        queryParameters: params,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return response.data['bookings'] ?? [];
    } catch (e) {
      throw Exception('خطأ في جلب الحجوزات: $e');
    }
  }

  Future<dynamic> getBookingById({
    required String token,
    required String bookingId,
  }) async {
    try {
      final response = await _dio.get(
        '$baseUrl/bookings/$bookingId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return response.data['booking'];
    } catch (e) {
      throw Exception('خطأ في جلب تفاصيل الحجز: $e');
    }
  }

  Future<dynamic> updateBooking({
    required String token,
    required String bookingId,
    DateTime? checkInDate,
    DateTime? checkOutDate,
    int? numberOfGuests,
    String? notes,
    String? contactPerson,
    String? phoneNumber,
  }) async {
    try {
      final data = {};

      if (checkInDate != null) data['checkInDate'] = checkInDate.toIso8601String();
      if (checkOutDate != null) data['checkOutDate'] = checkOutDate.toIso8601String();
      if (numberOfGuests != null) data['numberOfGuests'] = numberOfGuests;
      if (notes != null) data['notes'] = notes;
      if (contactPerson != null) data['contactPerson'] = contactPerson;
      if (phoneNumber != null) data['phoneNumber'] = phoneNumber;

      final response = await _dio.put(
        '$baseUrl/bookings/$bookingId',
        data: data,
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return response.data;
    } catch (e) {
      throw Exception('خطأ في تحديث الحجز: $e');
    }
  }

  Future<dynamic> cancelBooking({
    required String token,
    required String bookingId,
  }) async {
    try {
      final response = await _dio.delete(
        '$baseUrl/bookings/$bookingId',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return response.data;
    } catch (e) {
      throw Exception('خطأ في إلغاء الحجز: $e');
    }
  }

  Future<List<dynamic>> getConflictingBookings({
    required String itemId,
    required String itemType,
    required DateTime checkInDate,
    required DateTime checkOutDate,
  }) async {
    try {
      final response = await _dio.get(
        '$baseUrl/bookings/conflicts/check',
        queryParameters: {
          'itemId': itemId,
          'itemType': itemType,
          'checkInDate': checkInDate.toIso8601String(),
          'checkOutDate': checkOutDate.toIso8601String(),
        },
      );

      return response.data['conflictingBookings'] ?? [];
    } catch (e) {
      throw Exception('خطأ في التحقق من التعارض: $e');
    }
  }

  Future<dynamic> getBookingStats({
    required String token,
  }) async {
    try {
      final response = await _dio.get(
        '$baseUrl/bookings/stats/all',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
          },
        ),
      );

      return response.data['stats'];
    } catch (e) {
      throw Exception('خطأ في جلب الإحصائيات: $e');
    }
  }
}
