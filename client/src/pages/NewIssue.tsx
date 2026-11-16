import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { api } from '../lib/api';
import type { OfficialIssue } from '../components/IssueMap';
import { useToast } from '../context/toast-context';
import { Button } from '../components/Button';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const NEARBY_RADIUS_KM = 0.1;

function LocationPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export function NewIssue() {
  const { t } = useTranslation();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('pothole');
  const [municipality, setMunicipality] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearby, setNearby] = useState<OfficialIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function pickLocation(lat: number, lng: number) {
    setLocation({ lat, lng });
    setNearby([]);
  }

  useEffect(() => {
    if (!location) return;
    let cancelled = false;

    api
      .get('/official-issues', {
        params: { lat: location.lat, lng: location.lng, radius: NEARBY_RADIUS_KM },
      })
      .then((res) => {
        if (!cancelled) setNearby(res.data.issues);
      })
      .catch(() => {
        if (!cancelled) setNearby([]);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  // 3 closest reports
  const nearbyShown = location
    ? nearby
        .map((issue) => ({
          issue,
          meters: Math.round(
            L.latLng(location.lat, location.lng).distanceTo([
              issue.location.lat,
              issue.location.lng,
            ]),
          ),
        }))
        .sort((a, b) => a.meters - b.meters)
        .slice(0, 3)
    : [];

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!location) {
      setError(t('issueForm.errorNoLocation'));
      return;
    }

    try {
      await api.post('/issues', { title, description, category, municipality, location });
      showToast(t('toast.issueCreated'));
      navigate('/issues');
    } catch {
      setError(t('issueForm.errorFailed'));
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-semibold text-slate-800 mb-4">{t('issueForm.title')}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('issueForm.fieldTitle')}
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('issueForm.fieldDescription')}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('issueForm.fieldCategory')}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          >
            <option value="pothole">{t('issueForm.categoryPothole')}</option>
            <option value="streetlight">{t('issueForm.categoryStreetlight')}</option>
            <option value="graffiti">{t('issueForm.categoryGraffiti')}</option>
            <option value="waste">{t('issueForm.categoryWaste')}</option>
            <option value="other">{t('issueForm.categoryOther')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">
            {t('issueForm.fieldMunicipality')}
          </label>
          <input
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            required
            className="mt-1 w-full border border-slate-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {t('issueForm.fieldLocation')} {location && '✓'}
          </label>
          <MapContainer center={[61.0587, 28.1887]} zoom={12} className="h-64 w-full rounded-lg">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationPicker onPick={pickLocation} />
            {location && <Marker position={[location.lat, location.lng]} icon={defaultIcon} />}
          </MapContainer>

          {nearbyShown.length > 0 && (
            <div className="mt-2 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-slate-700">
              <p className="font-medium text-amber-900">{t('issueForm.nearby.title')}</p>
              <p className="text-xs text-slate-600">{t('issueForm.nearby.intro')}</p>
              <ul className="mt-2 space-y-2">
                {nearbyShown.map(({ issue, meters }) => (
                  <li key={issue.id}>
                    <span className="font-medium">{issue.title}</span>
                    <span className="text-xs text-slate-500">
                      {' '}
                      · {t('issueForm.nearby.meters', { m: meters })} ·{' '}
                      {t(`issueDetail.status.${issue.status}`)}
                    </span>
                    <p className="text-xs text-slate-600">{issue.description}</p>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500">{t('issueForm.nearby.source')}</p>
            </div>
          )}
        </div>

        <Button type="submit" className="w-full">
          {t('issueForm.submit')}
        </Button>
      </form>
    </div>
  );
}
