'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Box, useTheme, useMediaQuery, alpha } from '@mui/material';
import AppBar from '@/components/layout/AppBar';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import { useTask } from '@/context/TaskContext';
import { useLayout } from '@/context/LayoutContext';

const RightSidebar = dynamic(() => import('@/components/layout/RightSidebar'), { ssr: false });
const TaskDialog = dynamic(() => import('@/components/tasks/TaskDialog'), { ssr: false });

const DRAWER_WIDTH = 256;
const RIGHT_DRAWER_WIDTH = 420;

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const { sidebarOpen } = useTask();
  const { secondarySidebar } = useLayout();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Hide sidebar on event details pages
  const isEventPage = pathname?.startsWith('/events/') && pathname.split('/').length > 2;
  const showSidebar = !isMobile && !isEventPage;
  const showRightSidebar = secondarySidebar.isOpen && !isMobile;

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: theme.palette.mode === 'light'
          ? '#f8f8f8'
          : '#0f0f0f',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <AppBar />
      {/* Sidebar only visible on desktop and not on event pages */}
      {showSidebar && <Sidebar />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1, md: 2 },
          pt: { xs: `calc(64px + 12px)`, md: `calc(64px + 16px)` },
          pb: { xs: '80px', md: 2 },
          minHeight: '100vh',
          boxSizing: 'border-box',
          // Adjust width if sidebar is hidden
          maxWidth: '100vw',
          width: '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(showSidebar && {
             width: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)`,
             ml: sidebarOpen ? 0 : 0, 
          }),
          ...(showRightSidebar && {
            width: `calc(100% - ${(showSidebar && sidebarOpen ? DRAWER_WIDTH : 0) + RIGHT_DRAWER_WIDTH}px)`,
            mr: `${RIGHT_DRAWER_WIDTH}px`,
          })
        }}
      >
        <Box
          sx={{
            background:
              theme.palette.mode === 'light'
                ? '#ffffff'
                : '#1a1a1a',
            borderRadius: { xs: 2, md: 4 },
            border: `2px solid ${theme.palette.divider}`,
            boxShadow:
              theme.palette.mode === 'light'
                ? '0 8px 32px rgba(0, 0, 0, 0.08)'
                : '0 8px 32px rgba(0, 0, 0, 0.4)',
            minHeight: '100%',
            p: { xs: 2, md: 4 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
        {children}
        </Box>
      </Box>
      
      <RightSidebar />
      
      {/* BottomNav only visible on mobile */}
      {isMobile && !isEventPage && <BottomNav />}
      
      {/* Global Dialogs */}
      <TaskDialog />
    </Box>
  );
}
