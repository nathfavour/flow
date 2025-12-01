'use client';

import React from 'react';
import { ThemeProvider } from '@/theme';
import { TaskProvider } from '@/context';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <TaskProvider>
        {children}
      </TaskProvider>
    </ThemeProvider>
  );
}
