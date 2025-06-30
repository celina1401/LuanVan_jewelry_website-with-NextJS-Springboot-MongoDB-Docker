"use client";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

// Thay bằng tọa độ thực tế doanh nghiệp của bạn
const businessLocation = {
  lat: 21.028511, // Hà Nội demo
  lng: 105.804817,
};

export default function BusinessMap() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={businessLocation}
      zoom={16}
    >
      <Marker position={businessLocation} />
    </GoogleMap>
  );
} 