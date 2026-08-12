import 'package:flutter/material.dart';
import '../services/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;

  bool get isLoggedIn => _isLoggedIn;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;

  // ═══════════════════════════════════════════════════
  // التحقق من حالة الدخول عند فتح التطبيق
  // ═══════════════════════════════════════════════════
  Future<void> checkLoginStatus() async {
    _isLoggedIn = await AuthService.isLoggedIn();
    notifyListeners();
  }

  // ═══════════════════════════════════════════════════
  // تسجيل الدخول
  // ═══════════════════════════════════════════════════
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await AuthService.login(email, password);

    _isLoading = false;

    if (result['success']) {
      _isLoggedIn = true;
      _user = result['user'];
      _error = null;
      notifyListeners();
      return true;
    } else {
      _error = result['message'];
      notifyListeners();
      return false;
    }
  }

  // ═══════════════════════════════════════════════════
  // تسجيل الخروج
  // ═══════════════════════════════════════════════════
  Future<void> logout() async {
    await AuthService.logout();
    _isLoggedIn = false;
    _user = null;
    notifyListeners();
  }
}