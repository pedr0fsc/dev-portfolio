/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext } from "react";
import { ACTIVE_PALETTE } from "../theme/palettes";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });
  
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "en";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.dataset.palette = ACTIVE_PALETTE;
    if (theme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const toggleTheme = (event) => {
    const isDark = theme === "dark";
    const nextTheme = isDark ? "light" : "dark";

    // Fallback if browser doesn't support View Transitions or reduced motion is active
    if (
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setTheme(nextTheme);
      return;
    }

    const x = event?.clientX ?? window.innerWidth / 2;
    const y = event?.clientY ?? window.innerHeight / 2;
    
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      setTheme(nextTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`,
      ];

      document.documentElement.animate(
        {
          clipPath: isDark ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 500,
          easing: "cubic-bezier(0.4, 0, 0.2, 1)",
          pseudoElement: isDark
            ? "::view-transition-old(root)"
            : "::view-transition-new(root)",
        }
      );
    });
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
  };

  return (
    <AppContext.Provider value={{ theme, setTheme, toggleTheme, lang, setLang, changeLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
