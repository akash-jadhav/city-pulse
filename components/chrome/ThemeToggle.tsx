"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      title="Toggle light / dark mode"
    >
      {/* Both icons are always in the DOM; the .dark class (set before paint by
          the inline script) controls which one is visible — so the correct icon
          shows immediately with no flash and no hydration mismatch. */}
      <Sun className="h-3.5 w-3.5 dark:hidden" />
      <Moon className="hidden h-3.5 w-3.5 dark:block" />
    </Button>
  );
}
