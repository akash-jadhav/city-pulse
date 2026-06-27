"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "theme";

/**
 * Inline script injected into <head> in app/layout.tsx. Runs synchronously
 * during HTML parsing — before first paint — so the correct theme is applied
 * with no flash. Reads the saved preference, falling back to the OS setting.
 * See node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var d=document.documentElement;if(t==="dark"){d.classList.add("dark");}else{d.classList.remove("dark");}d.style.colorScheme=t;}catch(e){}})()`;

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialTheme(): Theme {
  // On the server we default to "light"; the inline script + this lazy
  // initializer (which reads the class the script already set) agree on the
  // client, so React's state matches the DOM and there's no hydration mismatch.
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  const applyTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
  }, []);

  const setTheme = useCallback(
    (next: Theme) => {
      setThemeState(next);
      applyTheme(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* localStorage unavailable (private mode, etc.) — ignore */
      }
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [theme, setTheme]);

  // Re-sync React state with the DOM after mount, in case the inline script
  // resolved a different value (e.g. OS preference) than the SSR default.
  useEffect(() => {
    setThemeState(getInitialTheme());
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
