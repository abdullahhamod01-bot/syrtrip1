import '../database/local_database.dart';
import '../models/hotel_model.dart';

class HotelService {
  // استرجاع الفنادق من قاعدة البيانات المحلية
  Future<List<HotelModel>> getCachedHotels() async {
    final data = await LocalDatabase.getHotels();
    return data.map((map) => HotelModel.fromMap(map)).toList();
  }

  // حفظ الفنادق في قاعدة البيانات المحلية
  Future<void> cacheHotels(List<HotelModel> hotels) async {
    final maps = hotels.map((hotel) => hotel.toMap()).toList();
    await LocalDatabase.insertHotels(maps);
  }
}
