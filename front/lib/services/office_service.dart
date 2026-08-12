import '../database/local_database.dart';
import '../models/office_model.dart';

class OfficeService {
  Future<List<OfficeModel>> getCachedOffices() async {
    final data = await LocalDatabase.getOffices();
    return data.map((map) => OfficeModel.fromMap(map)).toList();
  }

  Future<void> cacheOffices(List<OfficeModel> offices) async {
    final maps = offices.map((o) => o.toMap()).toList();
    await LocalDatabase.insertOffices(maps);
  }
}
