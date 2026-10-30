import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { IssueMap } from '../components/IssueMap';
import { useTranslation } from 'react-i18next';

interface Issue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  municipality: string;
  upvoteCount: number;
  location: { lat: number; lng: number };
}

interface Filters {
  q: string;
  municipality: string;
  category: string;
  status: string;
}

const EMPTY_FILTERS: Filters = { q: '', municipality: '', category: '', status: '' };

// Maps a category value from the backend to its translation key.
const CATEGORY_KEYS: Record<string, string> = {
  pothole: 'issueForm.categoryPothole',
  streetlight: 'issueForm.categoryStreetlight',
  graffiti: 'issueForm.categoryGraffiti',
  waste: 'issueForm.categoryWaste',
  other: 'issueForm.categoryOther',
};

const STATUSES = ['reported', 'in_progress', 'resolved'];

export function Issues() {
  const { t } = useTranslation();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  // Debounce 
  useEffect(() => {
    const timer = setTimeout(() => setApplied(filters), 400);
    return () => clearTimeout(timer);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/issues', {
        params: {
          q: applied.q || undefined,
          municipality: applied.municipality || undefined,
          category: applied.category || undefined,
          status: applied.status || undefined,
        },
      })
      .then((res) => {
        if (!cancelled) setIssues(res.data.issues);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [applied]);

  function updateFilter(field: keyof Filters, value: string) {
    setFilters((prev) => ({ ...prev, [field]: value }));
  }

  const hasFilters = Object.values(filters).some((v) => v !== '');
  const inputClass =
    'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-slate-800">{t('issues.title')}</h1>

      <div className="space-y-2">
        <input
          type="search"
          value={filters.q}
          onChange={(e) => updateFilter('q', e.target.value)}
          placeholder={t('issues.filters.search')}
          className={inputClass}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input
            type="text"
            value={filters.municipality}
            onChange={(e) => updateFilter('municipality', e.target.value)}
            placeholder={t('issues.filters.municipality')}
            className={inputClass}
          />
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className={inputClass}
          >
            <option value="">{t('issues.filters.allCategories')}</option>
            {Object.entries(CATEGORY_KEYS).map(([value, key]) => (
              <option key={value} value={value}>
                {t(key)}
              </option>
            ))}
          </select>
          <select
            value={filters.status}
            onChange={(e) => updateFilter('status', e.target.value)}
            className={inputClass}
          >
            <option value="">{t('issues.filters.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`issueDetail.status.${s}`)}
              </option>
            ))}
          </select>
        </div>
        {hasFilters && (
          <button
            onClick={() => setFilters(EMPTY_FILTERS)}
            className="text-sm text-blue-600 hover:underline"
          >
            {t('issues.filters.clear')}
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-slate-600">{t('issues.loading')}</p>
      ) : (
        <>
          <IssueMap issues={issues} />

          {issues.length === 0 && (
            <p className="text-slate-500">
              {hasFilters ? t('issues.filters.noResults') : t('issues.empty')}
            </p>
          )}

          {issues.map((issue) => (
            <div
              key={issue._id}
              className="bg-white rounded-lg shadow-sm p-4 border border-slate-200"
            >
              <div className="flex justify-between items-start gap-2">
                <Link
                  to={`/issues/${issue._id}`}
                  className="font-medium text-slate-800 hover:text-blue-600"
                >
                  {issue.title}
                </Link>
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600 whitespace-nowrap">
                  {t(`issueDetail.status.${issue.status}`)}
                </span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{issue.description}</p>
              <div className="flex justify-between items-center mt-3 text-xs text-slate-500">
                <span>
                  {issue.municipality} ·{' '}
                  {CATEGORY_KEYS[issue.category]
                    ? t(CATEGORY_KEYS[issue.category])
                    : issue.category}
                </span>
                <span>👍 {issue.upvoteCount}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
