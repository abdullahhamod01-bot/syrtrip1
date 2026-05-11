import '../database/local_database.dart';
import '../models/transport_model.dart';

class TransportService {
  Future<List<TransportModel>> getCachedTransport() async {
    final data = await LocalDatabase.getTransport(); // List<Map<String, dynamic>>
    return data.map((map) => TransportModel.fromMap(map)).toList();
  }

  Future<void> cacheTransport(List<TransportModel> transports) async {
    final maps = transports.map((t) => t.toMap()).toList();
    await LocalDatabase.insertTransport(maps);
  }
}
