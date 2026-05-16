import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

import '../widgets/custom_appbar.dart';
import '../widgets/main_drawer.dart';

class MapView extends StatelessWidget {
  const MapView({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FBFF),

      // ✅ نفس ستايل التطبيق
      drawer: const MainDrawer(),
      appBar: const CustomAppBar(),

      body: FlutterMap(
        options: MapOptions(
          initialCenter: LatLng(33.5138, 36.2765),
          initialZoom: 12,
        ),
        children: [
          TileLayer(
            urlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            userAgentPackageName: 'com.example.syrtrip',
          ),
          MarkerLayer(
            markers: [
              Marker(
                point: LatLng(33.5138, 36.2765),
                width: 50,
                height: 50,
                child: const Icon(
                  Icons.location_pin,
                  color: Colors.red,
                  size: 40,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}