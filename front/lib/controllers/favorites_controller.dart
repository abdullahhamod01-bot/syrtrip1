
// lib/controllers/favorites_controller.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class FavoritesController {
  static const _key = 'syrtrip_favorites';

  // favorites stored as list of ids
  static Future<List<String>> loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final jsonStr = prefs.getString(_key);
    if (jsonStr == null) return [];
    final List<dynamic> list = jsonDecode(jsonStr);
    return List<String>.from(list);
  }

  static Future<void> saveFavorites(List<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(ids));
  }

  static Future<void> toggleFavorite(String id) async {
    final favs = await loadFavorites();
    if (favs.contains(id)) {
      favs.remove(id);
    } else {
      favs.add(id);
    }
    await saveFavorites(favs);
  }

  static Future<bool> isFavorite(String id) async {
    final favs = await loadFavorites();
    return favs.contains(id);
  }
}

