import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/app_provider.dart';

class CurrencyConverterView extends StatefulWidget {
  const CurrencyConverterView({super.key});

  @override
  State<CurrencyConverterView> createState() => _CurrencyConverterViewState();
}

class _CurrencyConverterViewState extends State<CurrencyConverterView> {
  final TextEditingController _amountController = TextEditingController(text: '1000');
  String _fromCurrency = 'SYP';
  String _toCurrency = 'USD';
  double _result = 0.0;

  // ===== Exchange Rates (Demo) =====
  final Map<String, Map<String, double>> _rates = {
    'SYP': {'USD': 0.0000769, 'EUR': 0.0000714, 'SYP': 1.0},
    'USD': {'SYP': 13000.0, 'EUR': 0.928, 'USD': 1.0},
    'EUR': {'SYP': 14000.0, 'USD': 1.077, 'EUR': 1.0},
  };

  final Map<String, Map<String, String>> _currencyInfo = {
    'SYP': {'nameAr': 'ليرة سورية', 'nameEn': 'Syrian Pound', 'symbol': 'ل.س', 'flag': '🇸🇾'},
    'USD': {'nameAr': 'دولار أمريكي', 'nameEn': 'US Dollar', 'symbol': r'$', 'flag': '🇺🇸'},
    'EUR': {'nameAr': 'يورو', 'nameEn': 'Euro', 'symbol': '€', 'flag': '🇪🇺'},
  };

  @override
  void initState() {
    super.initState();
    _calculate();
  }

  void _calculate() {
    final amount = double.tryParse(_amountController.text) ?? 0;
    final rate = _rates[_fromCurrency]![_toCurrency] ?? 1.0;
    setState(() => _result = amount * rate);
  }

