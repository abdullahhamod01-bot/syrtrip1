import 'package:flutter/material.dart';

//انشاء كلاس للفلترة ببروفايد
class AttractionFilterProvider with ChangeNotifier {
  String? _selectedFilter;

  String? get selectedFilter => _selectedFilter;

  void selectFilter(String filter) {
    if (_selectedFilter == filter) {
      _selectedFilter = null; 
    } else {
      _selectedFilter = filter;
    }
    notifyListeners();
  }

  void clearFilter() {
    _selectedFilter = null;
    notifyListeners();
  }
}
