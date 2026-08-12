import 'dart:convert';
import 'package:http/http.dart' as http;
import '../database/local_database.dart';
import '../models/transport_model.dart';

class CarService {
  Future<List<TransportModel>> getCachedCars() async {
    final data = await LocalDatabase.getTransport();
    return data.map((map) => TransportModel.fromMap(map)).toList();
  }

  Future<void> cacheCars(List<TransportModel> cars) async {
    final maps = cars.map((c) => c.toMap()).toList();
    await LocalDatabase.insertTransport(maps);
  }

  Future<List<TransportModel>> fetchCars() async {
    final response = await http.get(
      Uri.parse('https://syr-trip-backend.vercel.app/api/cars'),
    );
    if (response.statusCode != 200) {
      throw Exception('Failed to load cars');
    }

    final body = json.decode(response.body);
    final data = body['cars'] ?? [];
    return data.map<TransportModel>((e) => TransportModel.fromJson(e)).toList();
  }
}