  void _swapCurrencies() {
    setState(() {
      final temp = _fromCurrency;
      _fromCurrency = _toCurrency;
      _toCurrency = temp;
    });
    _calculate();
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = Provider.of<AppProvider>(context);
    final isAr = appProvider.isArabic;
    final isDark = appProvider.isDarkMode;

    return Scaffold(
      appBar: AppBar(
        title: Text(
          isAr ? 'محول العملات' : 'Currency Converter',
          style: const TextStyle(fontFamily: 'Tajawal', fontWeight: FontWeight.bold),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            _buildAmountCard(isAr, isDark),
            const SizedBox(height: 20),
            _buildSwapButton(),
            const SizedBox(height: 20),
            _buildToCurrencyCard(isAr, isDark),
            const SizedBox(height: 30),
            _buildResultCard(isAr, isDark),
            const SizedBox(height: 30),
            _buildQuickAmounts(isAr),
            const SizedBox(height: 20),
            _buildRateInfo(isAr),
          ],
        ),
      ),
    );
  }

  Widget _buildAmountCard(bool isAr, bool isDark) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isAr ? 'المبلغ' : 'Amount',
              style: TextStyle(fontSize: 14, color: Colors.grey[600], fontFamily: 'Tajawal'),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _amountController,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
                    decoration: InputDecoration(
                      hintText: '0',
                      hintStyle: TextStyle(fontSize: 32, color: Colors.grey[400], fontFamily: 'Tajawal'),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.zero,
                    ),
                    onChanged: (_) => _calculate(),
                  ),
                ),
                const SizedBox(width: 12),
                _buildCurrencySelector(
                  currency: _fromCurrency,
                  onTap: () => _showCurrencyPicker(isAr, true),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(
              isAr
                  ? '${_currencyInfo[_fromCurrency]!['nameAr']} (${_currencyInfo[_fromCurrency]!['symbol']})'
                  : '${_currencyInfo[_fromCurrency]!['nameEn']} (${_currencyInfo[_fromCurrency]!['symbol']})',
              style: TextStyle(fontSize: 14, color: Colors.grey[500], fontFamily: 'Tajawal'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSwapButton() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1B5E20).withOpacity(0.1),
        shape: BoxShape.circle,
      ),
      child: IconButton(
        onPressed: _swapCurrencies,
        icon: const Icon(Icons.swap_vert, color: Color(0xFF1B5E20), size: 28),
        padding: const EdgeInsets.all(16),
      ),
    );
  }

  Widget _buildToCurrencyCard(bool isAr, bool isDark) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isAr ? 'العملة المستهدفة' : 'Target Currency',
              style: TextStyle(fontSize: 14, color: Colors.grey[600], fontFamily: 'Tajawal'),
            ),
            const SizedBox(height: 16),
            InkWell(
              onTap: () => _showCurrencyPicker(isAr, false),
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? Colors.grey[800] : Colors.grey[100],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    Text(_currencyInfo[_toCurrency]!['flag']!, style: const TextStyle(fontSize: 32)),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isAr ? _currencyInfo[_toCurrency]!['nameAr']! : _currencyInfo[_toCurrency]!['nameEn']!,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            _currencyInfo[_toCurrency]!['symbol']!,
                            style: TextStyle(fontSize: 14, color: Colors.grey[600], fontFamily: 'Tajawal'),
                          ),
                        ],
                      ),
                    ),
                    const Icon(Icons.arrow_forward_ios, size: 16),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildResultCard(bool isAr, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: isDark
              ? [const Color(0xFF2E7D32), const Color(0xFF1B5E20)]
              : [const Color(0xFF4CAF50), const Color(0xFF2E7D32)],
        ),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF1B5E20).withOpacity(0.3),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Column(
        children: [
          Text(
            isAr ? 'النتيجة' : 'Result',
            style: TextStyle(fontSize: 14, color: Colors.white.withOpacity(0.8), fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 12),
          Text(
            '${_formatNumber(_result)} ${_currencyInfo[_toCurrency]!['symbol']}',
            style: const TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: Colors.white, fontFamily: 'Tajawal'),
          ),
          const SizedBox(height: 8),
          Text(
            '1 ${_currencyInfo[_fromCurrency]!['symbol']} = ${_rates[_fromCurrency]![_toCurrency]} ${_currencyInfo[_toCurrency]!['symbol']}',
            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.7), fontFamily: 'Tajawal'),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAmounts(bool isAr) {
    final amounts = [100, 500, 1000, 5000, 10000, 50000];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isAr ? 'مبالغ سريعة' : 'Quick Amounts',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600, fontFamily: 'Tajawal'),
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: amounts.map((amount) {
            return ActionChip(
              label: Text(_formatNumber(amount.toDouble()), style: const TextStyle(fontFamily: 'Tajawal')),
              backgroundColor: Colors.grey[200],
              onPressed: () {
                _amountController.text = amount.toString();
                _calculate();
              },
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildRateInfo(bool isAr) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.info_outline, color: Colors.amber),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              isAr
                  ? 'الأسعار تقريبية وقد تتغير. يرجى التحقق من البنك المركزي للأسعار الرسمية.'
                  : 'Rates are approximate and may vary. Please check the Central Bank for official rates.',
              style: const TextStyle(fontSize: 12, color: Colors.amber, fontFamily: 'Tajawal'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCurrencySelector({required String currency, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF1B5E20).withOpacity(0.1),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(_currencyInfo[currency]!['flag']!, style: const TextStyle(fontSize: 24)),
            const SizedBox(width: 8),
            Text(currency, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, fontFamily: 'Tajawal')),
            const SizedBox(width: 4),
            const Icon(Icons.arrow_drop_down, size: 20),
          ],
        ),
      ),
    );
  }

  void _showCurrencyPicker(bool isAr, bool isFrom) {
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
              isAr ? 'اختر العملة' : 'Select Currency',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'Tajawal'),
            ),
            const SizedBox(height: 16),
            ..._currencyInfo.entries.map((entry) {
              final code = entry.key;
              final info = entry.value;
              final isSelected = isFrom ? _fromCurrency == code : _toCurrency == code;
              return ListTile(
                leading: Text(info['flag']!, style: const TextStyle(fontSize: 32)),
                title: Text(
                  isAr ? info['nameAr']! : info['nameEn']!,
                  style: TextStyle(fontFamily: 'Tajawal', fontWeight: isSelected ? FontWeight.bold : FontWeight.normal),
                ),
                subtitle: Text('${info['symbol']} - $code', style: const TextStyle(fontFamily: 'Tajawal', fontSize: 12)),
                trailing: isSelected ? const Icon(Icons.check_circle, color: Color(0xFF1B5E20)) : null,
                onTap: () {
                  setState(() {
                    if (isFrom) _fromCurrency = code;
                    else _toCurrency = code;
                  });
                  _calculate();
                  Navigator.pop(context);
                },
              );
            }).toList(),
          ],
        ),
      ),
    );
  }

  String _formatNumber(double number) {
    if (number == 0) return '0';
    if (number < 1) return number.toStringAsFixed(4);
    if (number < 1000) return number.toStringAsFixed(2);
    return number.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  @override
  void dispose() {
    _amountController.dispose();
    super.dispose();
  }
}