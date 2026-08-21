import 'package:flutter_test/flutter_test.dart';
import 'package:SyrTrip/controllers/bookings_controller.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  group('BookingsController status helpers', () {
    test('pending status label is Arabic waiting label', () {
      expect(BookingsController.getStatusLabel('pending'), 'قيد الانتظار');
      expect(BookingsController.getStatusLabel('انتظار'), 'قيد الانتظار');
    });

    test('approved status label is Arabic approved label', () {
      expect(BookingsController.getStatusLabel('approved'), 'تمت الموافقة');
      expect(BookingsController.getStatusLabel('موافق'), 'تمت الموافقة');
    });

    test('status steps show pending then approved progression', () {
      final steps = BookingsController.getStatusSteps('pending');
      expect(steps[0]['active'], isTrue);
      expect(steps[1]['active'], isTrue);
      expect(steps[2]['active'], isFalse);
    });

    test('active booking check blocks only the same booking type', () {
      final bookings = [
        {'itemType': 'HOTEL', 'status': 'pending'},
        {'itemType': 'RESTAURANT', 'status': 'rejected'},
      ];

      expect(
        BookingsController.hasActiveBookingForType(bookings, 'HOTEL'),
        isTrue,
      );
      expect(
        BookingsController.hasActiveBookingForType(bookings, 'CAR'),
        isFalse,
      );
      expect(
        BookingsController.hasActiveBookingForType(bookings, 'RESTAURANT'),
        isFalse,
      );
    });

    test(
      'user specific storage flows remain stable for current session',
      () async {
        final list = await BookingsController.getBookings();
        expect(list, isA<List<Map<String, dynamic>>>());
      },
    );
  });
}
