import { useTranslation } from 'react-i18next';
import { ButtonLink } from '../components/Button';

export function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-md px-6 py-20 text-center">
      <p className="text-5xl font-bold text-blue-600">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-slate-800">{t('notFound.title')}</h1>
      <p className="mt-2 text-slate-600">{t('notFound.text')}</p>
      <ButtonLink to="/" variant="primary" className="mt-6">
        {t('notFound.back')}
      </ButtonLink>
    </div>
  );
}
