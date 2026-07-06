import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';

class SettingsView extends StatefulWidget {
  const SettingsView({super.key});

  @override
  State<SettingsView> createState() => _SettingsViewState();
}

class _SettingsViewState extends State<SettingsView> {
  @override
  Widget build(BuildContext context) {
    final appProvider = Provider.of<AppProvider>(context);
    final isAr = appProvider.isArabic;
    final isDark = appProvider.isDarkMode;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'الإعدادات' : 'Settings',
          style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // ===== Appearance Section =====
          _buildSectionTitle(isAr ? 'المظهر' : 'Appearance', isAr),
          _buildSettingCard(
            context: context,
            icon: isDark ? Icons.light_mode : Icons.dark_mode,
            iconColor: isDark ? Colors.amber : Colors.indigo,
            titleAr: isDark ? 'الوضع النهاري' : 'الوضع الليلي',
            titleEn: isDark ? 'Light Mode' : 'Dark Mode',
            subtitleAr: isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي',
            subtitleEn: isDark ? 'Enable light mode' : 'Enable dark mode',
            isAr: isAr,
            trailing: Switch(
              value: isDark,
              activeColor: const Color(0xFF1B5E20),
              onChanged: (value) => appProvider.toggleTheme(),
            ),
            onTap: () => appProvider.toggleTheme(),
          ),

          const SizedBox(height: 8),

          // ===== Language Section =====
          _buildSectionTitle(isAr ? 'اللغة' : 'Language', isAr),
          _buildLanguageCard(context, appProvider, isAr),

          const SizedBox(height: 8),

          // ===== Currency Section =====
          _buildSectionTitle(isAr ? 'العملة' : 'Currency', isAr),
          _buildCurrencyCard(context, appProvider, isAr),

          const SizedBox(height: 8),

          // ===== City Section =====
          _buildSectionTitle(isAr ? 'المدينة' : 'City', isAr),
          _buildCityCard(context, appProvider, isAr),

          const SizedBox(height: 8),

          // ===== Notifications Section =====
          _buildSectionTitle(isAr ? 'الإشعارات' : 'Notifications', isAr),
          _buildSettingCard(
            context: context,
            icon: Icons.notifications,
            iconColor: Colors.orange,
            titleAr: 'إشعارات الفعاليات',
            titleEn: 'Event Notifications',
            subtitleAr: 'تلقي إشعارات عن الفعاليات القادمة',
            subtitleEn: 'Receive notifications about upcoming events',
            isAr: isAr,
            trailing: Switch(value: true, activeColor: const Color(0xFF1B5E20), onChanged: (value) {}),
          ),
          _buildSettingCard(
            context: context,
            icon: Icons.favorite,
            iconColor: Colors.red,
            titleAr: 'إشعارات المفضلة',
            titleEn: 'Favorites Notifications',
            subtitleAr: 'تلقي تحديثات عن الأماكن المفضلة',
            subtitleEn: 'Receive updates about favorite places',
            isAr: isAr,
            trailing: Switch(value: false, activeColor: const Color(0xFF1B5E20), onChanged: (value) {}),
          ),

          const SizedBox(height: 8),

          // ===== About Section =====
          _buildSectionTitle(isAr ? 'حول التطبيق' : 'About', isAr),
          _buildSettingCard(
            context: context,
            icon: Icons.info,
            iconColor: Colors.teal,
            titleAr: 'الإصدار',
            titleEn: 'Version',
            subtitleAr: '1.0.0',
            subtitleEn: '1.0.0',
            isAr: isAr,
            showArrow: false,
          ),
          _buildSettingCard(
            context: context,
            icon: Icons.privacy_tip,
            iconColor: Colors.purple,
            titleAr: 'سياسة الخصوصية',
            titleEn: 'Privacy Policy',
            subtitleAr: 'اقرأ سياسة الخصوصية',
            subtitleEn: 'Read privacy policy',
            isAr: isAr,
            onTap: () {},
          ),
          _buildSettingCard(
            context: context,
            icon: Icons.description,
            iconColor: Colors.blue,
            titleAr: 'شروط الاستخدام',
            titleEn: 'Terms of Use',
            subtitleAr: 'اقرأ شروط الاستخدام',
            subtitleEn: 'Read terms of use',
            isAr: isAr,
            onTap: () {},
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, bool isAr) {
    return Padding(
      padding: const EdgeInsets.only(left: 8, right: 8, top: 16, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1B5E20),
          fontFamily: 'Tajawal',
        ),
      ),
    );
  }

  Widget _buildSettingCard({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required String titleAr,
    required String titleEn,
    required String subtitleAr,
    required String subtitleEn,
    required bool isAr,
    Widget? trailing,
    VoidCallback? onTap,
    bool showArrow = true,
  }) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(icon, color: iconColor, size: 22),
        ),
        title: Text(
          isAr ? titleAr : titleEn,
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
        ),
        subtitle: Text(
          isAr ? subtitleAr : subtitleEn,
          style: TextStyle(fontSize: 13, color: Colors.grey[600], fontFamily: 'Tajawal'),
        ),
        trailing: trailing ?? (showArrow ? const Icon(Icons.arrow_forward_ios, size: 16) : null),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Widget _buildLanguageCard(BuildContext context, AppProvider appProvider, bool isAr) {
    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.language, color: Colors.blue, size: 22),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAr ? 'لغة التطبيق' : 'App Language',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isAr ? 'اختر لغة التطبيق المفضلة' : 'Choose your preferred app language',
                        style: TextStyle(fontSize: 13, color: Colors.grey[600], fontFamily: 'Tajawal'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildLangOption(
                    context: context,
                    label: 'العربية',
                    flag: '🇸🇾',
                    isSelected: isAr,
                    onTap: () => appProvider.setLanguage('ar'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildLangOption(
                    context: context,
                    label: 'English',
                    flag: '🇬🇧',
                    isSelected: !isAr,
                    onTap: () => appProvider.setLanguage('en'),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLangOption({
    required BuildContext context,
    required String label,
    required String flag,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF1B5E20).withOpacity(0.1) : Colors.grey[100],
          border: Border.all(
            color: isSelected ? const Color(0xFF1B5E20) : Colors.grey[300]!,
            width: 2,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          children: [
            Text(flag, style: const TextStyle(fontSize: 32)),
            const SizedBox(height: 8),
            Text(
              label,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                color: isSelected ? const Color(0xFF1B5E20) : Colors.grey[700],
                fontFamily: 'Tajawal',
              ),
            ),
            if (isSelected)
              const Padding(
                padding: EdgeInsets.only(top: 4),
                child: Icon(Icons.check_circle, color: Color(0xFF1B5E20), size: 20),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildCurrencyCard(BuildContext context, AppProvider appProvider, bool isAr) {
    final currencies = [
      {'code': 'SYP', 'nameAr': 'ليرة سورية', 'nameEn': 'Syrian Pound', 'symbol': 'ل.س'},
      {'code': 'USD', 'nameAr': 'دولار أمريكي', 'nameEn': 'US Dollar', 'symbol': r'$'},
      {'code': 'EUR', 'nameAr': 'يورو', 'nameEn': 'Euro', 'symbol': '€'},
    ];

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.currency_exchange, color: Colors.green, size: 22),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isAr ? 'العملة المفضلة' : 'Preferred Currency',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isAr ? 'اختر العملة الافتراضية' : 'Choose default currency',
                        style: TextStyle(fontSize: 13, color: Colors.grey[600], fontFamily: 'Tajawal'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: currencies.map((currency) {
                final isSelected = appProvider.currency == currency['code'];
                return ChoiceChip(
                  label: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        currency['symbol']!,
                        style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.green),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        isAr ? currency['nameAr']! : currency['nameEn']!,
                        style: TextStyle(color: isSelected ? Colors.white : null, fontFamily: 'Tajawal'),
                      ),
                    ],
                  ),
                  selected: isSelected,
                  selectedColor: const Color(0xFF1B5E20),
                  backgroundColor: Colors.grey[100],
                  onSelected: (selected) {
                    if (selected) appProvider.setCurrency(currency['code']!);
                  },
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCityCard(BuildContext context, AppProvider appProvider, bool isAr) {
    final cities = [
      {'name': 'دمشق', 'nameEn': 'Damascus'},
      {'name': 'حلب', 'nameEn': 'Aleppo'},
      {'name': 'حمص', 'nameEn': 'Homs'},
      {'name': 'اللاذقية', 'nameEn': 'Latakia'},
      {'name': 'طرطوس', 'nameEn': 'Tartus'},
      {'name': 'حماة', 'nameEn': 'Hama'},
      {'name': 'دير الزور', 'nameEn': 'Deir Ezzor'},
      {'name': 'الرقة', 'nameEn': 'Raqqa'},
      {'name': 'إدلب', 'nameEn': 'Idlib'},
      {'name': 'السويداء', 'nameEn': 'Sweida'},
    ];

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 4),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: Colors.red.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.location_city, color: Colors.red, size: 22),
        ),
        title: Text(
          isAr ? 'المدينة الحالية' : 'Current City',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
        ),
        subtitle: Text(
          appProvider.city,
          style: TextStyle(fontSize: 14, color: Colors.grey[600], fontFamily: 'Tajawal'),
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: () => _showCityPicker(context, appProvider, isAr, cities),
      ),
    );
  }

  void _showCityPicker(BuildContext context, AppProvider appProvider, bool isAr, List<Map<String, String>> cities) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Container(
                width: 40, height: 4,
                decoration: BoxDecoration(color: Colors.grey[300], borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text(
              isAr ? 'اختر المدينة' : 'Select City',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: cities.length,
                itemBuilder: (context, index) {
                  final city = cities[index];
                  final isSelected = appProvider.city == city['name'];
                  return ListTile(
                    leading: Icon(Icons.location_on, color: isSelected ? const Color(0xFF1B5E20) : Colors.grey),
                    title: Text(
                      isAr ? city['name']! : city['nameEn']!,
                      style: TextStyle(
                        fontFamily: 'Tajawal',
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        color: isSelected ? const Color(0xFF1B5E20) : null,
                      ),
                    ),
                    trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF1B5E20)) : null,
                    onTap: () {
                      appProvider.setCity(city['name']!);
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}