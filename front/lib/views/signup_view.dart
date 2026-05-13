import 'package:flutter/material.dart';
import '../controllers/auth_controller.dart';
import '../widgets/custom_button.dart';
import 'login_view.dart';

class SignupView extends StatefulWidget {
  const SignupView({super.key});

  @override
  State<SignupView> createState() => _SignupViewState();
}

class _SignupViewState extends State<SignupView> {
  final AuthController _auth = AuthController();

  String? message;
  bool isLoading = false;
  bool obscurePassword = true;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7F5),

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),

          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              /// زر الرجوع + اللغة
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const LoginView(),
                        ),
                      );
                    },
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: Color(0xFF2E7D63),
                    ),
                  ),

                  PopupMenuButton<String>(
                    icon: const Icon(
                      Icons.language,
                      color: Color(0xFF2E7D63),
                    ),
                    onSelected: (value) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text("تم اختيار اللغة: $value"),
                        ),
                      );
                    },
                    itemBuilder: (context) => const [
                      PopupMenuItem(
                        value: "العربية",
                        child: Text("العربية"),
                      ),
                      PopupMenuItem(
                        value: "English",
                        child: Text("English"),
                      ),
                    ],
                  ),
                ],
              ),

              const SizedBox(height: 10),

              /// الشعار
              Center(
                child: Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(30),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 12,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(18),
                    child: Image.asset(
                      "assets/logo.png",
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 25),

              const Center(
                child: Text(
                  "إنشاء حساب جديد",
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFF2E7D63),
                  ),
                ),
              ),

              const SizedBox(height: 10),

              const Center(
                child: Text(
                  "أنشئ حسابك وابدأ رحلتك السياحية",
                  style: TextStyle(
                    color: Colors.grey,
                    fontSize: 15,
                  ),
                ),
              ),

              const SizedBox(height: 35),

              /// اسم المستخدم
              TextField(
                controller: _auth.usernameController,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "اسم المستخدم",
                  prefixIcon: const Icon(
                    Icons.person,
                    color: Color(0xFF2E7D63),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 18),

              /// البريد الإلكتروني
              TextField(
                controller: _auth.emailController,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "البريد الإلكتروني",
                  prefixIcon: const Icon(
                    Icons.email,
                    color: Color(0xFF2E7D63),
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 18),

              /// كلمة المرور
              TextField(
                controller: _auth.passwordController,
                obscureText: obscurePassword,
                decoration: InputDecoration(
                  filled: true,
                  fillColor: Colors.white,
                  hintText: "كلمة المرور",
                  prefixIcon: const Icon(
                    Icons.lock,
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
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(18),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 25),

              /// الرسائل
              if (message != null)
                Container(
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: message!.contains("✅")
                        ? Colors.green
                        : Colors.red,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    message!,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: message!.contains("✅")
                          ? Colors.green
                          : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),

              /// زر التسجيل
              isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                        color: Color(0xFF2E7D63),
                      ),
                    )
                  : CustomButton(
                      text: "إنشاء الحساب",
                      color: const Color(0xFF2E7D63),
                      icon: Icons.person_add,
                      onPressed: () async {
                        setState(() {
                          isLoading = true;
                          message = null;
                        });

                        final username =
                            _auth.usernameController.text.trim();

                        final email =
                            _auth.emailController.text.trim();

                        final password =
                            _auth.passwordController.text.trim();

                        bool success = await _auth.signup(
                          username,
                          email,
                          password,
                        );

                        setState(() {
                          isLoading = false;

                          message = success
                              ? "تم إنشاء الحساب بنجاح ✅"
                              : "فشل إنشاء الحساب ❌";
                        });

                        if (success && mounted) {
                          await Future.delayed(
                            const Duration(seconds: 1),
                          );

                          Navigator.pushReplacement(
                            context,
                            MaterialPageRoute(
                              builder: (_) => const LoginView(),
                            ),
                          );
                        }
                      },
                    ),

              const SizedBox(height: 18),

              /// تسجيل الدخول
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Text("لديك حساب بالفعل؟"),
                  TextButton(
                    onPressed: () {
                      Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const LoginView(),
                        ),
                      );
                    },
                    child: const Text(
                      "تسجيل الدخول",
                      style: TextStyle(
                        color: Color(0xFF2E7D63),
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 20),
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