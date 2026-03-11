"use client";

import { useTheme } from "@/lib/theme-context";

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="7.5" cy="7.5" r="3" fill="currentColor" />
      <line x1="7.5" y1="0.5" x2="7.5" y2="2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7.5" y1="12.5" x2="7.5" y2="14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="0.5" y1="7.5" x2="2.5" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.5" y1="7.5" x2="14.5" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="2.55" y1="2.55" x2="3.96" y2="3.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="11.04" y1="11.04" x2="12.45" y2="12.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="12.45" y1="2.55" x2="11.04" y2="3.96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="3.96" y1="11.04" x2="2.55" y2="12.45" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 9.5C11 11.2 9.1 12.5 7 12.5C4.0 12.5 1.5 10.0 1.5 7.0C1.5 4.9 2.8 3.0 4.5 2.0C2.4 2.8 1 4.8 1 7.0C1 10.3 3.7 13 7 13C9.2 13 11.2 11.6 12 9.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 active:scale-90"
      style={{
        background: "var(--bg-header-btn)",
        border: "1px solid var(--border-light)",
        color: isDark ? "#f5c842" : "#d4a527",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "var(--bg-header-btn-hover)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--bg-header-btn)";
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}
