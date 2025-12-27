'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Collapse,
  IconButton,
  Badge,
  Tooltip,
  Divider,
  LinearProgress,
  useTheme,
  alpha,
} from '@mui/material';
import {
  HomeIcon as DashboardIcon,
  ListBulletIcon as TasksIcon,
  CalendarIcon,
  CalendarDaysIcon as EventIcon,
  FlagIcon as FocusIcon,
  InboxIcon,
  CalendarDaysIcon as TodayIcon,
  ClockIcon as ScheduleIcon,
  CheckCircleIcon as CompletedIcon,
  TagIcon as LabelIcon,
  PlusIcon as AddIcon,
  ChevronUpIcon as ExpandLess,
  ChevronDownIcon as ExpandMore,
  StarIcon,
  ViewColumnsIcon as KanbanIcon,
  TableCellsIcon as MatrixIcon,
  ChartBarIcon as TimelineIcon,
  Cog6ToothIcon as SettingsIcon,
} from '@heroicons/react/24/outline';
import { useTask } from '@/context/TaskContext';

const DRAWER_WIDTH = 256;

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  color?: string;
  href?: string;
}

export default function Sidebar() {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const {
    sidebarOpen,
    projects,
    labels,
    tasks,
    selectedProjectId,
    selectProject,
    setFilter,
    filter,
    updateProject,
  } = useTask();

  const [projectsOpen, setProjectsOpen] = useState(true);
  const [labelsOpen, setLabelsOpen] = useState(true);

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const inboxCount = tasks.filter(
    (t) => t.projectId === 'inbox' && t.status !== 'done' && !t.isArchived
  ).length;

  const todayCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'done' || t.isArchived) return false;
    const due = new Date(t.dueDate);
    return due >= today && due < tomorrow;
  }).length;

  const upcomingCount = tasks.filter((t) => {
    if (!t.dueDate || t.status === 'done' || t.isArchived) return false;
    const due = new Date(t.dueDate);
    return due >= tomorrow && due < nextWeek;
  }).length;

  const overdueCount = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'done' && !t.isArchived
  ).length;

  const completedCount = tasks.filter(
    (t) => t.status === 'done' && !t.isArchived
  ).length;

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, href: '/dashboard' },
    { id: 'tasks', label: 'Tasks', icon: <TasksIcon />, href: '/tasks' },
    { id: 'calendar', label: 'Calendar', icon: <CalendarIcon />, href: '/calendar' },
    { id: 'events', label: 'Events', icon: <EventIcon />, href: '/events' },
    { id: 'focus', label: 'Focus Mode', icon: <FocusIcon />, href: '/focus' },
  ];

  const smartLists: NavItem[] = [
    { id: 'inbox', label: 'Inbox', icon: <InboxIcon />, badge: inboxCount },
    { id: 'today', label: 'Today', icon: <TodayIcon />, badge: todayCount, color: '#10b981' },
    { id: 'upcoming', label: 'Upcoming', icon: <ScheduleIcon />, badge: upcomingCount, color: '#3b82f6' },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: <CalendarIcon />,
      badge: overdueCount,
      color: '#ef4444',
    },
    { id: 'completed', label: 'Completed', icon: <CompletedIcon />, badge: completedCount },
  ];

  const viewModes: NavItem[] = [
    { id: 'board', label: 'Board View', icon: <KanbanIcon /> },
    { id: 'calendar', label: 'Calendar View', icon: <CalendarIcon /> },
    { id: 'timeline', label: 'Timeline', icon: <TimelineIcon /> },
    { id: 'matrix', label: 'Priority Matrix', icon: <MatrixIcon /> },
  ];

  const handleSmartListClick = (id: string) => {
    router.push('/tasks');
    switch (id) {
      case 'inbox':
        selectProject('inbox');
        setFilter({ ...filter, projectId: 'inbox' });
        break;
      case 'today':
        selectProject(null);
        setFilter({
          ...filter,
          projectId: undefined,
          dueDate: { from: today, to: tomorrow },
          showCompleted: false,
        });
        break;
      case 'upcoming':
        selectProject(null);
        setFilter({
          ...filter,
          projectId: undefined,
          dueDate: { from: tomorrow, to: nextWeek },
          showCompleted: false,
        });
        break;
      case 'overdue':
        selectProject(null);
        setFilter({
          ...filter,
          projectId: undefined,
          dueDate: { to: now },
          showCompleted: false,
        });
        break;
      case 'completed':
        selectProject(null);
        setFilter({
          ...filter,
          projectId: undefined,
          status: ['done'],
          showCompleted: true,
        });
        break;
    }
  };

  const handleProjectClick = (projectId: string) => {
    router.push('/tasks');
    selectProject(projectId);
    setFilter({ ...filter, projectId, status: undefined, dueDate: undefined });
  };

  const toggleFavorite = (projectId: string, isFavorite: boolean) => {
    updateProject(projectId, { isFavorite: !isFavorite });
  };

  const getProjectTaskCount = (projectId: string) => {
    return tasks.filter(
      (t) => t.projectId === projectId && t.status !== 'done' && !t.isArchived
    ).length;
  };

  const getProjectProgress = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId && !t.isArchived);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter((t) => t.status === 'done').length;
    return (completed / projectTasks.length) * 100;
  };

  const favoriteProjects = projects.filter((p) => p.isFavorite && !p.isArchived);
  const regularProjects = projects.filter((p) => !p.isFavorite && !p.isArchived && p.id !== 'inbox');

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={sidebarOpen}
      sx={{
        width: sidebarOpen ? DRAWER_WIDTH : 0,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          borderRight: '1px solid rgba(255, 255, 255, 0.1)',
          backgroundColor: 'rgba(10, 10, 10, 0.95)',
          backdropFilter: 'blur(25px) saturate(180%)',
          mt: '64px',
          height: 'calc(100% - 64px)',
          backgroundImage: 'none',
        },
      }}
    >
      <Box sx={{ overflow: 'auto', py: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Main Navigation */}
        <List dense sx={{ px: 2 }}>
          {mainNav.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href || '#'}
                selected={pathname === item.href}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(0, 240, 255, 0.1)',
                    color: '#00F0FF',
                    '& .MuiListItemIcon-root': {
                      color: '#00F0FF',
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(0, 240, 255, 0.15)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: pathname === item.href ? '#00F0FF' : '#A1A1AA',
                  }}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'h-5 w-5' } as any)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: pathname === item.href ? 900 : 700,
                    fontSize: '0.85rem',
                    letterSpacing: '0.01em',
                    fontFamily: '"Space Grotesk", sans-serif'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Smart Lists */}
        <Typography
          variant="overline"
          sx={{ px: 4, color: 'text.disabled', display: 'block', mt: 1, mb: 1, fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.15em' }}
        >
          SMART LISTS
        </Typography>
        <List dense sx={{ px: 2 }}>
          {smartLists.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                selected={pathname === '/tasks' && (filter.projectId === item.id || (item.id === 'completed' && filter.status?.includes('done')))}
                onClick={() => handleSmartListClick(item.id)}
                sx={{
                  borderRadius: '12px',
                  py: 1,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    color: '#F2F2F2',
                    '& .MuiListItemIcon-root': {
                      color: item.color || '#F2F2F2',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  }
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    color: item.color || '#A1A1AA',
                  }}
                >
                  {React.cloneElement(item.icon as React.ReactElement, { className: 'h-4 w-4' } as any)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: 700,
                    fontSize: '0.8rem'
                  }}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge
                    badgeContent={item.badge}
                    sx={{
                      '& .MuiBadge-badge': {
                        backgroundColor: item.id === 'overdue' ? '#ef4444' : '#141414',
                        color: '#F2F2F2',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2, mx: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

        {/* Projects */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 4,
            py: 0.5,
            mb: 1,
          }}
        >
          <Typography
            variant="overline"
            sx={{ color: 'text.disabled', flexGrow: 1, cursor: 'pointer', fontWeight: 800, fontSize: '0.65rem', letterSpacing: '0.15em' }}
            onClick={() => setProjectsOpen(!projectsOpen)}
          >
            PROJECTS
          </Typography>
          <IconButton size="small" onClick={() => setProjectsOpen(!projectsOpen)} sx={{ color: 'text.disabled' }}>
            {projectsOpen ? <ExpandLess className="h-4 w-4" /> : <ExpandMore className="h-4 w-4" />}
          </IconButton>
        </Box>

        <Collapse in={projectsOpen}>
          <List dense sx={{ px: 2 }}>
            {regularProjects.map((project) => (
              <ListItem key={project.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={pathname === '/tasks' && selectedProjectId === project.id}
                  onClick={() => handleProjectClick(project.id)}
                  sx={{
                    borderRadius: '12px',
                    py: 1,
                    '&.Mui-selected': {
                      backgroundColor: alpha(project.color, 0.1),
                      '&:hover': {
                        backgroundColor: alpha(project.color, 0.15),
                      }
                    },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: project.color,
                        boxShadow: `0 0 12px ${alpha(project.color, 0.6)}`,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.name}
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.8rem'
                    }}
                  />
                  <Typography variant="caption" sx={{ ml: 1, fontWeight: 800, color: 'text.disabled' }}>
                    {getProjectTaskCount(project.id)}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Collapse>

        <Box sx={{ mt: 'auto', p: 3 }}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 1.5, letterSpacing: '0.05em' }}>
              STORAGE USED
            </Typography>
            <LinearProgress
              variant="determinate"
              value={45}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#00F0FF',
                  borderRadius: 3,
                  boxShadow: '0 0 10px rgba(0, 240, 255, 0.5)'
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
                4.5GB of 10GB
              </Typography>
              <Typography variant="caption" sx={{ color: '#00F0FF', fontWeight: 800 }}>
                45%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
