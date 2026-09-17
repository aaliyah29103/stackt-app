import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'solid' | 'outline' | 'bordered' | 'dark' | 'subtle'

const VARIANT_CLASSES: Record<Variant, string> = {
  solid:
    'flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-accent text-base font-bold text-white',
  outline:
    'flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-accent bg-white text-base font-bold text-accent',
  bordered:
    'w-full rounded-xl border-2 border-accent bg-accent py-3 text-sm font-extrabold tracking-wide text-white uppercase drop-shadow-[4px_4px_0px_var(--color-ink)] transition-all disabled:border-gray-300 disabled:bg-gray-200 disabled:text-gray-400 disabled:drop-shadow-none',
  dark: 'flex h-14 w-full items-center justify-center rounded-2xl bg-ink text-base font-black tracking-wide text-white uppercase transition-colors disabled:bg-gray-300 disabled:text-gray-400',
  /** Compact, low-emphasis action — a small section-level "Save" rather than a full-page CTA. */
  subtle:
    'inline-flex h-8 items-center justify-center rounded-lg px-3 text-[13px] font-bold text-accent disabled:text-gray-300',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
}

export function Button({
  variant = 'bordered',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  )
}

type LinkButtonProps = LinkProps & {
  variant?: Variant
  icon?: ReactNode
}

export function LinkButton({
  variant = 'solid',
  icon,
  className = '',
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={`${VARIANT_CLASSES[variant]} ${className}`} {...props}>
      {icon}
      {children}
    </Link>
  )
}
