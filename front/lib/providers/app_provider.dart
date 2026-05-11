import 'package:flutter/material.dart';

class AppProvider extends ChangeNotifier {
  String _language = "ar";
  String _currency = "SYP";
  String _city = "دمشق";
  bool _darkMode = false;
  bool _isGuest = true;
  String _userName = "زائر";
  String _currencyFrom = 'USD';
  String _currencyTo = 'SYP';

  final List<String> _currencyCodes = ['USD', 'EUR', 'SYP'];
  final Map<String, double> _currencyRates = {
    'USD': 1.0,
    'EUR': 0.93,
    'SYP': 15000.0,
  };

  String get language => _language;
  String get currency => _currency;
  String get city => _city;
  bool get isDarkMode => _darkMode;
  bool get isGuest => _isGuest;
  String get userName => _userName;
  String get currencyFrom => _currencyFrom;
  String get currencyTo => _currencyTo;
  List<String> get currencyCodes => List.unmodifiable(_currencyCodes);
  Map<String, double> get currencyRates => Map.unmodifiable(_currencyRates);

  void changeLanguage(String lang) {
    _language = lang;
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

  void changeCity(String cityName) {
    _city = cityName;
    notifyListeners();
  }

  void toggleTheme() {
    _darkMode = !_darkMode;
    notifyListeners();
  }

  void setUser(String name) {
    _userName = name;
    _isGuest = false;
    notifyListeners();
  }

  void logout() {
    _userName = "زائر";
    _isGuest = true;
    notifyListeners();
  }
}
