class OfficeModel {
  final String id;
  final String name;
  final String? description;
  final String location;
  final double lat;
  final double lng;
  final String phone;
  final String ownerId;

  OfficeModel({
    required this.id,
    required this.name,
    required this.description,
    required this.location,
    required this.lat,
    required this.lng,
    required this.phone,
    required this.ownerId,
  });

  factory OfficeModel.fromJson(Map<String, dynamic> json) {
    return OfficeModel(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'],
      location: json['location'] ?? '',
      lat: (json['lat'] ?? 0).toDouble(),
      lng: (json['lng'] ?? 0).toDouble(),
      phone: json['phone'] ?? '',
      ownerId: json['ownerId'] ?? '',
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'location': location,
      'lat': lat,
      'lng': lng,
      'phone': phone,
      'ownerId': ownerId,
    };
  }

  factory OfficeModel.fromMap(Map<String, dynamic> map) {
    return OfficeModel(
      id: map['id'],
      name: map['name'],
      description: map['description'],
      location: map['location'],
      lat: map['lat'].toDouble(),
      lng: map['lng'].toDouble(),
      phone: map['phone'],
      ownerId: map['ownerId'],
    );
  }
}
