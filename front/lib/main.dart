import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'views/splash_view.dart';
import 'views/hotels_view.dart';
import 'views/attractions_view.dart';
import 'views/restaurants_view.dart';
import 'views/bookings_view.dart';
import 'views/transport_view.dart';
import 'views/detail_view.dart';
import 'views/currency_view.dart';

import 'providers/app_provider.dart';
import 'providers/hotelas_filter_provider.dart';
import 'providers/transport_filter_provider.dart';
import 'providers/restaurant_filter_provider.dart';
import 'providers/attraction_filter_provider.dart';
import 'providers/comments_provider.dart';

void main() {
  runApp(const SyrTripApp());
}

class SyrTripApp extends StatelessWidget {
  const SyrTripApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AppProvider()),
        ChangeNotifierProvider(create: (_) => FilterProvider()),
        ChangeNotifierProvider(create: (_) => TransportFilterProvider()),
        ChangeNotifierProvider(create: (_) => RestaurantFilterProvider()),
        ChangeNotifierProvider(create: (_) => AttractionFilterProvider()),
        ChangeNotifierProvider(create: (_) => CommentsProvider()),
      ],
      child: Consumer<AppProvider>(
        builder: (context, appProvider, _) {
          return MaterialApp(
            title: 'SyrTrip',
            debugShowCheckedModeBanner: false,

            theme: ThemeData(
              primaryColor: Colors.green,
              scaffoldBackgroundColor: Colors.white,
              fontFamily: 'Cairo',
              useMaterial3: true,

              colorScheme: ColorScheme.fromSeed(seedColor: Colors.green),

              appBarTheme: const AppBarTheme(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                centerTitle: true,
              ),

              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green,
                  foregroundColor: Colors.white,
                ),
              ),
            ),

            darkTheme: ThemeData.dark().copyWith(
              
              colorScheme: ColorScheme.fromSeed(
                seedColor: Colors.green,
                brightness: Brightness.dark,
              ),
              scaffoldBackgroundColor: const Color(0xFF121212),
              appBarTheme: const AppBarTheme(
                backgroundColor: Color(0xFF1B5E20),
                foregroundColor: Colors.white,
                centerTitle: true,
              ),
              elevatedButtonTheme: ElevatedButtonThemeData(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green[700],
                  foregroundColor: Colors.white,
                ),
              ),
            ),

            themeMode: appProvider.isDarkMode
                ? ThemeMode.dark
                : ThemeMode.light,
            home: const SplashView(),

            routes: {
              '/hotels': (context) => const HotelsView(),
              '/attractions': (context) => const AttractionsView(),
              '/restaurants': (context) => const RestaurantsView(),
              '/transport': (context) => const TransportView(),
              '/currency': (context) => const CurrencyView(),
               '/bookings': (context) => const BookingsView(),
              DetailView.routeName: (context) => const DetailView(),
            },
          );
        },
      ),
    );
  }
}
