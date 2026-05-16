import 'package:flutter/material.dart';
import '../services/booking_service.dart';

class BookingProvider extends ChangeNotifier {
  final BookingService _bookingService = BookingService();

  List<dynamic> bookings = [];
  List<dynamic> conflictingBookings = [];
  dynamic bookingStats;
  bool isLoading = false;
  String? errorMessage;

  // جلب حجوزات المستخدم
  Future<void> fetchUserBookings({
    required String token,
    String? itemType,
    String? status,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      bookings = await _bookingService.getUserBookings(
        token: token,
        itemType: itemType,
        status: status,
      );
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
    }
  }

  // إنشاء حجز جديد
  Future<bool> createBooking({
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
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await _bookingService.createBooking(
        token: token,
        itemId: itemId,
        itemType: itemType,
        itemName: itemName,
        location: location,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        totalPrice: totalPrice,
        contactPerson: contactPerson,
        phoneNumber: phoneNumber,
        notes: notes,
        roomNumber: roomNumber,
        tableNumber: tableNumber,
      );

      // إعادة تحميل الحجوزات
      await fetchUserBookings(token: token);
      isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // تحديث حجز
  Future<bool> updateBooking({
    required String token,
    required String bookingId,
    DateTime? checkInDate,
    DateTime? checkOutDate,
    int? numberOfGuests,
    String? notes,
    String? contactPerson,
    String? phoneNumber,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await _bookingService.updateBooking(
        token: token,
        bookingId: bookingId,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        numberOfGuests: numberOfGuests,
        notes: notes,
        contactPerson: contactPerson,
        phoneNumber: phoneNumber,
      );

      await fetchUserBookings(token: token);
      isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // إلغاء حجز
  Future<bool> cancelBooking({
    required String token,
    required String bookingId,
  }) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      await _bookingService.cancelBooking(
        token: token,
        bookingId: bookingId,
      );

      await fetchUserBookings(token: token);
      isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
      return false;
    }
  }

  // التحقق من التعارض
  Future<bool> checkForConflicts({
    required String itemId,
    required String itemType,
    required DateTime checkInDate,
    required DateTime checkOutDate,
  }) async {
    try {
      conflictingBookings = await _bookingService.getConflictingBookings(
        itemId: itemId,
        itemType: itemType,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      );
      notifyListeners();
      return conflictingBookings.isEmpty;
    } catch (e) {
      errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // جلب الإحصائيات
  Future<void> fetchBookingStats({required String token}) async {
    isLoading = true;
    errorMessage = null;
    notifyListeners();

    try {
      bookingStats = await _bookingService.getBookingStats(token: token);
      isLoading = false;
      notifyListeners();
    } catch (e) {
      errorMessage = e.toString();
      isLoading = false;
      notifyListeners();
    }
  }

  // حساب عدد الليالي/الأيام
  int getNumberOfNights(DateTime checkIn, DateTime checkOut) {
    return checkOut.difference(checkIn).inDays;
  }

  // تنسيق التاريخ
  String formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }

  // تنسيق التاريخ والوقت
  String formatDateTime(DateTime dateTime) {
    return '${dateTime.day}/${dateTime.month}/${dateTime.year} ${dateTime.hour}:${dateTime.minute.toString().padLeft(2, '0')}';
  }
}
