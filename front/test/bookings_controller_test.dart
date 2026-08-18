import 'package:flutter_test/flutter_test.dart';
import 'package:SyrTrip/controllers/bookings_controller.dart';

void main() {
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
  });
}
