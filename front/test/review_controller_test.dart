import 'package:flutter_test/flutter_test.dart';
import 'package:SyrTrip/controllers/reviews_controller.dart';
import 'package:SyrTrip/views/detail_view.dart';

void main() {
  test('maps detail type to backend review item type', () {
    expect(ReviewsController.mapType(DetailType.hotel), 'HOTEL');
    expect(ReviewsController.mapType(DetailType.restaurant), 'RESTAURANT');
    expect(ReviewsController.mapType(DetailType.attraction), 'LANDMARK');
  });

  test('parses backend review payload into app review model', () {
    final review = ReviewsController.fromJson({
      'id': 'review-1',
      'comment': 'Amazing stay',
      'rating': 5,
      'user': {'name': 'Youssof'},
      'createdAt': '2026-08-10T22:22:07.694Z',
    });

    expect(review.comment, 'Amazing stay');
    expect(review.rating, 5);
    expect(review.userName, 'Youssof');
  });
}
