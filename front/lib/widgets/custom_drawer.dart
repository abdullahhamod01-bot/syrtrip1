import 'package:flutter/material.dart';
import '../controllers/auth_controller.dart';

class CustomDrawer extends StatefulWidget {
  final Function(int) onItemSelected;
  final int currentIndex;

  const CustomDrawer({
    super.key,
    required this.onItemSelected,
    required this.currentIndex,
  });

  @override
  State<CustomDrawer> createState() => _CustomDrawerState();
}

class _CustomDrawerState extends State<CustomDrawer> {
  String userName = 'مستخدم';
  String userEmail = '';
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final name = await AuthController.getUserName();      // ✅ static
    final email = await AuthController.getUserEmail();    // ✅ static
    setState(() {
      userName = name;
      userEmail = email;
      isLoading = false;
    });
  }

  Future<void> _logout() async {
    await AuthController.logout();  // ✅ static - بدون instance
    if (mounted) {
      Navigator.pushNamedAndRemoveUntil(context, '/login', (route) => false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          UserAccountsDrawerHeader(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
            ),
            currentAccountPicture: CircleAvatar(
              backgroundColor: Colors.white,
              child: Text(
                userName.isNotEmpty ? userName[0].toUpperCase() : 'U',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF6366F1),
                ),
              ),
            ),
            accountName: Text(
              userName,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            accountEmail: Text(
              userEmail.isNotEmpty ? userEmail : 'غير متوفر',
              style: const TextStyle(fontSize: 14),
            ),
          ),

          _buildDrawerItem(icon: Icons.home, title: 'الرئيسية', index: 0),
          _buildDrawerItem(icon: Icons.hotel, title: 'الفنادق', index: 1),
          _buildDrawerItem(icon: Icons.restaurant, title: 'المطاعم', index: 2),
          _buildDrawerItem(icon: Icons.place, title: 'المعالم السياحية', index: 3),
          _buildDrawerItem(icon: Icons.directions_bus, title: 'النقل', index: 4),
          _buildDrawerItem(icon: Icons.favorite, title: 'المفضلة', index: 5),
          _buildDrawerItem(icon: Icons.book_online, title: 'حجوزاتي', index: 6),
          _buildDrawerItem(icon: Icons.currency_exchange, title: 'تحويل العملات', index: 7),

          const Divider(),

          ListTile(
            leading: const Icon(Icons.logout, color: Colors.red),
            title: const Text('تسجيل الخروج', style: TextStyle(color: Colors.red)),
            onTap: _logout,
          ),
        ],
      ),
    );
  }

  Widget _buildDrawerItem({
    required IconData icon,
    required String title,
    required int index,
  }) {
    final isSelected = widget.currentIndex == index;
    return ListTile(
      leading: Icon(
        icon,
        color: isSelected ? const Color(0xFF6366F1) : Colors.grey,
      ),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? const Color(0xFF6366F1) : Colors.black,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      onTap: () {
        widget.onItemSelected(index);
        Navigator.pop(context);
      },
    );
  }
}