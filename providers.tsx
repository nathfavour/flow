'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();

  useEffect(() => {
    const mood = pathname?.startsWith('/form/') ? 'serious' : 'ambient';
    document.body.dataset.uiMood = mood;
    return () => {
      document.body.dataset.uiMood = 'ambient';
    };
  }, [pathname]);
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
