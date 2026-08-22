import 'dart:convert';

class PlaceModel {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final String location;
  final double rating;
  final double? latitude;
  final double? longitude;
  // الباني
  PlaceModel({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.location,
    required this.rating,
    this.latitude,
    this.longitude,
  });

  static double? parseCoordinate(dynamic value) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '');
  }

  static double? parseLatitude(Map<String, dynamic> json) {
    final location = json['location'];
    return parseCoordinate(
      json['latitude'] ??
          json['lat'] ??
          (location is Map ? location['latitude'] ?? location['lat'] : null),
    );
  }

  static double? parseLongitude(Map<String, dynamic> json) {
    final location = json['location'];
    return parseCoordinate(
      json['longitude'] ??
          json['lng'] ??
          (location is Map ? location['longitude'] ?? location['lng'] : null),
    );
  }

  // لتحويل البيانات القادمة من قاعدة البيانات الى كائن بلغة دارت

  factory PlaceModel.fromJson(Map<String, dynamic> json) {
    return PlaceModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      rating: (json['rating'] ?? json['avgRating'] ?? 0).toDouble(),
      latitude: parseLatitude(json),
      longitude: parseLongitude(json),
    );
  }
  // لتحويل البيانات القادمة من قاعدة البيانات الى ماب  لتخزينها في قاعدة البيانات المحلية

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'images': jsonEncode(images),
      'location': location,
      'rating': rating,
      'latitude': latitude,
      'longitude': longitude,
    };
  }
  // لتحويل البيانات القادمة من قاعدة البيانات المحلية  الى مائن ليتم عرضه

  factory PlaceModel.fromMap(Map<String, dynamic> map) {
    return PlaceModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      images: List<String>.from(jsonDecode(map['images'])),
      location: map['location'],
      rating: map['rating'].toDouble(),
      latitude: parseCoordinate(map['latitude'] ?? map['lat']),
      longitude: parseCoordinate(map['longitude'] ?? map['lng']),
    );
  }
}
