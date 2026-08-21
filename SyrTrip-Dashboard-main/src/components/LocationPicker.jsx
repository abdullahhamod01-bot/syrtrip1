import { useEffect, useRef, useState } from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { MapPin } from "lucide-react";

const DEFAULT_CENTER = { lat: 33.5138, lng: 36.2765 };
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (GOOGLE_MAPS_API_KEY) {
  setOptions({ key: GOOGLE_MAPS_API_KEY, version: "weekly" });
}

const getCoordinate = (value, fallback) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

export default function LocationPicker({ lat, lng, onChange }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [initialCoordinates] = useState(() => ({ lat, lng }));
  const onChangeRef = useRef(onChange);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    let cancelled = false;

    const initializeMap = async () => {
      if (!GOOGLE_MAPS_API_KEY) {
        setStatus("error");
        setError("لم يتم إعداد مفتاح Google Maps.");
        return;
      }

      try {
        const { Map } = await importLibrary("maps");
        const mapsApi = window.google?.maps;
        if (cancelled || !mapElementRef.current) return;

        const initialPosition = {
          lat: getCoordinate(initialCoordinates.lat, DEFAULT_CENTER.lat),
          lng: getCoordinate(initialCoordinates.lng, DEFAULT_CENTER.lng),
        };

        const map = new Map(mapElementRef.current, {
          center: initialPosition,
          zoom: initialCoordinates.lat && initialCoordinates.lng ? 15 : 12,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
        });

        const marker = new mapsApi.Marker({
          map,
          position: initialPosition,
          draggable: true,
          title: "موقع المنشأة",
        });

        const updateLocation = (position) => {
          const latValue =
            typeof position.lat === "function" ? position.lat() : position.lat;
          const lngValue =
            typeof position.lng === "function" ? position.lng() : position.lng;
          const nextLocation = {
            latitude: Number(Number(latValue).toFixed(6)),
            longitude: Number(Number(lngValue).toFixed(6)),
          };
          onChangeRef.current?.(nextLocation);
        };

        map.addListener("click", (event) => {
          if (!event.latLng) return;
          marker.setPosition(event.latLng);
          updateLocation(event.latLng);
        });

        marker.addListener("dragend", () => {
          const position = marker.getPosition();
          if (position) updateLocation(position);
        });

        mapRef.current = map;
        markerRef.current = marker;
        setStatus("ready");
      } catch (loadError) {
        console.error("Error loading Google Maps:", loadError);
        if (!cancelled) {
          setStatus("error");
          setError("تعذر تحميل خرائط Google. يمكنك إدخال الإحداثيات يدويًا.");
        }
      }
    };

    initializeMap();
    return () => {
      cancelled = true;
      if (markerRef.current) markerRef.current.setMap(null);
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [initialCoordinates]);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const position = {
      lat: getCoordinate(lat, DEFAULT_CENTER.lat),
      lng: getCoordinate(lng, DEFAULT_CENTER.lng),
    };
    markerRef.current.setPosition(position);
    mapRef.current.panTo(position);
  }, [lat, lng]);

  return (
    <div style={{ marginTop: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <MapPin size={17} color="#667eea" />
        <span style={{ color: "#374151", fontSize: 14, fontWeight: 600 }}>
          حدد الموقع بدقة
        </span>
      </div>
      <div
        style={{
          position: "relative",
          height: 280,
          overflow: "hidden",
          border: "1px solid #dbe3ea",
          borderRadius: 14,
          background: "#eef2f6",
        }}
      >
        <div ref={mapElementRef} style={{ width: "100%", height: "100%" }} />
        {status === "loading" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              background: "rgba(248,250,252,0.86)",
              color: "#667eea",
              fontSize: 13,
            }}
          >
            جار تحميل الخريطة...
          </div>
        )}
        {status === "error" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              padding: 20,
              textAlign: "center",
              background: "#f8fafc",
              color: "#64748b",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </div>
      <p style={{ margin: "8px 0 0", color: "#94a3b8", fontSize: 12 }}>
        انقر على الخريطة أو اسحب الدبوس لتحديد موقع المنشأة بدقة.
      </p>
    </div>
  );
}
