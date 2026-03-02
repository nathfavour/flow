'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

// Dynamic import of the real provider to avoid initial bundle bloat
// This removes @campnetwork/origin and its heavy dependencies (pino, etc.) from the main bundle
const CampProvider = dynamic(
  () => import('@campnetwork/origin/react').then((mod) => mod.CampProvider),
  { 
    ssr: false,
  }
);

interface OriginProviderProps {
  children: ReactNode;
}

export function OriginProvider({ children }: OriginProviderProps) {
  const clientId = process.env.NEXT_PUBLIC_ORIGIN_CLIENT_ID || 'demo-client-id';
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if (!isClient) {
      setIsClient(true);
    }
  }, [isClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {isClient ? (
         <CampProvider clientId={clientId}>
            {children}
         </CampProvider>
      ) : (
         <>{children}</>
      )}
    </QueryClientProvider>
  );
}
