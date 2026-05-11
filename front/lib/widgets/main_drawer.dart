import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../controllers/auth_controller.dart';
import '../providers/app_provider.dart';
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
                color: const Color(0xFF2E7D63).withOpacity(0.12),
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
                    icon: Icons.home_rounded,
                    title: "الرئيسية",
                    onTap: () {
                      Navigator.pop(context);
                    },
                  ),

                  _drawerItem(
                    icon: Icons.hotel,
                    title: "الفنادق",
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/hotels');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.restaurant,
                    title: "المطاعم",
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/restaurants');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.place,
                    title: "المعالم",
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/attractions');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.directions_bus,
                    title: "المواصلات",
                    onTap: () {
                      Navigator.pop(context);
                      Navigator.pushNamed(context, '/transport');
                    },
                  ),

                  _drawerItem(
                    icon: Icons.currency_exchange,
                    title: "صرف العملة",
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
                      title: const Text(
                        "الوضع الداكن",
                        style: TextStyle(fontWeight: FontWeight.w600),
                      ),
                      onChanged: (_) {
                        context.read<AppProvider>().toggleTheme();
                      },
                    ),
                  ),

                  /// اللغة
                  _drawerItem(
                    icon: Icons.language,
                    title: "اللغة",
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
                                const Text(
                                  "اختر اللغة",
                                  style: TextStyle(
                                    fontSize: 20,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 20),

                                _langTile(
                                  "العربية",
                                  Icons.language,
                                  () {
                                    context
                                        .read<AppProvider>()
                                        .changeLanguage('ar');

                                    Navigator.pop(context);
                                  },
                                ),

                                _langTile(
                                  "English",
                                  Icons.language,
                                  () {
                                    context
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
                    title: "حول التطبيق",
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (_) {
                          return AlertDialog(
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                            title: const Text("SyrTrip"),
                            content: const Text(
                              "تطبيق سياحي لاستكشاف سوريا بطريقة احترافية.",
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
                  title: const Text(
                    "تسجيل الخروج",
                    style: TextStyle(
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
                      const SnackBar(
                        content: Text('تم تسجيل الخروج'),
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