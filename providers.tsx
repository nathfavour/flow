'use client';

import React from 'react';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { TaskProvider } from '@/context/TaskContext';
import { AuthProvider } from '@/context/auth/AuthContext';
import { LayoutProvider } from '@/context/LayoutContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { SudoProvider } from '@/context/SudoContext';
import { SubscriptionProvider } from '@/context/subscription/SubscriptionContext';
import { DataNexusProvider } from '@/context/DataNexusContext';
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
    <SubscriptionProvider>
      <ThemeProvider>
        <AuthProvider>
          <DataNexusProvider>
            <NotificationProvider>
            <LayoutProvider>
              <SudoProvider>
                <TaskProvider>
                  <EcosystemHandler />
                  {children}
                </TaskProvider>
              </SudoProvider>
            </LayoutProvider>
          </NotificationProvider>
          </DataNexusProvider>
        </AuthProvider>
      </ThemeProvider>
    </SubscriptionProvider>
  );
}
