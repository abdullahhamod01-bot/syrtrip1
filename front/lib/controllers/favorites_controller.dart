// lib/controllers/favorites_controller.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_controller.dart';

class FavoritesController {
  static const _keyPrefix = 'syrtrip_favorites';

  static Future<String> _userKey() async {
    final userId = await AuthController.getUserId();
    return userId == null || userId.isEmpty ? 'guest' : '${_keyPrefix}_$userId';
  }

  static Future<List<String>> loadFavorites() async {
    final prefs = await SharedPreferences.getInstance();
    final key = await _userKey();
    final jsonStr = prefs.getString(key);
    if (jsonStr == null) return [];
    final List<dynamic> list = jsonDecode(jsonStr);
    return List<String>.from(list);
  }

  static Future<void> saveFavorites(List<String> ids) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(await _userKey(), jsonEncode(ids));
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

