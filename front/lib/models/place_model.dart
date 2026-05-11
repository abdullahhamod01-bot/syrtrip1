import 'dart:convert';

class PlaceModel {
  final String id;
  final String name;
  final String description;
  final List<String> images;
  final String location;
  final double rating;
// الباني
  PlaceModel({
    required this.id,
    required this.name,
    required this.description,
    required this.images,
    required this.location,
    required this.rating,
  });

// لتحويل البيانات القادمة من قاعدة البيانات الى كائن بلغة دارت 

  factory PlaceModel.fromJson(Map<String, dynamic> json) {
    return PlaceModel(
      id: json['_id'] ?? json['id'],
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      location: json['location'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
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
    );
  }
}
