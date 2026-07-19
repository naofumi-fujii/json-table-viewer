'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { ThemeProvider } from 'next-themes';

// Wraps the app with Chakra UI and next-themes in app/providers.tsx (Providers component).
// next-themes toggles the `dark`/`light` class on <html>, which drives
// Chakra's semantic color tokens. Defaults to dark to keep the existing look.
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </ThemeProvider>
  );
}
