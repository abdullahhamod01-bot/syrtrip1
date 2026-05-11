import 'dart:convert';
import 'place_model.dart';

class RestaurantModel extends PlaceModel {
  final String cuisineType;
  final String? phoneNumber;

  RestaurantModel({
    required super.id,
    required super.name,
    required super.description,
    required super.images,
    required super.location,
    required super.rating,
    required this.cuisineType,
    required this.phoneNumber,
  });

  factory RestaurantModel.fromJson(Map<String, dynamic> json) {
    return RestaurantModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      cuisineType: json['cuisineType'] ?? '',
      phoneNumber: json['phoneNumber'],
    );
  }

  @override
  Map<String, dynamic> toMap() {
    return {
      ...super.toMap(),
      'cuisineType': cuisineType,
      'phoneNumber': phoneNumber,
    };
  }

  factory RestaurantModel.fromMap(Map<String, dynamic> map) {
    return RestaurantModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      images: List<String>.from(jsonDecode(map['images'])),
      location: map['location'],
      rating: map['rating'].toDouble(),
      cuisineType: map['cuisineType'],
      phoneNumber: map['phoneNumber'],
    );
  }
}
