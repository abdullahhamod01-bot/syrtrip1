import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:SyrTrip/views/detail_view.dart';

void main() {
  test('detects remote images and asset images', () {
    expect(DetailView.isRemoteImage('https://example.com/a.jpg'), isTrue);
    expect(
      DetailView.isRemoteImage('assets/images/hotels/hotels1.WebP'),
      isFalse,
    );
  });

  test('returns a valid image provider for remote and asset images', () {
    final remote = DetailView.resolveImageProvider('https://example.com/a.jpg');
    final asset = DetailView.resolveImageProvider(
      'assets/images/hotels/hotels1.WebP',
    );

    expect(remote, isA<NetworkImage>());
    expect(asset, isA<AssetImage>());
  });
}
