// lib/controllers/favorites_controller.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'auth_controller.dart';

class FavoritesController {
  static const _keyPrefix = 'syrtrip_favorites';
  static const String _favoritesBaseUrl =
      'https://syr-trip-backend.vercel.app/api/interactions/favorites';

  static Future<String> _userKey() async {
    final userId = await AuthController.getUserId();
    return userId == null || userId.isEmpty ? 'guest' : '${_keyPrefix}_$userId';
  }

  static Future<List<String>> _readLocalFavorites() async {
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

  static List<String> _extractFavoriteIds(dynamic payload) {
    final result = <String>{};

    void collect(dynamic value) {
      if (value is List) {
        for (final item in value) {
          collect(item);
        }
        return;
      }

      if (value is Map) {
        final map = Map<String, dynamic>.from(value);

        if (map.containsKey('id')) {
          final id = map['id']?.toString();
          if (id != null && id.isNotEmpty) result.add(id);
        }

        if (map.containsKey('itemId')) {
          final id = map['itemId']?.toString();
          if (id != null && id.isNotEmpty) result.add(id);
        }

        if (map.containsKey('favoriteId')) {
          final id = map['favoriteId']?.toString();
          if (id != null && id.isNotEmpty) result.add(id);
        }

        final keys = ['favorites', 'data', 'items', 'results', 'records'];
        for (final key in keys) {
          if (map.containsKey(key)) {
            collect(map[key]);
          }
        }

        return;
      }

      if (value is String) {
        result.add(value);
      }
    }

    collect(payload);
    return result.toList();
  }

  static Future<List<String>> loadFavorites() async {
    final localFavorites = await _readLocalFavorites();
    final token = await AuthController.getToken();

    if (token == null || token.isEmpty) {
      return localFavorites;
    }

    try {
      final response = await http.get(
        Uri.parse('$_favoritesBaseUrl/me'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);
        final remoteFavorites = _extractFavoriteIds(decoded);

        if (remoteFavorites.isNotEmpty) {
          await saveFavorites(remoteFavorites);
          return remoteFavorites;
        }
      }
    } catch (_) {
      // fallback to local storage if server is unavailable
    }

    return localFavorites;
  }

  static Future<void> toggleFavorite(String id) async {
    final favs = await loadFavorites();
    final willAdd = !favs.contains(id);
    final updated = willAdd
        ? [...favs, id]
        : favs.where((item) => item != id).toList();

    await saveFavorites(updated);

    final token = await AuthController.getToken();
    if (token == null || token.isEmpty) return;

    try {
      if (willAdd) {
        final response = await http.post(
          Uri.parse(_favoritesBaseUrl),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
          body: jsonEncode({'itemId': id}),
        );

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return;
        }
      } else {
        final response = await http.delete(
          Uri.parse('$_favoritesBaseUrl/$id'),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer $token',
          },
        );

        if (response.statusCode >= 200 && response.statusCode < 300) {
          return;
        }
      }
    } catch (_) {
      // keeps local state as the source of truth when the server fails
    }
  }

  static Future<bool> isFavorite(String id) async {
    final favs = await loadFavorites();
    return favs.contains(id);
  }
}
