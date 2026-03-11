"use client";

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = "" }: GlassPanelProps) {
  return (
    <div
      className={`rounded-2xl border border-white/[0.06] p-4 sm:p-6 ${className}`}
      style={{
        background: "var(--bg-glass)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      {children}
    </div>
  );
}

