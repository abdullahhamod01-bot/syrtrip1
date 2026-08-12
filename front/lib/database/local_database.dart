import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDatabase {
  static Database? _db;

  static Future<Database> getDatabase() async {
    if (_db != null) return _db!;
    final path = join(await getDatabasesPath(), 'tourism.db');
    _db = await openDatabase(
      path,
      version: 2,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE hotels (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            location TEXT,
            rating REAL,
            pricePerNight INTEGER,
            phoneNumber TEXT,
            images TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE restaurants (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            location TEXT,
            rating REAL,
            cuisineType TEXT,
            phoneNumber TEXT,
            images TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE attractions (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            location TEXT,
            rating REAL,
            category TEXT,
            images TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE transport (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            location TEXT,
            rating REAL,
            type TEXT,
            fare REAL,
            images TEXT
          )
        ''');

        await db.execute('''
          CREATE TABLE offices (
            id TEXT PRIMARY KEY,
            name TEXT,
            description TEXT,
            location TEXT,
            lat REAL,
            lng REAL,
            phone TEXT,
            ownerId TEXT
          )
        ''');
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await db.execute('''
            CREATE TABLE IF NOT EXISTS offices (
              id TEXT PRIMARY KEY,
              name TEXT,
              description TEXT,
              location TEXT,
              lat REAL,
              lng REAL,
              phone TEXT,
              ownerId TEXT
            )
          ''');
        }
      },
    );
    return _db!;
  }

  // 🏨 حفظ الفنادق
  static Future<void> insertHotels(List<Map<String, dynamic>> hotels) async {
    final db = await getDatabase();
    for (var hotel in hotels) {
      await db.insert(
        'hotels',
        hotel,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  // 🏨 حفظ فندق واحد
  static Future<void> insertHotel(Map<String, dynamic> hotel) async {
    final db = await getDatabase();
    await db.insert(
      'hotels',
      hotel,
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // 🏨 تحديث فندق واحد
  static Future<void> updateHotel(String id, Map<String, dynamic> hotel) async {
    final db = await getDatabase();
    await db.update(
      'hotels',
      hotel,
      where: 'id = ?',
      whereArgs: [id],
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  // 🏨 حذف فندق واحد
  static Future<void> deleteHotel(String id) async {
    final db = await getDatabase();
    await db.delete('hotels', where: 'id = ?', whereArgs: [id]);
  }

  // 🏨 استرجاع الفنادق
  static Future<List<Map<String, dynamic>>> getHotels() async {
    final db = await getDatabase();
    return await db.query('hotels');
  }

  // � استرجاع فندق بحسب id
  static Future<Map<String, dynamic>?> getHotelById(String id) async {
    final db = await getDatabase();
    final result = await db.query(
      'hotels',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    return result.isNotEmpty ? result.first : null;
  }

  // �🍽️ حفظ المطاعم
  static Future<void> insertRestaurants(
    List<Map<String, dynamic>> restaurants,
  ) async {
    final db = await getDatabase();
    for (var restaurant in restaurants) {
      await db.insert(
        'restaurants',
        restaurant,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  // 🍽️ استرجاع المطاعم
  static Future<List<Map<String, dynamic>>> getRestaurants() async {
    final db = await getDatabase();
    return await db.query('restaurants');
  }

  // 🏞️ حفظ المعالم السياحية
  static Future<void> insertAttractions(
    List<Map<String, dynamic>> attractions,
  ) async {
    final db = await getDatabase();
    for (var place in attractions) {
      await db.insert(
        'attractions',
        place,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  // 🏞️ استرجاع المعالم السياحية
  static Future<List<Map<String, dynamic>>> getAttractions() async {
    final db = await getDatabase();
    return await db.query('attractions');
  }

  // 🚗 حفظ وسائل النقل
  static Future<void> insertTransport(
    List<Map<String, dynamic>> transports,
  ) async {
    final db = await getDatabase();
    for (var transport in transports) {
      await db.insert(
        'transport',
        transport,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  // 🚗 استرجاع وسائل النقل
  static Future<List<Map<String, dynamic>>> getTransport() async {
    final db = await getDatabase();
    return await db.query('transport');
  }

  // 🏢 حفظ مكاتب السيارات
  static Future<void> insertOffices(List<Map<String, dynamic>> offices) async {
    final db = await getDatabase();
    for (var office in offices) {
      await db.insert(
        'offices',
        office,
        conflictAlgorithm: ConflictAlgorithm.replace,
      );
    }
  }

  // 🏢 استرجاع مكاتب السيارات
  static Future<List<Map<String, dynamic>>> getOffices() async {
    final db = await getDatabase();
    return await db.query('offices');
  }
}
