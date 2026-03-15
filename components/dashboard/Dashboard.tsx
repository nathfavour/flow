'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Chip,
  Button,
  alpha,
  Divider,
  IconButton,
} from '@mui/material';
import {
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Flag,
  ArrowRight,
  Lightbulb,
  Flame,
  LayoutDashboard,
  Calendar,
  Activity,
  Plus,
  ArrowUpRight,
  MoreVertical,
} from 'lucide-react';
import { useTask } from '@/context/TaskContext';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import TaskItem from '../tasks/TaskItem';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, subtitle, icon, color, onClick }: StatCardProps) {
  // MUI alpha() doesn't support CSS variables like var(--color-brand)
  // We determine the hex color if a variable is passed
  const resolvedColor = color.includes('var(--color-brand)') ? '#6366F1' : 
                       color.includes('var(--color-app)') ? '#A855F7' : 
                       color;

  return (
    <Paper
      onClick={onClick}
      className="glass-panel"
      sx={{
        p: 3,
        borderRadius: '24px',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: 'rgba(10, 10, 10, 0.4)',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick
          ? {
            borderColor: alpha(resolvedColor, 0.4),
            transform: 'translateY(-4px)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            boxShadow: `0 20px 40px ${alpha('#000000', 0.6)}, 0 0 20px ${alpha(resolvedColor, 0.1)}`,
          }
          : {},
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary', 
              fontWeight: 700, 
              letterSpacing: '0.1em', 
              textTransform: 'uppercase', 
              mb: 1.5, 
              display: 'block',
              fontSize: '0.65rem',
              fontFamily: 'var(--font-clash)'
            }}
          >
            {title}
          </Typography>
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#F2F2F2', 
              mb: 0.5, 
              letterSpacing: '-0.02em',
              fontWeight: 800,
              fontFamily: 'var(--font-clash)',
              fontSize: '2rem'
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, fontSize: '0.75rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '16px',
            backgroundColor: alpha(resolvedColor, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: resolvedColor,
            border: `1px solid ${alpha(resolvedColor, 0.2)}`,
            boxShadow: `0 0 15px ${alpha(resolvedColor, 0.1)}`
          }}
        >
          {React.cloneElement(icon as React.ReactElement<any>, { size: 24, strokeWidth: 1.5 })}
        </Box>
      </Box>
    </Paper>
  );
}

const productivityTips = [
  'Focus on one task at a time to increase efficiency.',
  'Take regular breaks to maintain high energy levels.',
  'Plan your day the night before for a smoother start.',
  'Organize your workspace to reduce distractions.',
];

