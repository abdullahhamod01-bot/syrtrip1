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
    super.latitude,
    super.longitude,
    required this.type,
    required this.fare,
  });

  factory TransportModel.fromJson(Map<String, dynamic> json) {
    final office = json['office'];
    final locationData = office is Map<String, dynamic> ? office : null;
    return TransportModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['office'] != null
          ? json['office']['location'] ?? json['location'] ?? ''
          : json['location'] ?? '',
      rating: (json['rating'] ?? json['avgRating'] ?? 0).toDouble(),
      latitude:
          PlaceModel.parseLatitude(json) ??
          (locationData == null
              ? null
              : PlaceModel.parseLatitude(locationData)),
      longitude:
          PlaceModel.parseLongitude(json) ??
          (locationData == null
              ? null
              : PlaceModel.parseLongitude(locationData)),
      type: json['type'] ?? '',
      fare: (json['pricePerDay'] ?? json['fare'] ?? 0).toDouble(),
    );
  }

  @override
  Map<String, dynamic> toMap() {
    return {...super.toMap(), 'type': type, 'fare': fare};
  }

  factory TransportModel.fromMap(Map<String, dynamic> map) {
    return TransportModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      images: List<String>.from(jsonDecode(map['images'])),
      location: map['location'],
      rating: map['rating'].toDouble(),
      latitude: PlaceModel.parseCoordinate(map['latitude'] ?? map['lat']),
      longitude: PlaceModel.parseCoordinate(map['longitude'] ?? map['lng']),
      type: map['type'],
      fare: map['fare'].toDouble(),
    );
  }
}
