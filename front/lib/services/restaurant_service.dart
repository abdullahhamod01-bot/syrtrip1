import '../database/local_database.dart';
import '../models/restaurant_model.dart';

class RestaurantService {
  Future<List<RestaurantModel>> getCachedRestaurants() async {
    final data = await LocalDatabase.getRestaurants(); // List<Map<String, dynamic>>
    return data.map((map) => RestaurantModel.fromMap(map)).toList();
  }

  Future<void> cacheRestaurants(List<RestaurantModel> restaurants) async {
    final maps = restaurants.map((r) => r.toMap()).toList();
    await LocalDatabase.insertRestaurants(maps);
  }
}
