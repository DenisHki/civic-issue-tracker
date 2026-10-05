import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useMap } from 'react-leaflet';
import { useEffect } from 'react';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function FitBounds({ issues }: { issues: Issue[] }) {
  const map = useMap();

  useEffect(() => {
    if (issues.length === 0) return;
    const bounds = L.latLngBounds(issues.map((i) => [i.location.lat, i.location.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [issues, map]);

  return null;
}

interface Issue {
  _id: string;
  title: string;
  category: string;
  status: string;
  location: { lat: number; lng: number };
}

export function IssueMap({ issues }: { issues: Issue[] }) {
  const fallbackCenter: [number, number] = [61.0587, 28.1887]; // Lappeenranta

  return (
    <MapContainer center={fallbackCenter} zoom={6} className="h-96 w-full rounded-lg">
      <FitBounds issues={issues} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {issues.map((issue) => (
        <Marker
          key={issue._id}
          position={[issue.location.lat, issue.location.lng]}
          icon={defaultIcon}
        >
          <Popup>
            <strong>{issue.title}</strong>
            <br />
            {issue.category} · {issue.status}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
