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
    this.phoneNumber,
  });

  // ═══════════════════════════════════════════════════
  // 1️⃣ من JSON (الـ API بيرجع _id و List)
  // ═══════════════════════════════════════════════════
  factory HotelModel.fromJson(Map<String, dynamic> json) {
    return HotelModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      images: _parseImages(json['images']),
      location: json['location'] ?? '',
      rating: _toDouble(json['rating']),
      pricePerNight: _toDouble(json['pricePerNight']),
      phoneNumber: json['phoneNumber'],
    );
  }

  // ═══════════════════════════════════════════════════
  // 2️⃣ من Map (SQLite database)
  // ═══════════════════════════════════════════════════
  factory HotelModel.fromMap(Map<String, dynamic> map) {
    return HotelModel(
      id: map['id'] ?? map['_id'] ?? '',
      name: map['name'] ?? '',
      description: map['description'] ?? '',
      images: _parseImages(map['images']),
      location: map['location'] ?? '',
      rating: _toDouble(map['rating']),
      pricePerNight: _toDouble(map['pricePerNight']),
      phoneNumber: map['phoneNumber'],
    );
  }

  // ═══════════════════════════════════════════════════
  // 3️⃣ إلى Map (للـ SQLite)
  // ═══════════════════════════════════════════════════
  @override
  Map<String, dynamic> toMap() {
    return {
      ...super.toMap(),
      'pricePerNight': pricePerNight,
      'phoneNumber': phoneNumber,
    };
  }

  // ═══════════════════════════════════════════════════
  // Helpers (private) — بتتعامل مع أي شكل للبيانات
  // ═══════════════════════════════════════════════════

  /// بتقرأ images سواء كانت:
  /// - List<String> من الـ API ✅
  /// - String JSON من SQLite ✅ ("[\"url1\",\"url2\"]")
  /// - null → ترجع [] ✅
  static List<String> _parseImages(dynamic images) {
    if (images == null) return [];

    // من الـ API: List مباشرة
    if (images is List) {
      return images.map((e) => e.toString()).toList();
    }

    // من SQLite: String JSON
    if (images is String) {
      try {
        final decoded = jsonDecode(images);
        if (decoded is List) {
          return decoded.map((e) => e.toString()).toList();
        }
      } catch (_) {
        // لو كانت String عادية (URL واحد)
        return [images];
      }
    }

    return [];
  }

  /// بتحول أي رقم لـ double بأمان (int, double, String, null)
  static double _toDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  // ═══════════════════════════════════════════════════
  // 4️⃣ copyWith — لتعديل قيمة واحدة بس
  // ═══════════════════════════════════════════════════
  HotelModel copyWith({
    String? id,
    String? name,
    String? description,
    List<String>? images,
    String? location,
    double? rating,
    double? pricePerNight,
    String? phoneNumber,
  }) {
    return HotelModel(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      images: images ?? this.images,
      location: location ?? this.location,
      rating: rating ?? this.rating,
      pricePerNight: pricePerNight ?? this.pricePerNight,
      phoneNumber: phoneNumber ?? this.phoneNumber,
    );
  }
}
