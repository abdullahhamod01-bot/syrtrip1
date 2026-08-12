import 'dart:convert';
import 'api_service.dart';

class AuthService {
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await ApiService.post('/auth/login', {
      'email': email,
      'password': password,
    });

    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      await ApiService.setToken(data['token']);
      return {'success': true, 'user': data['user']};
    } else {
      return {'success': false, 'message': data['message'] ?? 'Login failed'};
    }
  }

  static Future<Map<String, dynamic>> register(
    String name,
    String email,
    String password,
  ) async {
    final response = await ApiService.post('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
    });

    final data = jsonDecode(response.body);

    if (response.statusCode == 201) {
      await ApiService.setToken(data['token']);
      return {'success': true, 'user': data['user']};
    } else {
      return {'success': false, 'message': data['message'] ?? 'Register failed'};
    }
  }

  static Future<void> logout() async {
    await ApiService.clearToken();
  }

  static Future<bool> isLoggedIn() async {
    await ApiService.init();
    return ApiService.token != null;
  }
}