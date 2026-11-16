import { useTranslation } from 'react-i18next';

const STYLES: Record<string, string> = {
  reported: 'bg-slate-100 text-slate-700',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
        STYLES[status] ?? 'bg-slate-100 text-slate-600'
      }`}
    >
      {t(`issueDetail.status.${status}`)}
    </span>
  );
}
