import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import '../controllers/auth_controller.dart';
import 'login_view.dart';
import 'home_view.dart';

class SplashView extends StatefulWidget {
  const SplashView({super.key});

  @override
  State<SplashView> createState() => _SplashViewState();
}

class _SplashViewState extends State<SplashView> with TickerProviderStateMixin {
  final AuthController _auth = AuthController();

  bool _navigated = false;

  @override
  void initState() {
    super.initState();
    _checkLogin();
  }

  Future<void> _checkLogin() async {
    await Future.delayed(const Duration(seconds: 5));
    await _goNext();
  }

  Future<void> _goNext() async {
    if (_navigated) return;
    _navigated = true;

    bool loggedIn = await _auth.isLoggedIn();

    if (!mounted) return;

    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (_) => loggedIn ? const HomeView() : const LoginView(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,

      // ✅ هذا هو التعديل المهم
      body: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: _goNext,
        child: Center(
          child: Lottie.asset(
            'assets/animations/splash.json',
            width: 250,
            height: 250,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}