// ignore_for_file: deprecated_member_use

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../providers/app_provider.dart';
import '../widgets/main_drawer.dart';

class CurrencyView extends StatefulWidget {
  const CurrencyView({super.key});

  @override
  State<CurrencyView> createState() => _CurrencyViewState();
}

class _CurrencyViewState extends State<CurrencyView> {
  final TextEditingController amountController = TextEditingController(
    text: '1',
  );

  double convertedAmount = 0;

  void _calculate(AppProvider provider) {
    final value = double.tryParse(amountController.text) ?? 0;

    setState(() {
      convertedAmount = provider.convertCurrency(value);
    });
  }

  @override
  void initState() {
    super.initState();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = Provider.of<AppProvider>(
        context,
        listen: false,
      );

      _calculate(provider);
    });
  }

  @override
  void dispose() {
    amountController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const MainDrawer(),

      appBar: AppBar(
        backgroundColor: const Color(0xFF2E7D63),
        elevation: 0,
        centerTitle: true,

        /// زر القائمة صار على اليسار
        leading: Builder(
          builder: (context) => IconButton(
            icon: const Icon(
              Icons.menu,
              color: Colors.white,
            ),
            onPressed: () {
              Scaffold.of(context).openDrawer();
            },
          ),
        ),

        title: const Text(
          'صرف العملة',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),

        /// زر الرجوع صار على اليمين
        actions: [
          IconButton(
            icon: const Icon(
              Icons.arrow_forward_ios,
              color: Colors.white,
            ),
            onPressed: () {
              Navigator.pop(context);
            },
          ),
        ],
      ),

      body: Consumer<AppProvider>(
        builder: (context, provider, child) {
          return Padding(
            padding: const EdgeInsets.all(16),

            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,

              children: [
                /// حقل المبلغ
                TextField(
                  controller: amountController,
                  keyboardType: TextInputType.number,

                  decoration: InputDecoration(
                    labelText: 'المبلغ',

                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),

                    prefixIcon: const Icon(Icons.attach_money),
                  ),

                  onChanged: (_) => _calculate(provider),
                ),

                const SizedBox(height: 16),

                /// اختيار العملات
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: provider.currencyFrom,

                        decoration: InputDecoration(
                          labelText: 'من',

                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),

                        items: provider.currencyCodes
                            .map(
                              (code) => DropdownMenuItem(
                                value: code,
                                child: Text(code),
                              ),
                            )
                            .toList(),

                        onChanged: (value) {
                          if (value != null) {
                            provider.setCurrencyFrom(value);
                            _calculate(provider);
                          }
                        },
                      ),
                    ),

                    const SizedBox(width: 12),

                    Expanded(
                      child: DropdownButtonFormField<String>(
                        value: provider.currencyTo,

                        decoration: InputDecoration(
                          labelText: 'إلى',

                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),

                        items: provider.currencyCodes
                            .map(
                              (code) => DropdownMenuItem(
                                value: code,
                                child: Text(code),
                              ),
                            )
                            .toList(),

                        onChanged: (value) {
                          if (value != null) {
                            provider.setCurrencyTo(value);
                            _calculate(provider);
                          }
                        },
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 20),

                /// بطاقة النتيجة
                Container(
                  padding: const EdgeInsets.all(18),

                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),

                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black12,
                        blurRadius: 8,
                        offset: Offset(0, 4),
                      ),
                    ],
                  ),

                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,

                    children: [
                      const Text(
                        'النتيجة',

                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 12),

                      Text(
                        '${amountController.text} ${provider.currencyFrom} = ${convertedAmount.toStringAsFixed(2)} ${provider.currencyTo}',

                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 12),

                      Text(
                        'سعر الصرف: 1 ${provider.currencyFrom} = ${(provider.currencyRates[provider.currencyFrom]! / provider.currencyRates[provider.currencyTo]!).toStringAsFixed(4)} ${provider.currencyTo}',

                        style: const TextStyle(
                          color: Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 18),

                const Text(
                  'أسعار الصرف الحالية',

                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),

                const SizedBox(height: 12),

                /// قائمة العملات
                Expanded(
                  child: ListView(
                    children: provider.currencyRates.entries.map((entry) {
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),

                        padding: const EdgeInsets.all(14),

                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(14),

                          boxShadow: const [
                            BoxShadow(
                              color: Colors.black12,
                              blurRadius: 6,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),

                        child: Row(
                          mainAxisAlignment:
                              MainAxisAlignment.spaceBetween,

                          children: [
                            Text(
                              entry.key,

                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                              ),
                            ),

                            Text(
                              entry.value.toStringAsFixed(2),

                              style: const TextStyle(
                                color: Color(0xFF2E7D63),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}