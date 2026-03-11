"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_VARS: Record<Theme, Record<string, string>> = {
  dark: {
    "--text-primary": "#e8e8e8",
    "--text-secondary": "#a0a0a0",
    "--text-muted": "#666",
    "--text-dim": "#888",
    "--bg-panel": "rgba(15, 15, 15, 0.95)",
    "--bg-overlay": "rgba(0, 0, 0, 0.7)",
    "--bg-overlay-dense": "rgba(0, 0, 0, 0.8)",
    "--border-glass": "rgba(255, 255, 255, 0.06)",
    "--border-light": "rgba(255, 255, 255, 0.1)",
    "--bg-glass": "rgba(20, 20, 20, 0.8)",
    "--bg-glass-dense": "rgba(15, 15, 15, 0.95)",
    "--bg-key": "rgba(50, 50, 50, 0.8)",
    "--bg-key-hover": "rgba(70, 70, 70, 0.9)",
    "--bg-subtle": "rgba(30, 30, 30, 0.5)",
    "--bg-header-btn": "rgba(255, 255, 255, 0.05)",
    "--bg-header-btn-hover": "rgba(255, 255, 255, 0.1)",
    "--bg-dist-bar": "rgba(30, 30, 30, 0.6)",
    "--bg-tile-empty": "rgba(20, 20, 20, 0.3)",
    "--bg-keyboard-dock": "rgba(10, 10, 10, 0.97)",
    "--border-keyboard-dock": "rgba(255, 255, 255, 0.06)",
    "--text-key": "#d0d0d0",
  },
  light: {
    "--text-primary": "#1a1a1a",
    "--text-secondary": "#555",
    "--text-muted": "#999",
    "--text-dim": "#777",
    "--bg-panel": "rgba(255, 255, 255, 0.95)",
    "--bg-overlay": "rgba(0, 0, 0, 0.4)",
    "--bg-overlay-dense": "rgba(0, 0, 0, 0.5)",
    "--border-glass": "rgba(0, 0, 0, 0.05)",
    "--border-light": "rgba(0, 0, 0, 0.1)",
    "--bg-glass": "rgba(255, 255, 255, 0.85)",
    "--bg-glass-dense": "rgba(250, 250, 250, 0.97)",
    "--bg-key": "rgba(200, 200, 200, 0.9)",
    "--bg-key-hover": "rgba(170, 170, 170, 0.95)",
    "--bg-subtle": "rgba(210, 210, 210, 0.7)",
    "--bg-header-btn": "rgba(0, 0, 0, 0.05)",
    "--bg-header-btn-hover": "rgba(0, 0, 0, 0.1)",
    "--bg-dist-bar": "rgba(200, 200, 200, 0.6)",
    "--bg-tile-empty": "rgba(220, 220, 220, 0.5)",
    "--bg-keyboard-dock": "rgba(240, 240, 240, 0.97)",
    "--border-keyboard-dock": "rgba(0, 0, 0, 0.1)",
    "--text-key": "#333",
  },
};

function applyThemeVars(theme: Theme) {
  const vars = THEME_VARS[theme];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("decagram-theme") as Theme | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
      applyThemeVars(stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme: Theme = prefersDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
      applyThemeVars(initialTheme);
      localStorage.setItem("decagram-theme", initialTheme);
    }
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme: Theme = prev === "dark" ? "light" : "dark";
      localStorage.setItem("decagram-theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
      applyThemeVars(newTheme);
      return newTheme;
    });
  };

  // Prevent render until mounted to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
