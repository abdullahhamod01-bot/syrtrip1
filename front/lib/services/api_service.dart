import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';

class ApiService {
  static const String baseUrl = 'https://syr-trip-backend.vercel.app/api';
  static String? _token;

  // ═══════════════════════════════════════════════════
  // جلب التوكن من SharedPreferences (أول ما يفتح التطبيق)
  // ═══════════════════════════════════════════════════
  static Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token');
  }

  static String? get token => _token;

  static Future<void> setToken(String token) async {
    _token = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Map<String, String> get headers {
    final Map<String, String> h = {'Content-Type': 'application/json'};
    if (_token != null) {
      h['Authorization'] = 'Bearer $_token';
    }
    return h;
  }

  static Future<http.Response> get(String endpoint) async {
    return await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }

  static Future<http.Response> post(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    return await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> put(
    String endpoint,
    Map<String, dynamic> body,
  ) async {
    return await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(body),
    );
  }

  static Future<http.Response> delete(String endpoint) async {
    return await http.delete(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }
}
