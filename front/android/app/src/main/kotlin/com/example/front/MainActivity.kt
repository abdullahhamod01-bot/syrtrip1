package com.example.front

import android.Manifest
import android.content.pm.PackageManager
import android.location.LocationManager
import android.location.LocationListener
import android.os.Handler
import android.os.Looper
import androidx.core.content.ContextCompat
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.embedding.android.FlutterActivity
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
	private val channelName = "syrtrip/location"

	override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
		super.configureFlutterEngine(flutterEngine)

		MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
			.setMethodCallHandler { call, result ->
				if (call.method != "getCurrentLocation") {
					result.notImplemented()
					return@setMethodCallHandler
				}

				val hasFinePermission = ContextCompat.checkSelfPermission(
					this,
					Manifest.permission.ACCESS_FINE_LOCATION,
				) == PackageManager.PERMISSION_GRANTED
				val hasCoarsePermission = ContextCompat.checkSelfPermission(
					this,
					Manifest.permission.ACCESS_COARSE_LOCATION,
				) == PackageManager.PERMISSION_GRANTED

				if (!hasFinePermission && !hasCoarsePermission) {
					result.success(null)
					return@setMethodCallHandler
				}

				val locationManager = getSystemService(LOCATION_SERVICE) as LocationManager
				val providers = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER)
				val enabledProviders = providers.filter { locationManager.isProviderEnabled(it) }
				if (enabledProviders.isEmpty()) {
					result.success(null)
					return@setMethodCallHandler
				}

				var completed = false
				val handler = Handler(Looper.getMainLooper())
				lateinit var listener: LocationListener
				fun finish(location: android.location.Location?) {
					if (completed) return
					completed = true
					try { locationManager.removeUpdates(listener) } catch (_: SecurityException) { }
					handler.removeCallbacksAndMessages(null)
					result.success(location?.let {
						mapOf("latitude" to it.latitude, "longitude" to it.longitude)
					})
				}

				listener = object : LocationListener {
					override fun onLocationChanged(location: android.location.Location) = finish(location)
				}
				try {
					enabledProviders.forEach { provider ->
						locationManager.requestLocationUpdates(
							provider, 0L, 0f, listener, Looper.getMainLooper()
						)
					}
					handler.postDelayed({
						val fallback = enabledProviders.mapNotNull { provider ->
							try { locationManager.getLastKnownLocation(provider) } catch (_: SecurityException) { null }
						}.maxByOrNull { it.time }
						finish(fallback)
					}, 8000L)
				} catch (_: SecurityException) {
					finish(null)
				}
			}
	}
}