export default function Dashboard() {
  const { tasks, setFilter, setTaskDialogOpen } = useTask();

  // Calculate stats
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();
  
  const today = new Date(year, month, date);
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

  const handleViewTasks = (filterType: string) => {
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
  };

  const [randomTip, setRandomTip] = useState('');

  useEffect(() => {
    requestAnimationFrame(() => {
      setRandomTip(productivityTips[Math.floor(Math.random() * productivityTips.length)]);
    });
  }, []);

  return (
    <Box sx={{ animation: 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)', px: { xs: 1, sm: 0 } }}>
      {/* Header / Dashboard Section */}
      <Box sx={{ mb: { xs: 4, md: 6 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'flex-end' }, gap: 3 }}>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{ p: 0.8, borderRadius: '10px', bgcolor: alpha('#6366F1', 0.1), color: 'var(--color-brand)', border: '1px solid ' + alpha('#6366F1', 0.2) }}>
              <LayoutDashboard size={18} strokeWidth={2.5} />
            </Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: 'var(--color-brand)', letterSpacing: '0.25em', fontFamily: 'var(--font-clash)' }}>
              OVERVIEW
            </Typography>
          </Box>
          <Typography variant="h1" sx={{ 
            mb: 0.5, 
            letterSpacing: '-0.04em', 
            fontWeight: 800, 
            fontFamily: 'var(--font-clash)',
            fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' },
            lineHeight: 1.1,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Dashboard.
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                {format(now, 'EEEE, MMMM d, yyyy').toUpperCase()}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ height: 16, mx: 1, opacity: 0.1, bgcolor: 'white', display: { xs: 'none', sm: 'block' } }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Activity size={14} color="var(--color-app)" />
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: { xs: '0.75rem', sm: '0.85rem' } }}>
                  <span style={{ color: 'var(--color-app)', fontWeight: 800 }}>{todayTasks.length} tasks</span> due today
              </Typography>
            </Box>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<Plus size={18} strokeWidth={2.5} />}
          onClick={() => setTaskDialogOpen(true)}
          sx={{
            borderRadius: '16px',
            bgcolor: 'var(--color-brand)',
            color: 'white',
            fontWeight: 800,
            px: { xs: 3, sm: 4 },
            py: { xs: 1.5, sm: 1.8 },
            width: { xs: '100%', sm: 'auto' },
            fontFamily: 'var(--font-clash)',
            letterSpacing: '0.05em',
            boxShadow: '0 8px 32px ' + alpha('#6366F1', 0.25),
            transition: 'all 0.3s ease',
            '&:hover': {
              bgcolor: alpha('#6366F1', 0.8),
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 40px ' + alpha('#6366F1', 0.35),
            }
          }}
        >
          NEW TASK
        </Button>
      </Box>

      {/* Primary Stats Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="DUE TODAY"
            value={todayTasks.length}
            subtitle={`${tomorrowTasks.length} pending tomorrow`}
            icon={<Clock />}
            color="var(--color-brand)"
            onClick={() => handleViewTasks('today')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="OVERDUE"
            value={overdueTasks.length}
            subtitle="Immediate action required"
            icon={<AlertTriangle />}
            color="#FF4D4D"
            onClick={() => handleViewTasks('overdue')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="IN PROGRESS"
            value={inProgressTasks.length}
            subtitle={`${urgentTasks.length} identified as urgent`}
            icon={<Activity />}
            color="var(--color-app)"
            onClick={() => handleViewTasks('in-progress')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="COMPLETION RATE"
            value={`${completionRate}%`}
            subtitle="Overall progress"
            icon={<TrendingUp />}
            color="#10B981"
          />
        </Grid>
      </Grid>

      {/* Main Task Grid */}
      <Grid container spacing={4}>
        {/* Left Column: Task Tracking */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Urgent Tasks Section */}
          {(urgentTasks.length > 0 || highPriorityTasks.length > 0) && (
            <Paper
              className="glass-panel"
              sx={{
                p: { xs: 2.5, sm: 4 },
                mb: 4,
                borderRadius: '32px',
                backgroundColor: 'rgba(255, 77, 77, 0.02)',
                border: '1px solid rgba(255, 77, 77, 0.1)',
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '200px',
                  height: '200px',
                  background: 'radial-gradient(circle, rgba(255, 77, 77, 0.05) 0%, transparent 70%)',
                  zIndex: 0
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                  <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(255, 77, 77, 0.1)', color: '#FF4D4D' }}>
                    <Flag size={20} strokeWidth={2.5} />
                  </Box>
                  <Typography variant="h4" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 800, fontFamily: 'var(--font-clash)', letterSpacing: '-0.01em' }}>
                    Urgent
                  </Typography>
                  <Chip 
                    label={`${urgentTasks.length + highPriorityTasks.length} ITEMS`} 
                    size="small" 
                    sx={{ 
                      bgcolor: '#FF4D4D', 
                      color: '#000', 
                      fontWeight: 900,
                      borderRadius: '8px',
                      fontSize: '0.65rem',
                      height: '20px',
                      fontFamily: 'var(--font-clash)',
                      display: { xs: 'none', xsm: 'flex' } // Handle very small screens if chip is too wide
                    }} 
                  />
                </Box>
                <IconButton size="small" onClick={() => handleViewTasks('urgent')} sx={{ color: 'text.disabled' }}>
                  <ArrowUpRight size={20} />
                </IconButton>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, position: 'relative', zIndex: 1 }}>
                {[...urgentTasks, ...highPriorityTasks].slice(0, 3).map((task) => (
                  <TaskItem key={task.id} task={task} compact />
                ))}
              </Box>
            </Paper>
          )}

          {/* Active Tasks */}
          <Paper
            className="glass-panel"
            sx={{
              p: { xs: 2.5, sm: 4 },
              borderRadius: '32px',
              backgroundColor: 'rgba(10, 10, 10, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: alpha('#6366F1', 0.05), color: 'var(--color-brand)' }}>
                  <Calendar size={20} strokeWidth={2.5} />
                </Box>
                <Typography variant="h4" sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, fontWeight: 800, fontFamily: 'var(--font-clash)', letterSpacing: '-0.01em' }}>
                    Active Tasks
                </Typography>
                <Chip 
                  label={`${todayTasks.length} PENDING`}
                  size="small" 
                  sx={{ 
                    bgcolor: alpha('#6366F1', 0.1), 
                    color: 'var(--color-brand)', 
                    fontWeight: 900,
                    borderRadius: '8px',
                    fontSize: '0.65rem',
                    height: '20px',
                    border: '1px solid ' + alpha('#6366F1', 0.1),
                    fontFamily: 'var(--font-clash)',
                    display: { xs: 'none', sm: 'flex' }
                  }} 
                />
              </Box>
              <Button
                variant="text"
                endIcon={<ArrowRight size={16} />}
                onClick={() => handleViewTasks('today')}
                sx={{ 
                  color: 'text.secondary', 
                  fontWeight: 800, 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.1em',
                  fontFamily: 'var(--font-clash)',
                  '&:hover': { color: 'var(--color-brand)', bgcolor: 'transparent' } 
                }}
              >
                {/* Hide text on very small screens */}
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>VIEW ALL</Box>
              </Button>
            </Box>
            {todayTasks.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {todayTasks.slice(0, 5).map((task) => (
                  <TaskItem key={task.id} task={task} compact />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '30px', 
                  bgcolor: 'rgba(255, 255, 255, 0.02)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 3,
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <CheckCircle size={32} color={alpha('#F2F2F2', 0.1)} strokeWidth={1} />
                </Box>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.disabled', letterSpacing: '0.1em', fontFamily: 'var(--font-clash)' }}>
                  ALL TASKS COMPLETED
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setTaskDialogOpen(true)}
                  sx={{ 
                    mt: 3, 
                    borderRadius: '12px', 
                    borderColor: 'rgba(255, 255, 255, 0.1)', 
                    color: '#F2F2F2',
                    px: 3,
                    fontWeight: 700,
                    '&:hover': { borderColor: 'var(--color-brand)', bgcolor: alpha('#6366F1', 0.05) }
                  }}
                >
                  NEW TASK
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Metrics & Tips */}
        <Grid size={{ xs: 12, lg: 4 }}>
          {/* Statistics */}
          <Paper
            className="glass-panel"
            sx={{
              p: 4,
              mb: 4,
              borderRadius: '32px',
              backgroundColor: 'rgba(10, 10, 10, 0.3)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 900, color: 'text.secondary', letterSpacing: '0.2em', fontFamily: 'var(--font-clash)' }}>
                STATISTICS
              </Typography>
              <IconButton size="small" sx={{ color: 'text.disabled' }}>
                <MoreVertical size={16} />
              </IconButton>
            </Box>
            
            <Box sx={{ mb: 5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, display: 'block', mb: 0.5 }}>
                    TASKS COMPLETED
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'var(--font-clash)' }}>
                    {completedTasks.length} <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>/ {activeTasks.length}</span>
                  </Typography>
                </Box>
                  <Typography variant="h5" sx={{ color: 'var(--color-brand)', fontWeight: 900, fontFamily: 'var(--font-clash)' }}>
                  {completionRate}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={completionRate}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    backgroundColor: 'var(--color-brand)',
                    boxShadow: '0 0 15px ' + alpha('#6366F1', 0.6)
                  },
                }}
              />
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2.5, 
              p: 3, 
              borderRadius: '24px', 
              backgroundColor: alpha('#A855F7', 0.03), 
              border: '1px solid ' + alpha('#A855F7', 0.1),
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha('#A855F7', 0.06),
                borderColor: alpha('#A855F7', 0.2),
              }
            }}>
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '16px',
                  backgroundColor: alpha('#A855F7', 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-app)',
                  border: '1px solid ' + alpha('#A855F7', 0.1)
                }}
              >
                <Flame size={24} strokeWidth={2} />
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: alpha('#A855F7', 0.7), fontWeight: 800, letterSpacing: '0.1em', display: 'block', mb: 0.5, fontSize: '0.65rem' }}>
                  STREAK
                </Typography>
                <Typography variant="h4" sx={{ color: 'var(--color-app)', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'var(--font-clash)' }}>
                  5 DAYS
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Productivity Tip */}
          <Paper
            className="glass-panel"
            sx={{
              p: 4,
              borderRadius: '32px',
              backgroundColor: alpha('#A855F7', 0.01),
              border: '1px solid ' + alpha('#A855F7', 0.08),
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '4px',
                height: '100%',
                bgcolor: 'var(--color-app)',
                opacity: 0.5
              }
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Lightbulb size={20} color="var(--color-app)" strokeWidth={2} />
              <Typography variant="caption" sx={{ fontWeight: 900, color: 'var(--color-app)', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'var(--font-clash)' }}>
                PRO TIP
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, fontWeight: 500, fontSize: '0.875rem' }}>
              {randomTip}
            </Typography>
            <Button 
              size="small" 
              sx={{ 
                mt: 2, 
                color: 'var(--color-app)', 
                fontWeight: 700, 
                fontSize: '0.7rem',
                p: 0,
                '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
              }}
            >
              GET ANOTHER TIP
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
