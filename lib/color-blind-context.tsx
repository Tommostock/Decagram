"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface ColorBlindContextType {
  colorBlindMode: boolean;
  toggleColorBlindMode: () => void;
}

const ColorBlindContext = createContext<ColorBlindContextType>({
  colorBlindMode: false,
  toggleColorBlindMode: () => {},
});

const STORAGE_KEY = "decagram-colorblind";

export function ColorBlindProvider({ children }: { children: ReactNode }) {
  const [colorBlindMode, setColorBlindMode] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") {
        setColorBlindMode(true);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleColorBlindMode = () => {
    setColorBlindMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // localStorage unavailable
      }
      return next;
    });
  };

  return (
    <ColorBlindContext.Provider value={{ colorBlindMode, toggleColorBlindMode }}>
      {children}
    </ColorBlindContext.Provider>
  );
}

export function useColorBlind() {
  return useContext(ColorBlindContext);
}
