import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { categoryLabel } from '../lib/categories';

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

export interface OfficialIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  municipality: string;
  location: { lat: number; lng: number };
}

function FitBounds({ points }: { points: { location: { lat: number; lng: number } }[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points.map((p) => [p.location.lat, p.location.lng]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [points, map]);

  return null;
}

interface IssueMapProps {
  issues: Issue[];
  officialIssues?: OfficialIssue[];
}

export function IssueMap({ issues, officialIssues = [] }: IssueMapProps) {
  const fallbackCenter: [number, number] = [60.1699, 24.9384]; // Helsinki

  const { t } = useTranslation();

  return (
    <MapContainer center={fallbackCenter} zoom={11} className="h-96 w-full rounded-lg">
      <FitBounds points={officialIssues.length > 0 ? officialIssues : issues} />
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
            {categoryLabel(t, issue.category)} · {t(`issueDetail.status.${issue.status}`)}
          </Popup>
        </Marker>
      ))}
      {officialIssues.map((issue) => (
        <CircleMarker
          key={issue.id}
          center={[issue.location.lat, issue.location.lng]}
          radius={8}
          pathOptions={{ color: '#b45309', fillColor: '#f59e0b', fillOpacity: 0.85 }}
        >
          <Popup>
            <strong>{issue.title}</strong>
            <br />
            {issue.description}
            <br />
            <em>
              {t('mapPopup.officialSource')} · {categoryLabel(t, issue.category)} ·{' '}
              {t(`issueDetail.status.${issue.status}`)}
            </em>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
