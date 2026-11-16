import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-200 px-6 py-6">
      <div className="mx-auto flex max-w-244 flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:justify-between">
        <span>{t('landing.footer')}</span>
        <span>{t('landing.footerData')}</span>
      </div>
    </footer>
  );
}
