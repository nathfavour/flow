'use client';

import React from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { TaskProvider } from '@/context/TaskContext';
import { AuthProvider } from '@/context/auth/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { OriginProvider } from '@/context/origin/OriginProvider';
import { NotificationProvider } from '@/context/NotificationContext';
import { SudoProvider } from '@/context/SudoContext';
import { useEcosystemIntents } from '@/hooks/useEcosystemIntents';
import { useEcosystemNode } from '@/hooks/useEcosystemNode';

interface AppProvidersProps {
  children: React.ReactNode;
}

function EcosystemHandler() {
  useEcosystemIntents();
  useEcosystemNode('flow');
  return null;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
          <LayoutProvider>
            <OriginProvider>
              <SudoProvider>
                <TaskProvider>
                  <EcosystemHandler />
                  {children}
                </TaskProvider>
              </SudoProvider>
            </OriginProvider>
          </LayoutProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
