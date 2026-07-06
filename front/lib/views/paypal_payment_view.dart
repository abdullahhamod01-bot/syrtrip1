import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class PayPalPaymentView extends StatelessWidget {
  final String itemName;
  final String itemType;
  final String amount;

  const PayPalPaymentView({
    super.key,
    required this.itemName,
    required this.itemType,
    required this.amount,
  });

  Future<void> _openPayPal() async {
    final Uri url = Uri.parse('https://www.paypal.com/signin');

    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw Exception('Could not launch PayPal');
      }
    } catch (e) {
      debugPrint('URL ERROR: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('دفع PayPal'),
        backgroundColor: const Color(0xFF2E7D63),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const SizedBox(height: 16),
            const Icon(Icons.payment, size: 90, color: Color(0xFF2E7D63)),
            const SizedBox(height: 24),
            Text(
              'إتمام الدفع لعملية $itemType',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            Text('العنصر: $itemName'),
            const SizedBox(height: 8),
            Text('المبلغ: $amount'),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _openPayPal,
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF003087),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('فتح PayPal'),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => Navigator.pop(context, true),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2E7D63),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: const Text('تأكيد الدفع (محاكاة)'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('إلغاء'),
            ),
          ],
        ),
      ),
    );
  }
}
