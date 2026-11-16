import type { ButtonHTMLAttributes } from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'active' | 'dangerGhost';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  active: 'border border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100',
  dangerGhost: 'text-red-600 hover:bg-red-50',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
};

function buttonClass(variant: Variant, size: Size, extra: string): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return <button type="button" className={buttonClass(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends Omit<LinkProps, 'className'> {
  variant?: Variant;
  size?: Size;
  className?: string;
}

export function ButtonLink({
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: ButtonLinkProps) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}
