import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class AuthController {
  final usernameController = TextEditingController();
  final emailController = TextEditingController();
  final passwordController = TextEditingController();

  final String baseUrl = "https://syr-trip-backend.vercel.app/api/auth";

  // ←←← جديد: رسالة الخطأ من الـ API (بتقدر تعرضها في الـ UI)
  String? errorMessage;

  // ═══════════════════════════════════════════════════════════════
  // ✅ تسجيل الدخول
  // ═══════════════════════════════════════════════════════════════
  Future<bool> login(String email, String password) async {
    errorMessage = null;

    try {
      final url = Uri.parse("$baseUrl/login");
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': email, 'password': password}),
      );

      final data = jsonDecode(res.body);

      if (res.statusCode == 200) {
        final token = data['token'];
        // ←←← ثابت: نستخدم data['user']['name'] لو الـ API بيرجع user object
        final userName = data['user']?['name'] ?? data['name'] ?? 'مستخدم';

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', token);
        await prefs.setString('user_name', userName);

        print("✅ Logged in: $userName");
        return true;
      } else {
        // ←←← جديد: نحفظ رسالة الخطأ من الـ backend
        errorMessage = data['message'] ?? 'البريد أو كلمة المرور غير صحيحة';
        print("❌ Login failed: ${res.statusCode} - ${res.body}");
        return false;
      }
    } catch (e) {
      errorMessage = 'خطأ في الاتصال بالسيرفر';
      print("❌ Login error: $e");
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ تسجيل مستخدم جديد
  // ═══════════════════════════════════════════════════════════════
  Future<bool> signup(String username, String email, String password) async {
    errorMessage = null;

    try {
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

      final data = jsonDecode(res.body);

      if (res.statusCode == 201 || res.statusCode == 200) {
        // ←←← جديد: لو الـ API بيرجع token بعد التسجيل، نحفظه تلقائياً
        if (data['token'] != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('token', data['token']);
        }

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_name', username);

        print("✅ Signup successful: $username");
        return true;
      } else {
        errorMessage = data['message'] ?? 'فشل إنشاء الحساب';
        print("❌ Signup failed: ${res.statusCode} - ${res.body}");
        return false;
      }
    } catch (e) {
      errorMessage = 'خطأ في الاتصال بالسيرفر';
      print("❌ Signup error: $e");
      return false;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ جلب التوكن (static عشان تقدر تستخدمها من أي مكان)
  // ═══════════════════════════════════════════════════════════════
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ جلب اسم المستخدم
  // ═══════════════════════════════════════════════════════════════
  static Future<String?> getUserName() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_name');
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ التحقق من تسجيل الدخول
  // ═══════════════════════════════════════════════════════════════
  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token') != null;
  }

  // ═══════════════════════════════════════════════════════════════
  // ✅ تسجيل الخروج
  // ═══════════════════════════════════════════════════════════════
  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('user_name');
    errorMessage = null;
    print("✅ Logged out");
  }

  void dispose() {
    usernameController.dispose();
    emailController.dispose();
    passwordController.dispose();
  }
}
