"use client";

import { useTheme } from "@/lib/theme-context";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 active:scale-90"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
      }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`${isDark ? "Light" : "Dark"} mode`}
    >
      {/* Toggle background track */}
      <div
        className="absolute inset-0 rounded-lg opacity-30"
        style={{
          background: isDark
            ? "rgba(245, 200, 66, 0.1)"
            : "rgba(100, 150, 200, 0.1)",
        }}
      />

      {/* Icons - stacked vertically */}
      <div className="relative flex flex-col items-center justify-center gap-0.5">
        {/* Sun icon (light mode) */}
        <div
          className="text-xs transition-all duration-200"
          style={{
            opacity: isDark ? 0.3 : 1,
            transform: isDark ? "scale(0.7)" : "scale(1)",
            color: isDark ? "#666" : "#f5c842",
          }}
        >
          ◯
        </div>
        {/* Moon icon (dark mode) */}
        <div
          className="text-xs transition-all duration-200"
          style={{
            opacity: isDark ? 1 : 0.3,
            transform: isDark ? "scale(1)" : "scale(0.7)",
            color: isDark ? "#f5c842" : "#666",
          }}
        >
          ◐
        </div>
      </div>
    </button>
  );
}
