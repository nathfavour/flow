'use client';

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckIcon,
  AccessTime as ScheduleIcon,
  Warning as WarningIcon,
  Flag as FlagIcon,
  ArrowForward as ArrowIcon,
  Lightbulb as TipIcon,
  Whatshot as StreakIcon,
} from '@mui/icons-material';
import { useTask } from '@/context/TaskContext';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import TaskItem from '@/components/tasks/TaskItem';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, trend, onClick }: StatCardProps) {
  return (
    <Paper
      onClick={onClick}
      sx={{
        p: 3,
        borderRadius: 4,
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick
          ? {
            borderColor: 'rgba(0, 245, 255, 0.3)',
            transform: 'translateY(-6px)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          }
          : {},
        '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '2px',
            background: `linear-gradient(90deg, ${alpha(color, 0.5)}, transparent)`,
            opacity: 0.5,
        }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', mb: 1.5, display: 'block' }}>
            {title}
          </Typography>
          <Typography variant="h3" sx={{ color: '#F2F2F2', mb: 0.5, letterSpacing: '-0.02em' }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            backgroundColor: alpha(color, 0.05),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color,
            border: `1px solid ${alpha(color, 0.1)}`,
          }}
        >
          {React.cloneElement(icon as React.ReactElement, { sx: { fontSize: 22 } })}
        </Box>
      </Box>
    </Paper>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const { tasks, setFilter, setTaskDialogOpen } = useTask();

  // Calculate stats
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const {
    activeTasks,
    completedTasks,
    overdueTasks,
    todayTasks,
    tomorrowTasks,
    inProgressTasks,
    urgentTasks,
    highPriorityTasks,
    completionRate,
  } = React.useMemo(() => {
    const active = tasks.filter((t) => !t.isArchived);
    const completed = active.filter((t) => t.status === 'done');
    const incomplete = active.filter((t) => t.status !== 'done');

    const overdue = incomplete.filter(
      (t) => t.dueDate && isPast(new Date(t.dueDate)) && !isToday(new Date(t.dueDate))
    );

    const todayT = incomplete.filter(
      (t) => t.dueDate && isToday(new Date(t.dueDate))
    );

    const tomorrowT = incomplete.filter(
      (t) => t.dueDate && isTomorrow(new Date(t.dueDate))
    );

    const inProgress = incomplete.filter((t) => t.status === 'in-progress');
    const urgent = incomplete.filter((t) => t.priority === 'urgent');
    const highPriority = incomplete.filter((t) => t.priority === 'high');

    const rate = active.length > 0
      ? Math.round((completed.length / active.length) * 100)
      : 0;

    return {
      activeTasks: active,
      completedTasks: completed,
      overdueTasks: overdue,
      todayTasks: todayT,
      tomorrowTasks: tomorrowT,
      inProgressTasks: inProgress,
      urgentTasks: urgent,
      highPriorityTasks: highPriority,
      completionRate: rate,
    };
  }, [tasks]);

  const handleViewTasks = React.useCallback((filterType: string) => {
    switch (filterType) {
      case 'today':
        setFilter({
          showCompleted: false,
          showArchived: false,
          dueDate: { from: today, to: tomorrow },
        });
        break;
      case 'overdue':
        setFilter({
          showCompleted: false,
          showArchived: false,
          dueDate: { to: today },
        });
        break;
      case 'in-progress':
        setFilter({
          showCompleted: false,
          showArchived: false,
          status: ['in-progress'],
        });
        break;
      case 'urgent':
        setFilter({
          showCompleted: false,
          showArchived: false,
          priority: ['urgent'],
        });
        break;
    }
  }, [setFilter, today, tomorrow]);

  const productivityTips = [
    'Focus on one task at a time to increase efficiency.',
    'Take regular breaks to maintain high energy levels.',
    'Plan your day the night before for a smoother start.',
    'Organize your workspace to reduce distractions.',
  ];

  const randomTip = productivityTips[Math.floor(Math.random() * productivityTips.length)];

  return (
    <Box sx={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h1" sx={{ mb: 1.5, letterSpacing: '-0.04em' }}>
          Welcome back.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {format(now, 'EEEE, MMMM d, yyyy').toUpperCase()}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ height: 20, mx: 1, opacity: 0.2 }} />
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                You have <span style={{ color: '#00F5FF', fontWeight: 900 }}>{todayTasks.length} tasks</span> due today
                {overdueTasks.length > 0 && (
                    <> • <span style={{ color: '#FF4D4D', fontWeight: 900 }}>{overdueTasks.length} overdue</span></>
                )}
            </Typography>
        </Box>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Due Today"
            value={todayTasks.length}
            subtitle={`${tomorrowTasks.length} pending tomorrow`}
            icon={<ScheduleIcon />}
            color="#00F5FF"
            onClick={() => handleViewTasks('today')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Overdue"
            value={overdueTasks.length}
            subtitle="Immediate action required"
            icon={<WarningIcon />}
            color="#FF4D4D"
            onClick={() => handleViewTasks('overdue')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="In Progress"
            value={inProgressTasks.length}
            subtitle={`${urgentTasks.length} identified as urgent`}
            icon={<FlagIcon />}
            color="#FFBD2E"
            onClick={() => handleViewTasks('in-progress')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Completed"
            value={completedTasks.length}
            subtitle={`${completionRate}% total efficiency`}
            icon={<CheckIcon />}
            color="#10B981"
          />
        </Grid>
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Priority Tasks */}
          {(urgentTasks.length > 0 || highPriorityTasks.length > 0) && (
            <Paper
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <FlagIcon sx={{ fontSize: 24, color: '#FF4D4D' }} />
                  <Typography variant="h3" sx={{ fontSize: '1.25rem' }}>
                    Critical Objectives
                  </Typography>
                  <Chip 
                    label={urgentTasks.length + highPriorityTasks.length} 
                    size="small" 
                    sx={{ 
                      bgcolor: 'rgba(255, 77, 77, 0.1)', 
                      color: '#FF4D4D', 
                      fontWeight: 900,
                      borderRadius: 1,
                      px: 0.5,
                      fontSize: '0.7rem'
                    }} 
                  />
                </Box>
                <Button
                  size="small"
                  endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
                  onClick={() => handleViewTasks('urgent')}
                  sx={{ color: 'text.disabled', fontWeight: 700, '&:hover': { color: '#F2F2F2' } }}
                >
                  EXPAND VIEW
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {[...urgentTasks, ...highPriorityTasks].slice(0, 3).map((task) => (
                  <TaskItem key={task.id} task={task} compact />
                ))}
              </Box>
            </Paper>
          )}

          {/* Today's Tasks */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <ScheduleIcon sx={{ fontSize: 24, color: '#00F5FF' }} />
                <Typography variant="h2" sx={{ fontSize: '1.25rem' }}>
                    Active Track
                </Typography>
                <Chip 
                  label={todayTasks.length} 
                  size="small" 
                  sx={{ 
                    bgcolor: 'rgba(0, 245, 255, 0.1)', 
                    color: '#00F5FF', 
                    fontWeight: 900,
                    borderRadius: 1,
                    px: 0.5,
                    fontSize: '0.7rem'
                  }} 
                />
              </Box>
              <Button
                size="small"
                endIcon={<ArrowIcon sx={{ fontSize: 14 }} />}
                onClick={() => handleViewTasks('today')}
                sx={{ color: 'text.disabled', fontWeight: 700, '&:hover': { color: '#F2F2F2' } }}
              >
                FULL OVERVIEW
              </Button>
            </Box>
            {todayTasks.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {todayTasks.slice(0, 5).map((task) => (
                  <TaskItem key={task.id} task={task} compact />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <CheckIcon sx={{ fontSize: 48, marginBottom: 2, opacity: 0.1 }} />
                <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: '0.05em' }}>SYSTEMS OPTIMIZED / NO PENDING TASKS</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ mt: 3, borderRadius: 2, borderColor: 'rgba(255, 255, 255, 0.1)', color: '#F2F2F2' }}
                  onClick={() => setTaskDialogOpen(true)}
                >
                  NEW ACTION ITEM
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Progress Overview */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}
          >
            <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.2em', mb: 4, display: 'block' }}>
              RECOVERY METRICS
            </Typography>
            <Box sx={{ mb: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                  EXECUTION QUOTA
                </Typography>
                <Typography variant="caption" sx={{ color: '#00F5FF', fontWeight: 900 }}>
                  {completedTasks.length} / {activeTasks.length}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 2,
                    backgroundColor: '#00F5FF',
                    boxShadow: '0 0 12px rgba(0, 245, 255, 0.5)'
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3, borderRadius: 3, backgroundColor: 'rgba(255, 189, 46, 0.05)', border: '1px solid rgba(255, 189, 46, 0.1)' }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 189, 46, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFBD2E'
                }}
              >
                <StreakIcon sx={{ fontSize: 24 }} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'rgba(255, 189, 46, 0.7)', fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.5 }}>
                  FOCUS STREAK
                </Typography>
                <Typography variant="h4" sx={{ color: '#FFBD2E', fontWeight: 900, letterSpacing: '-0.02em' }}>
                  5 DAYS
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Productivity Tip */}
          <Paper
            sx={{
              p: 4,
              mb: 4,
              borderRadius: 4,
              backgroundColor: 'rgba(0, 245, 255, 0.02)',
              border: '1px solid rgba(0, 245, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <TipIcon sx={{ fontSize: 20, color: '#00F5FF' }} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: '#00F5FF', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                NEURAL INSIGHT
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, fontWeight: 500 }}>
              {randomTip}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
