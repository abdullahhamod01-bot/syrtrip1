import 'package:permission_handler/permission_handler.dart';

class PermissionService {
  static Future<void> requestAppPermissions() async {
    await _requestNotificationPermission();
    await _requestLocationPermission();
  }

  static Future<bool> _requestNotificationPermission() async {
    final status = await Permission.notification.status;

    if (status.isGranted || status.isLimited) {
      return true;
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }

    final result = await Permission.notification.request();
    return result.isGranted || result.isLimited;
  }

  static Future<bool> _requestLocationPermission() async {
    final status = await Permission.locationWhenInUse.status;

    if (status.isGranted || status.isLimited) {
      return true;
    }

    if (status.isPermanentlyDenied) {
      await openAppSettings();
      return false;
    }

    final result = await Permission.locationWhenInUse.request();
    return result.isGranted || result.isLimited;
  }

  static Future<Map<String, bool>> getPermissionState() async {
    final notificationStatus = await Permission.notification.status;
    final locationStatus = await Permission.locationWhenInUse.status;

    return {
      'notifications':
          notificationStatus.isGranted || notificationStatus.isLimited,
      'location': locationStatus.isGranted || locationStatus.isLimited,
    };
  }
}
