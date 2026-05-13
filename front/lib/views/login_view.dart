import 'package:flutter/material.dart';

import '../controllers/auth_controller.dart';
import '../widgets/custom_button.dart';
import 'home_view.dart';
import 'signup_view.dart';

class LoginView extends StatefulWidget {
  const LoginView({super.key});

  @override
  State<LoginView> createState() => _LoginViewState();
}

class _LoginViewState extends State<LoginView> {
  final AuthController _auth = AuthController();

  String? errorMessage;

  bool isLoading = false;
  bool obscurePassword = true;

  String selectedLanguage = "العربية";

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F8F6),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(
            horizontal: 24,
            vertical: 20,
          ),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              /// language button
              Align(
                alignment: Alignment.topLeft,
                child: PopupMenuButton<String>(
                  icon: const Icon(
                    Icons.language,
                    color: Color(0xFF2E7D63),
                  ),
                  onSelected: (value) {
                    setState(() {
                      selectedLanguage = value;
                    });

                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text("تم تغيير اللغة إلى $value"),
                      ),
                    );
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: "العربية",
                      child: Text("العربية"),
                    ),
                    const PopupMenuItem(
                      value: "English",
                      child: Text("English"),
                    ),
                    const PopupMenuItem(
                      value: "Français",
                      child: Text("Français"),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 10),

              /// logo
              Center(
                child: Container(
                  height: 170,
                  width: 170,
                  padding: const EdgeInsets.all(18),

                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),

                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),

                  child: Image.asset(
                    "assets/logo.png",
                    fit: BoxFit.contain,
                  ),
                ),
              ),

              const SizedBox(height: 30),

              const Text(
                "مرحباً بك",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF2E7D63),
                ),
              ),

              const SizedBox(height: 8),

              const Text(
                "سجل الدخول لاستكشاف سوريا",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  color: Colors.grey,
                ),
              ),

              const SizedBox(height: 35),

              /// email
              TextField(
                controller: _auth.emailController,

                decoration: InputDecoration(
                  hintText: "البريد الإلكتروني",

                  prefixIcon: const Icon(
                    Icons.email_outlined,
                    color: Color(0xFF2E7D63),
                  ),

                  filled: true,
                  fillColor: Colors.white,

                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 18),

              /// password
              TextField(
                controller: _auth.passwordController,
                obscureText: obscurePassword,

                decoration: InputDecoration(
                  hintText: "كلمة المرور",

                  prefixIcon: const Icon(
                    Icons.lock_outline,
                    color: Color(0xFF2E7D63),
                  ),

                  suffixIcon: IconButton(
                    icon: Icon(
                      obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        obscurePassword = !obscurePassword;
                      });
                    },
                  ),

                  filled: true,
                  fillColor: Colors.white,

                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 14),

              /// error
              if (errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Text(
                    errorMessage!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      color: Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

              const SizedBox(height: 10),

              /// login button
              isLoading
                  ? const Center(
                      child: CircularProgressIndicator(),
                    )
                  : CustomButton(
                      text: "تسجيل الدخول",

                      color: const Color(0xFF2E7D63),

                      icon: Icons.login,

                      onPressed: () async {
                        setState(() {
                          isLoading = true;
                          errorMessage = null;
                        });

                        final success = await _auth.login(
                          _auth.emailController.text.trim(),
                          _auth.passwordController.text.trim(),
                        );

                        setState(() {
                          isLoading = false;
                        });

                        if (success && mounted) {
                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const HomeView(),
                            ),
                          );
                        } else {
                          setState(() {
                            errorMessage =
                                "البريد الإلكتروني أو كلمة المرور غير صحيحة";
                          });
                        }
                      },
                    ),

              const SizedBox(height: 16),

              /// guest button
              OutlinedButton.icon(
                icon: const Icon(
                  Icons.person_outline,
                  color: Color(0xFF2E7D63),
                ),

                label: const Text(
                  "الدخول كزائر",
                  style: TextStyle(
                    color: Color(0xFF2E7D63),
                    fontWeight: FontWeight.bold,
                  ),
                ),

                style: OutlinedButton.styleFrom(
                  minimumSize: const Size(double.infinity, 55),

                  side: const BorderSide(
                    color: Color(0xFF2E7D63),
                  ),

                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(18),
                  ),
                ),

                onPressed: () {
                  Navigator.pushReplacement(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const HomeView(),
                    ),
                  );
                },
              ),

              const SizedBox(height: 16),

              

              const SizedBox(height: 20),

              /// signup
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text(
                    "ليس لديك حساب؟",
                    style: TextStyle(color: Colors.grey),
                  ),

                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const SignupView(),
                        ),
                      );
                    },

                    child: const Text(
                      "إنشاء حساب",
                      style: TextStyle(
                        color: Color(0xFF2E7D63),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _auth.dispose();
    super.dispose();
  }
}