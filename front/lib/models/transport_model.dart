import 'dart:convert';
import 'place_model.dart';

class TransportModel extends PlaceModel {
  final String type;
  final double fare;

  TransportModel({
    required super.id,
    required super.name,
    required super.description,
    required super.images,
    required super.location,
    required super.rating,
    required this.type,
    required this.fare,
  });

  factory TransportModel.fromJson(Map<String, dynamic> json) {
    return TransportModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      type: json['type'] ?? '',
      fare: (json['fare'] ?? 0).toDouble(),
    );
  }

  @override
  Map<String, dynamic> toMap() {
    return {
      ...super.toMap(),
      'type': type,
      'fare': fare,
    };
  }

  factory TransportModel.fromMap(Map<String, dynamic> map) {
    return TransportModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      images: List<String>.from(jsonDecode(map['images'])),
      location: map['location'],
      rating: map['rating'].toDouble(),
      type: map['type'],
      fare: map['fare'].toDouble(),
    );
  }
}
