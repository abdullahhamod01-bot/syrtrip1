import 'dart:convert';
import 'place_model.dart';

class HotelModel extends PlaceModel {
  final double pricePerNight;
  final String? phoneNumber;

  HotelModel({
    required super.id,
    required super.name,
    required super.description,
    required super.images,
    required super.location,
    required super.rating,
    required this.pricePerNight,
    required this.phoneNumber,
  });

  factory HotelModel.fromJson(Map<String, dynamic> json) {
    return HotelModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      pricePerNight: (json['pricePerNight'] ?? 0).toDouble(),
      phoneNumber: json['phoneNumber'],
    );
  }



  @override
  Map<String, dynamic> toMap() {
    return {
      ...super.toMap(),
      'pricePerNight': pricePerNight,
      'phoneNumber': phoneNumber,
    };
  }

  factory HotelModel.fromMap(Map<String, dynamic> map) {
    return HotelModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      images: List<String>.from(jsonDecode(map['images'])),
      location: map['location'],
      rating: map['rating'].toDouble(),
      pricePerNight: map['pricePerNight'].toDouble(),
      phoneNumber: map['phoneNumber'],
    );
  }
}
