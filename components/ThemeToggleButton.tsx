'use client';

import { useSyncExternalStore } from 'react';
import { IconButton } from '@chakra-ui/react';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';

// Detects whether we are past hydration: returns false during SSR and the
// initial client render, true afterwards
const emptySubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

// Toggles between light and dark themes in components/ThemeToggleButton.tsx.
// Renders a placeholder until mounted because the theme is only known on the
// client (next-themes reads it from localStorage), avoiding a hydration mismatch.
export default function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return (
      <IconButton
        aria-label="Toggle color theme"
        colorPalette="gray"
        variant="ghost"
        size="lg"
        disabled
      />
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <IconButton
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      colorPalette="gray"
      variant="ghost"
      size="lg"
    >
      {isDark ? <FaSun size={20} /> : <FaMoon size={20} />}
    </IconButton>
  );
}
