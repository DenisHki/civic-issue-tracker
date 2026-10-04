import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Issue {
  _id: string;
  title: string;
  category: string;
  status: string;
  location: { lat: number; lng: number };
}

export function IssueMap({ issues }: { issues: Issue[] }) {
  const center: [number, number] = issues.length
    ? [issues[0].location.lat, issues[0].location.lng]
    : [61.0587, 28.1887]; // Lappeenranta, fallback if no issues yet

  return (
    <MapContainer center={center} zoom={13} className="h-96 w-full rounded-lg">
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
