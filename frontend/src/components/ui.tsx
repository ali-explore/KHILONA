import { ButtonHTMLAttributes, ReactNode } from "react";
import { ArrowRight } from "lucide-react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-card border border-line bg-panel ${className}`}>{children}</section>;
}

export function CardHeader({ index, title, right }: { index?: string; title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-3">
        {index && <span className="text-[11px] font-medium text-brand">{index}</span>}
        <h2 className="text-[17px] font-semibold">{title}</h2>
      </div>
      {right}
    </div>
  );
}

type Tone = "blue" | "yellow" | "green" | "neutral" | "red";
const tones: Record<Tone, string> = {
  blue: "text-brand border-brand/30 bg-brand/10",
  yellow: "text-yellow border-yellow/30 bg-yellow/10",
  green: "text-ok border-ok/30 bg-ok/10",
  red: "text-red-400 border-red-400/30 bg-red-400/10",
  neutral: "text-muted border-line bg-app/60",
};
export function Pill({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-[11px] ${tones[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: "primary" | "secondary"; arrow?: boolean }
export function Button({ variant = "secondary", arrow = true, className = "", children, ...rest }: BtnProps) {
  const base = "inline-flex items-center justify-between gap-6 rounded-lg px-5 py-3 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const look = variant === "primary"
    ? "bg-brand text-white hover:bg-blue-400"
    : "border border-line bg-raised text-ink hover:border-brand/50 hover:bg-[#182749]";
  return (
    <button className={`${base} ${look} ${className}`} {...rest}>
      {children}
      {arrow && <ArrowRight size={15} />}
    </button>
  );
}

export function PageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 max-w-2xl text-[13px] text-muted">{subtitle}</p>
    </header>
  );
}

export function Notice({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="mb-5 flex flex-col gap-1 rounded-card border border-brand/20 bg-brand/10 px-5 py-3.5 text-[12px] sm:flex-row sm:items-center sm:gap-8">
      <span className="eyebrow shrink-0">{label}</span>
      <span className="text-muted">{children}</span>
    </div>
  );
}
