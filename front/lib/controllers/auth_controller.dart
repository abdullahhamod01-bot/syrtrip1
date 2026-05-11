import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthController {
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final String baseUrl = "https://tourism-app-1-fs9e.onrender.com/api/auth";


  // ✅ تسجيل الدخول  gamil
  Future<bool> login(String email, String password) async {
    final url = Uri.parse("$baseUrl/login");
    final res = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'email': email,
        'password': password,
      }),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      final token = data['token'];
      final userName = data['name'] ?? 'مستخدم'; // استخراج الاسم من الاستجابة

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', token);
      await prefs.setString('user_name', userName); // حفظ الاسم

      print("✅ Logged in and token saved");
      return true;
    } else {
      print("❌ Login failed: ${res.statusCode} - ${res.body}");
      return false;
    }
  }

  // ✅ تسجيل مستخدم جديد
  Future<bool> signup(String username, String email, String password) async {
    final url = Uri.parse("$baseUrl/register");
    final res = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': username,
        'email': email,
        'password': password,
      }),
    );

    if (res.statusCode == 201) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_name', username); // حفظ الاسم بعد التسجيل

      print("✅ Signup successful");
      return true;
    } else {
      print("❌ Signup failed: ${res.statusCode} - ${res.body}");
      return false;
    }
  }

  // ✅ التحقق من تسجيل الدخول
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  // ✅ تسجيل الخروج
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user_name'); // إزالة الاسم عند تسجيل الخروج
  }

  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
  }
}
