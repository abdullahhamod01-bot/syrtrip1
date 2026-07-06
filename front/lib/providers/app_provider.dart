import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AppProvider extends ChangeNotifier {
  // ===== Language =====
  Locale _locale = const Locale('ar');
  Locale get locale => _locale;
  bool get isArabic => _locale.languageCode == 'ar';
  bool get isEnglish => _locale.languageCode == 'en';

  // ===== Theme =====
  ThemeMode _themeMode = ThemeMode.light;
  ThemeMode get themeMode => _themeMode;
  bool get isDarkMode => _themeMode == ThemeMode.dark;

  // ===== Currency =====
  String _currency = 'SYP';
  String get currency => _currency;

  // ===== City =====
  String _city = 'دمشق';
  String get city => _city;

  // ===== Guest Mode =====
  bool _isGuest = true;
  bool get isGuest => _isGuest;

  String _userName = 'زائر';
  String get userName => _userName;

  String _userEmail = '';
  String get userEmail => _userEmail;

  // ===== Currency Converter (old) =====
  String _currencyFrom = 'USD';
  String _currencyTo = 'SYP';
  final List<String> _currencyCodes = ['USD', 'EUR', 'SYP'];
  final Map<String, double> _currencyRates = {
    'USD': 1.0,
    'EUR': 0.93,
    'SYP': 15000.0,
  };

  String get currencyFrom => _currencyFrom;
  String get currencyTo => _currencyTo;
  List<String> get currencyCodes => List.unmodifiable(_currencyCodes);
  Map<String, double> get currencyRates => Map.unmodifiable(_currencyRates);

  // ===== Constructor =====
  AppProvider() {
    _loadSettings();
  }

  // ===== Load Saved Settings =====
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();

    final langCode = prefs.getString('language') ?? 'ar';
    _locale = Locale(langCode);

    final themeString = prefs.getString('theme') ?? 'light';
    _themeMode = themeString == 'dark' ? ThemeMode.dark : ThemeMode.light;

    _currency = prefs.getString('currency') ?? 'SYP';
    _city = prefs.getString('city') ?? 'دمشق';
    _isGuest = prefs.getBool('isGuest') ?? true;
    _userName = prefs.getString('userName') ?? 'زائر';
    _userEmail = prefs.getString('userEmail') ?? '';

    notifyListeners();
  }

  // ===== Language Methods =====
  Future<void> setLanguage(String languageCode) async {
    if (_locale.languageCode == languageCode) return;
    _locale = Locale(languageCode);
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', languageCode);
    notifyListeners();
  }

  Future<void> toggleLanguage() async {
    final newLang = isArabic ? 'en' : 'ar';
    await setLanguage(newLang);
  }

  // ===== Theme Methods =====
  Future<void> setThemeMode(ThemeMode mode) async {
    if (_themeMode == mode) return;
    _themeMode = mode;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('theme', mode == ThemeMode.dark ? 'dark' : 'light');
    notifyListeners();
  }

  Future<void> toggleTheme() async {
    final newMode = isDarkMode ? ThemeMode.light : ThemeMode.dark;
    await setThemeMode(newMode);
  }

  // ===== Currency Methods =====
  Future<void> setCurrency(String currency) async {
    _currency = currency;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('currency', currency);
    notifyListeners();
  }

  void changeCurrency(String curr) {
    _currency = curr;
    notifyListeners();
  }

  void setCurrencyFrom(String code) {
    if (!_currencyCodes.contains(code)) return;
    _currencyFrom = code;
    notifyListeners();
  }

  void setCurrencyTo(String code) {
    if (!_currencyCodes.contains(code)) return;
    _currencyTo = code;
    notifyListeners();
  }

  double convertCurrency(double amount) {
    final fromRate = _currencyRates[_currencyFrom] ?? 1.0;
    final toRate = _currencyRates[_currencyTo] ?? 1.0;
    return amount * (toRate / fromRate);
  }

  // ===== City Methods =====
  Future<void> setCity(String city) async {
    _city = city;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('city', city);
    notifyListeners();
  }

  void changeCity(String cityName) {
    _city = cityName;
    notifyListeners();
  }

  // ===== User Methods =====
  Future<void> setUserInfo(String name, String email) async {
    _userName = name;
    _userEmail = email;
    _isGuest = false;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('userName', name);
    await prefs.setString('userEmail', email);
    await prefs.setBool('isGuest', false);
    notifyListeners();
  }

  void setUser(String name) {
    _userName = name;
    _isGuest = false;
    notifyListeners();
  }

  Future<void> clearUserInfo() async {
    _userName = 'زائر';
    _userEmail = '';
    _isGuest = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('userName');
    await prefs.remove('userEmail');
    await prefs.setBool('isGuest', true);
    notifyListeners();
  }

  void logout() {
    _userName = 'زائر';
    _isGuest = true;
    notifyListeners();
  }

  // ===== Helpers =====
  String getLocalizedText(String ar, String en) {
    return isArabic ? ar : en;
  }

  TextDirection get textDirection {
    return isArabic ? TextDirection.rtl : TextDirection.ltr;
  }

  // ===== Theme Data =====
  ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: const ColorScheme.light(
        primary: Color(0xFF1B5E20),
        secondary: Color(0xFF2E7D32),
        surface: Color(0xFFF5F5F5),
        background: Color(0xFFFAFAFA),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFF212121),
        onBackground: Color(0xFF212121),
        error: Color(0xFFC62828),
      ),
      scaffoldBackgroundColor: const Color(0xFFFAFAFA),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: Color(0xFF1B5E20),
        foregroundColor: Colors.white,
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Colors.white,
          fontFamily: 'Tajawal',
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.white,
        selectedItemColor: Color(0xFF1B5E20),
        unselectedItemColor: Color(0xFF9E9E9E),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: Colors.white,
        elevation: 16,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 32, fontWeight: FontWeight.bold),
        displayMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 24, fontWeight: FontWeight.bold),
        titleLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 20, fontWeight: FontWeight.bold),
        titleMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 16, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 16),
        bodyMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 14),
        labelLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 14, fontWeight: FontWeight.w600),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFF5F5F5),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF1B5E20), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFF1B5E20),
          foregroundColor: Colors.white,
          textStyle: const TextStyle(
            fontFamily: 'Tajawal',
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFFE0E0E0),
        thickness: 1,
      ),
    );
  }

  ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: const ColorScheme.dark(
        primary: Color(0xFF4CAF50),
        secondary: Color(0xFF81C784),
        surface: Color(0xFF1E1E1E),
        background: Color(0xFF121212),
        onPrimary: Colors.white,
        onSecondary: Colors.white,
        onSurface: Color(0xFFEEEEEE),
        onBackground: Color(0xFFEEEEEE),
        error: Color(0xFFEF5350),
      ),
      scaffoldBackgroundColor: const Color(0xFF121212),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        centerTitle: true,
        backgroundColor: Color(0xFF1E1E1E),
        foregroundColor: Color(0xFFEEEEEE),
        titleTextStyle: TextStyle(
          fontSize: 20,
          fontWeight: FontWeight.bold,
          color: Color(0xFFEEEEEE),
          fontFamily: 'Tajawal',
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Color(0xFF1E1E1E),
        selectedItemColor: Color(0xFF4CAF50),
        unselectedItemColor: Color(0xFF757575),
        type: BottomNavigationBarType.fixed,
        elevation: 8,
      ),
      drawerTheme: const DrawerThemeData(
        backgroundColor: Color(0xFF1E1E1E),
        elevation: 16,
      ),
      textTheme: const TextTheme(
        displayLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 32, fontWeight: FontWeight.bold, color: Color(0xFFEEEEEE)),
        displayMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 24, fontWeight: FontWeight.bold, color: Color(0xFFEEEEEE)),
        titleLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFFEEEEEE)),
        titleMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 16, fontWeight: FontWeight.w600, color: Color(0xFFEEEEEE)),
        bodyLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 16, color: Color(0xFFEEEEEE)),
        bodyMedium: TextStyle(fontFamily: 'Tajawal', fontSize: 14, color: Color(0xFFBDBDBD)),
        labelLarge: TextStyle(fontFamily: 'Tajawal', fontSize: 14, fontWeight: FontWeight.w600, color: Color(0xFFEEEEEE)),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF2C2C2C),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF4CAF50), width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          elevation: 2,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          backgroundColor: const Color(0xFF4CAF50),
          foregroundColor: Colors.white,
          textStyle: const TextStyle(
            fontFamily: 'Tajawal',
            fontSize: 16,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        color: Color(0xFF424242),
        thickness: 1,
      ),
    );
  }
}