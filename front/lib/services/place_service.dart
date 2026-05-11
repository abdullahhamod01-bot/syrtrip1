import '../database/local_database.dart';
import '../models/place_model.dart';

class PlaceService {
  Future<List<PlaceModel>> getCachedAttractions() async {
    final data = await LocalDatabase.getAttractions(); // List<Map<String, dynamic>>
    return data.map((map) => PlaceModel.fromMap(map)).toList();
  }

  Future<void> cacheAttractions(List<PlaceModel> places) async {
    final maps = places.map((p) => p.toMap()).toList();
    await LocalDatabase.insertAttractions(maps);
  }
}
