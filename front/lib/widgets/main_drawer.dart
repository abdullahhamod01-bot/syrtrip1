// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../controllers/auth_controller.dart';
import '../providers/app_provider.dart';
import '../utils/translations.dart';
import '../views/login_view.dart';

class MainDrawer extends StatefulWidget {
  const MainDrawer({super.key});

  @override
  State<MainDrawer> createState() => _MainDrawerState();
}

class _MainDrawerState extends State<MainDrawer> {
  String userName = 'زائر';

  @override
  void initState() {
    super.initState();
    _loadUserName();
  }

  Future<void> _loadUserName() async {
    final prefs = await SharedPreferences.getInstance();

    setState(() {
      userName = prefs.getString('user_name') ?? 'زائر';
    });
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();

    return Drawer(
      backgroundColor: const Color(0xFFF5F7F6),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.horizontal(
          right: Radius.circular(30),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            const SizedBox(height: 20),

            /// LOGO
            Container(
              width: 85,
              height: 85,
              decoration: BoxDecoration(
                color: const Color(0xFF2E7D63),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.person,
                size: 45,
                color: Color(0xFF2E7D63),
              ),
            ),

            const SizedBox(height: 12),

            Text(
              userName,
              style: const TextStyle(
                fontSize: 23,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2E7D63),
              ),
            ),

            const SizedBox(height: 35),

            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: 12),
                children: [
                  

                  _drawerItem(
                    icon: Icons.hotel,
                    title: Translations.tr(context, 'hotels'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/hotels');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.restaurant,
                    title: Translations.tr(context, 'restaurants'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/restaurants');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.place,
                    title: Translations.tr(context, 'attractions'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/attractions');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.directions_bus,
                    title: Translations.tr(context, 'transport'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/transport');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.currency_exchange,
                    title: Translations.tr(context, 'currency'),
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/currency');
                    },
                  ),

                  /// الوضع الداكن
                  Container(
                    margin: const EdgeInsets.symmetric(vertical: 6),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: SwitchListTile(
                      value: appProvider.isDarkMode,
                      activeColor: const Color(0xFF2E7D63),
                      secondary: const Icon(Icons.dark_mode),
                      title: Text(
                        Translations.tr(context, 'dark_mode'),
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
                      onChanged: (_) {
                        context.read<AppProvider>().toggleTheme();
                      },
                    ),
                  ),

                  /// اللغة
                  _drawerItem(
                    icon: Icons.language,
                    title: Translations.tr(context, 'language'),
                    onTap: () {
                      showModalBottomSheet(
                        context: context,
                        shape: const RoundedRectangleBorder(
                          borderRadius: BorderRadius.vertical(
                            top: Radius.circular(25),
                          ),
                        ),
                        builder: (_) {
                          return Padding(
                            padding: const EdgeInsets.all(20),
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Text(
                                  Translations.tr(context, 'choose_language'),
                                  style: const TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 20),

                                _langTile(
                                  Translations.tr(context, 'language_arabic'),
                                  Icons.language,
                                  () async {
                                    await context
                                        .read<AppProvider>()
                                        .changeLanguage('ar');

                                    Navigator.pop(context);
                                  },
                                ),

                                _langTile(
                                  Translations.tr(context, 'language_english'),
                                  Icons.language,
                                  () async {
                                    await context
                                        .read<AppProvider>()
                                        .changeLanguage('en');

                                    Navigator.pop(context);
                                  },
                                ),
                              ],
                            ),
                          );
                        },
                      );
                    },
                  ),

                  _drawerItem(
                    icon: Icons.info_outline,
                    title: Translations.tr(context, 'about_app'),
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (_) {
                          return AlertDialog(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            title: const Text("SyrTrip"),
                            content: Text(
                              Translations.tr(context, 'app_version'),
                            ),
                          );
                        },
                      );
                    },
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Container(
                decoration: BoxDecoration(
                  color: Colors.red.withOpacity(0.08),
                  borderRadius: BorderRadius.circular(18),
                ),
                child: ListTile(
                  leading: const Icon(
                    Icons.logout,
                    color: Colors.red,
                  ),
                  title: Text(
                    Translations.tr(context, 'logout'),
                    style: const TextStyle(
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  onTap: () async {
                    Navigator.pop(context);

                    await AuthController().logout();

                    context.read<AppProvider>().logout();

                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) => const LoginView(),
                      ),
                    );

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(Translations.tr(context, 'logged_out')),
                      ),
                    );
                  },
                ),
              ),
            ),

            const SizedBox(height: 18),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
      ),
      child: ListTile(
        leading: Icon(
          icon,
          color: const Color(0xFF2E7D63),
        ),
        title: Text(
          title,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
          ),
        ),
        trailing: const Icon(
          Icons.arrow_forward_ios,
          size: 16,
          color: Colors.grey,
        ),
        onTap: onTap,
      ),
    );
  }

  Widget _langTile(
    String title,
    IconData icon,
    VoidCallback onTap,
  ) {
    return ListTile(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      leading: Icon(
        icon,
        color: const Color(0xFF2E7D63),
      ),
      title: Text(title),
      onTap: onTap,
    );
  }
}