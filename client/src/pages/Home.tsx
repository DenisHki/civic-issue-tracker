import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/auth-context';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { categoryLabel } from '../lib/categories';

interface Stats {
  reported: number;
  in_progress: number;
  resolved: number;
  total: number;
}

interface LatestIssue {
  _id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  municipality: string;
  upvoteCount: number;
}

const STAT_CARDS = [
  { key: 'total', dot: '' },
  { key: 'reported', dot: 'bg-slate-400' },
  { key: 'in_progress', dot: 'bg-blue-500' },
  { key: 'resolved', dot: 'bg-green-500' },
] as const;

const HOW_STEPS = [
  { key: 'report', icon: '📍' },
  { key: 'discuss', icon: '👍' },
  { key: 'follow', icon: '✅' },
] as const;

export function Home() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [latest, setLatest] = useState<LatestIssue[]>([]);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/stats')
      .then((res) => {
        if (!cancelled) setStats(res.data.stats);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    api
      .get('/issues')
      .then((res) => {
        if (!cancelled) setLatest(res.data.issues.slice(0, 3));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <section className="bg-linear-to-b from-blue-50 to-slate-50 px-6 pt-14 pb-10">
        <div className="mx-auto max-w-244 text-center">
          <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm text-blue-700">
            {t('landing.badge')}
          </span>

          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            {t('landing.titleLine1')}
            <br />
            <span className="text-blue-600">{t('landing.titleLine2')}</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{t('landing.subtitle')}</p>

          {!user && <p className="mt-3 text-sm text-slate-500">{t('landing.loginHint')}</p>}

          <div className="mt-8 grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
            {STAT_CARDS.map(({ key, dot }) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="text-3xl font-semibold text-slate-800">
                  {stats ? stats[key] : '–'}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  {dot && <span className={`inline-block h-2.5 w-2.5 rounded-full ${dot}`} />}
                  {t(`landing.stats.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 py-10">
        <h2 className="text-xl font-semibold text-slate-800">{t('landing.howTitle')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {HOW_STEPS.map(({ key, icon }) => (
            <div key={key} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xl">
                {icon}
              </div>
              <h3 className="mt-3 font-medium text-slate-800">{t(`landing.steps.${key}Title`)}</h3>
              <p className="mt-1 text-sm text-slate-600">{t(`landing.steps.${key}Text`)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-semibold text-slate-800">{t('landing.latestTitle')}</h2>
          <Link to="/issues" className="text-sm text-blue-600 hover:underline">
            {t('landing.seeAll')} →
          </Link>
        </div>

        {latest.length === 0 ? (
          <p className="mt-4 text-slate-500">{t('landing.latestEmpty')}</p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {latest.map((issue) => (
              <Link
                key={issue._id}
                to={`/issues/${issue._id}`}
                className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-slate-800">{issue.title}</h3>
                  <StatusBadge status={issue.status} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{issue.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    {issue.municipality} · {categoryLabel(t, issue.category)}
                  </span>
                  <span>👍 {issue.upvoteCount}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
      <section className="mx-auto max-w-5xl px-6 pb-12">
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-amber-900">
            <span className="inline-block h-3 w-3 rounded-full bg-amber-500" />
            {t('landing.officialTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-slate-700">{t('landing.officialText')}</p>
        </div>
      </section>
    </div>
  );
}
