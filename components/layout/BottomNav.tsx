'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LayoutDashboard as DashboardIcon,
  ListTodo as TasksIcon,
  Calendar as CalendarIcon,
  Target as FocusIcon,
  Plus as AddIcon,
} from 'lucide-react';
import { useTask } from '@/context/TaskContext';

export default function BottomNav() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const { setTaskDialogOpen } = useTask();

  // Determine active value based on pathname
  const getValue = () => {
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/tasks')) return 'tasks';
    if (pathname.startsWith('/focus')) return 'focus';
    if (pathname.startsWith('/calendar')) return 'calendar';
    return 'dashboard'; // Default
  };

  const handleChange = (_: React.SyntheticEvent, newValue: string) => {
    if (newValue === 'add') {
      setTaskDialogOpen(true);
    } else {
      router.push(`/${newValue}`);
    }
  };

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: theme.zIndex.appBar + 1,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          backgroundColor: alpha(theme.palette.background.paper, 0.95),
          backdropFilter: 'blur(10px)',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <BottomNavigation
          value={getValue()}
          onChange={handleChange}
          showLabels
          sx={{
            backgroundColor: 'transparent',
            height: 64,
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              color: theme.palette.text.secondary,
              '&.Mui-selected': {
                color: theme.palette.primary.main,
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.65rem',
              marginTop: '2px',
              '&.Mui-selected': {
                fontSize: '0.65rem',
                fontWeight: 600,
              },
            },
          }}
        >
          <BottomNavigationAction
            value="dashboard"
            label="Dashboard"
            icon={<DashboardIcon />}
          />
          <BottomNavigationAction
            value="tasks"
            label="Tasks"
            icon={<TasksIcon />}
          />
          <BottomNavigationAction
            value="add"
            label="Add"
            icon={
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  backgroundColor: theme.palette.primary.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.contrastText,
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                  transform: 'translateY(-8px)',
                }}
              >
                <AddIcon />
              </Box>
            }
          />
          <BottomNavigationAction
            value="focus"
            label="Focus"
            icon={<FocusIcon />}
          />
          <BottomNavigationAction
            value="calendar"
            label="Calendar"
            icon={<CalendarIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
