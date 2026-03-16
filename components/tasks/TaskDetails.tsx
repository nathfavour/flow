'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Avatar,
  Menu,
  MenuItem,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  Flag as FlagIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Description as NotesIcon,
  VideoCall as MeetingIcon,
  Send as SendIcon,
  AutoFixHigh as AutoFixHighIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useTask } from '@/context/TaskContext';
import { Priority, TaskStatus } from '@/types';
import { useLayout } from '@/context/LayoutContext';
import { useAI } from '@/hooks/useAI';
import dynamic from 'next/dynamic';

const OriginSocialSection = dynamic(() => import('./OriginSocialSection'), {
  loading: () => null,
  ssr: false,
});

const priorityColors: Record<Priority, string> = {
  low: '#A1A1AA',
  medium: '#6366F1',
  high: '#F59E0B',
  urgent: '#EF4444',
};

const statusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Completed',
  blocked: 'Blocked',
  cancelled: 'Cancelled',
};

interface TaskDetailsProps {
  taskId: string;
}

export default function TaskDetails({ taskId }: TaskDetailsProps) {
  const { closeSecondarySidebar } = useLayout();
  const {
    tasks,
    updateTask,
    completeTask,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addComment,
    projects,
    labels,
  } = useTask();

  const task = tasks.find((t) => t.id === taskId);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [priorityAnchor, setPriorityAnchor] = useState<null | HTMLElement>(null);

  // AI Integration
  const { generate } = useAI();
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);

  const handleGenerateSubtasks = async () => {
    if (!task?.title) return;
    setIsGeneratingSubtasks(true);
    try {
      const prompt = `You are a Project Manager. The user wants to '${task.title}'. Generate a JSON array of 5 concrete, actionable sub-tasks. Return ONLY the JSON array of strings.`;
      const result = await generate(prompt);
      const text = typeof result === 'string' ? result : (result as any).text;
      // Clean up markdown code blocks if present
      const jsonString = text.replace(/```json\n|\n```/g, '').replace(/```/g, '');
      const subtasks = JSON.parse(jsonString);
      
      if (Array.isArray(subtasks)) {
        subtasks.forEach((st: string) => {
            if (typeof st === 'string') {
                addSubtask(task.id, st);
            }
        });
      }
    } catch (error: unknown) {
      console.error("Failed to generate subtasks", error);
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  if (!task) {
    return (
        <Box sx={{ p: 6, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">Task details unavailable</Typography>
            <Button variant="outlined" size="small" onClick={closeSecondarySidebar}>Go Back</Button>
        </Box>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const taskLabels = labels.filter((l) => task.labels.includes(l.id));
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const subtaskProgress = task.subtasks.length > 0
    ? (completedSubtasks / task.subtasks.length) * 100
    : 0;

  const handleStartEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    updateTask(task.id, {
      title: editTitle,
      description: editDescription || undefined,
    });
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      addSubtask(task.id, newSubtask.trim());
      setNewSubtask('');
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(task.id, newComment.trim());
      setNewComment('');
    }
  };

  const handleStatusChange = (status: TaskStatus) => {
    updateTask(task.id, { status });
    setStatusAnchor(null);
  };

  const handlePriorityChange = (priority: Priority) => {
    updateTask(task.id, { priority });
    setPriorityAnchor(null);
  };

  return (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      bgcolor: 'transparent',
      perspective: '1200px',
    }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 4,
          py: 3,
          bgcolor: 'rgba(28, 26, 24, 0.95)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2)',
          zIndex: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Checkbox
            checked={task.status === 'done'}
            onChange={() => completeTask(task.id)}
            sx={{
              p: 0,
              color: 'rgba(255, 255, 255, 0.15)',
              '&.Mui-checked': { color: '#6366F1' },
              '&:hover': { bgcolor: alpha('#6366F1', 0.1) }
            }}
          />
          <Chip
            label={statusLabels[task.status]}
            size="small"
            onClick={(e) => setStatusAnchor(e.currentTarget)}
            sx={{ 
              cursor: 'pointer',
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontWeight: 800,
              fontSize: '0.65rem',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontFamily: 'var(--font-clash-display)',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
              '&:hover': { 
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'rgba(255, 255, 255, 0.2)',
                transform: 'translateY(-1px)'
              }
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            size="small" 
            onClick={handleStartEdit} 
            sx={{ 
              color: 'text.secondary', 
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#F2F2F2', bgcolor: 'rgba(255, 255, 255, 0.08)', transform: 'translateY(-1px)' } 
            }}
          >
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={closeSecondarySidebar} 
            sx={{ 
              color: 'text.secondary', 
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s ease',
              '&:hover': { color: '#F2F2F2', bgcolor: 'rgba(255, 255, 255, 0.08)', transform: 'translateY(-1px)' } 
            }}
          >
            <CloseIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Scrollable Content */}
      <Box sx={{ 
        px: 4, 
        py: 5, 
        overflow: 'auto', 
        flexGrow: 1,
        '&::-webkit-scrollbar': { width: 0 },
        scrollbarWidth: 'none'
      }}>
        {/* Title & Description */}
        {isEditing ? (
          <Box sx={{ 
            mb: 6,
            p: 3,
            bgcolor: alpha('#161412', 0.4),
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <TextField
              fullWidth
              variant="standard"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              sx={{ mb: 2.5 }}
              InputProps={{ 
                sx: { 
                    fontSize: '1.75rem', 
                    fontWeight: 900, 
                    fontFamily: 'var(--font-clash-display)',
                    letterSpacing: '-0.02em',
                    '&:before, &:after': { display: 'none' } 
                } 
              }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="standard"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Add more context..."
              InputProps={{
                disableUnderline: true,
                sx: { 
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                    p: 2,
                    borderRadius: '16px',
                    fontSize: '0.95rem',
                    fontFamily: 'var(--font-satoshi)',
                    lineHeight: 1.6
                }
              }}
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 3.5 }}>
              <Button 
                variant="contained" 
                onClick={handleSaveEdit}
                sx={{ borderRadius: '12px', px: 3, fontWeight: 800 }}
              >
                Save
              </Button>
              <Button 
                onClick={() => setIsEditing(false)} 
                sx={{ color: 'text.secondary', fontWeight: 700 }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            mb: 6,
            transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': { transform: 'translateZ(10px)' }
          }}>
            <Typography
              variant="h3"
              sx={{
                mb: 2.5,
                fontWeight: 900,
                lineHeight: 1.1,
                fontFamily: 'var(--font-clash-display)',
                letterSpacing: '-0.03em',
                textDecoration: task.status === 'done' ? 'line-through' : 'none',
                color: task.status === 'done' ? 'text.disabled' : '#F2F2F2',
                opacity: task.status === 'done' ? 0.6 : 1,
              }}
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography 
                variant="body1" 
                sx={{ 
                  color: 'text.secondary', 
                  fontSize: '1rem', 
                  lineHeight: 1.8,
                  fontFamily: 'var(--font-satoshi)',
                  fontWeight: 500,
                  opacity: 0.8
                }}
              >
                {task.description}
              </Typography>
            )}
          </Box>
        )}

        {/* Actionable Meta Grid */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: 4, 
          mb: 6,
          p: 4,
          bgcolor: alpha('#161412', 0.2),
          borderRadius: '32px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.02)'
        }}>
          {/* Project */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.65rem', opacity: 0.5 }}>Project Domain</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                 <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: project?.color || '#6366F1', boxShadow: `0 0 10px ${alpha(project?.color || '#6366F1', 0.4)}` }} />
                 <Typography variant="body2" fontWeight={800} sx={{ fontFamily: 'var(--font-clash-display)', letterSpacing: '0.02em' }}>{project?.name || 'Inbox'}</Typography>
            </Box>
          </Box>

          {/* Priority */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.65rem', opacity: 0.5 }}>Urgency Level</Typography>
            <Box 
                onClick={(e) => setPriorityAnchor(e.currentTarget)}
                sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1.5, 
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    '&:hover': { opacity: 0.7 }
                }}
            >
                 <FlagIcon sx={{ fontSize: 18, color: priorityColors[task.priority] }} />
                 <Typography variant="body2" fontWeight={800} sx={{ color: priorityColors[task.priority], fontFamily: 'var(--font-clash-display)', letterSpacing: '0.05em' }}>
                    {task.priority.toUpperCase()}
                 </Typography>
            </Box>
          </Box>

          {/* Due Date */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.65rem', opacity: 0.5 }}>Timeline Deadline</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
                 <CalendarIcon sx={{ fontSize: 18, opacity: 0.6 }} />
                 <Typography variant="body2" fontWeight={700} sx={{ fontFamily: 'var(--font-satoshi)' }}>
                    {task.dueDate ? format(new Date(task.dueDate), 'MMM d, yyyy') : 'Open Schedule'}
                 </Typography>
            </Box>
          </Box>

          {/* Labels */}
          {taskLabels.length > 0 && (
            <Box>
                <Typography variant="subtitle2" sx={{ mb: 1.5, fontSize: '0.65rem', opacity: 0.5 }}>Meta Tags</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {taskLabels.map((label) => (
                    <Chip
                        key={label.id}
                        label={label.name}
                        size="small"
                        sx={{
                            height: 22,
                            fontSize: '0.65rem',
                            bgcolor: alpha(label.color, 0.08),
                            border: `1px solid ${alpha(label.color, 0.2)}`,
                            color: label.color,
                            fontWeight: 800,
                            fontFamily: 'var(--font-clash-display)',
                            letterSpacing: '0.05em',
                            borderRadius: '6px'
                        }}
                    />
                    ))}
                </Box>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 4, opacity: 0.05 }} />

        {/* Social Context - Origin Integration */}
        <OriginSocialSection taskTitle={task.title} />

        {/* Subtasks Section */}
        <Box sx={{ mb: 5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2">Execution Track</Typography>
            {task.subtasks.length > 0 && (
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                {completedSubtasks} / {task.subtasks.length}
              </Typography>
            )}
          </Box>

          {task.subtasks.length > 0 && (
            <Box sx={{ width: '100%', height: 4, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, mb: 3, overflow: 'hidden' }}>
                <Box 
                    sx={{ 
                        height: '100%', 
                        width: `${subtaskProgress}%`, 
                        bgcolor: '#6366F1', 
                        boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
                        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)' 
                    }} 
                />
            </Box>
          )}

          <List sx={{ mb: 2 }}>
            {task.subtasks.map((subtask) => (
              <ListItem
                key={subtask.id}
                disablePadding
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.02)',
                  },
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    sx={{ opacity: 0.2, '&:hover': { opacity: 1, color: 'error.main' } }}
                  >
                    <DeleteIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                }
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Checkbox
                    edge="start"
                    checked={subtask.completed}
                    onChange={() => toggleSubtask(task.id, subtask.id)}
                    size="small"
                    sx={{
                        p: 0,
                        color: 'rgba(255, 255, 255, 0.1)',
                        '&.Mui-checked': { color: '#6366F1' }
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  primary={subtask.title}
                  primaryTypographyProps={{
                    sx: {
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      textDecoration: subtask.completed ? 'line-through' : 'none',
                      color: subtask.completed ? 'text.disabled' : 'text.primary',
                    }
                  }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', gap: 1, bgcolor: 'rgba(255, 255, 255, 0.02)', p: 0.5, borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.04)' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Add sub-task..."
              value={newSubtask}
              variant="standard"
              onChange={(e) => setNewSubtask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
              InputProps={{ 
                disableUnderline: true,
                sx: { px: 1.5, fontSize: '0.85rem' }
              }}
            />
            <IconButton 
                size="small" 
                onClick={handleGenerateSubtasks} 
                disabled={isGeneratingSubtasks}
                sx={{ color: '#6366F1' }}
            >
                {isGeneratingSubtasks ? <CircularProgress size={16} color="inherit" /> : <AutoFixHighIcon sx={{ fontSize: 18 }} />}
            </IconButton>
            <IconButton size="small" onClick={handleAddSubtask} disabled={!newSubtask.trim()} sx={{ color: '#F2F2F2' }}>
              <AddIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 4, opacity: 0.05 }} />

        {/* Ecosystem Integration */}
        <Box sx={{ mb: 5 }}>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>Ecosystem Links</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<NotesIcon sx={{ fontSize: 16 }} />}
              sx={{ justifyContent: 'flex-start', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255, 255, 255, 0.01)', fontSize: '0.75rem' }}
            >
              Note
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<MeetingIcon sx={{ fontSize: 16 }} />}
              sx={{ justifyContent: 'flex-start', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255, 255, 255, 0.01)', fontSize: '0.75rem' }}
            >
              Meet
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CalendarIcon sx={{ fontSize: 16 }} />}
              sx={{ justifyContent: 'flex-start', border: '1px solid rgba(255, 255, 255, 0.05)', bgcolor: 'rgba(255, 255, 255, 0.01)', fontSize: '0.75rem' }}
            >
              Cal
            </Button>
          </Box>
        </Box>

        {/* Comments Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" sx={{ mb: 3 }}>Collaboration ({task.comments.length})</Typography>

          <List disablePadding sx={{ mb: 3 }}>
            {task.comments.map((comment) => (
              <ListItem
                key={comment.id}
                alignItems="flex-start"
                disablePadding
                sx={{ mb: 3 }}
              >
                <ListItemIcon sx={{ minWidth: 36, mt: 0.5 }}>
                  <Avatar sx={{ width: 24, height: 24, fontSize: '0.7rem', fontWeight: 800, bgcolor: 'rgba(255, 255, 255, 0.1)', color: '#F2F2F2' }}>
                    {comment.authorName.charAt(0)}
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: '0.8rem' }}>
                        {comment.authorName}
                      </Typography>
                      <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.4 }}>
                        {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                      </Typography>
                    </Box>
                  }
                  secondary={comment.content}
                  secondaryTypographyProps={{ sx: { color: 'text.secondary', fontSize: '0.875rem' } }}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end', bgcolor: 'rgba(255,255,255,0.02)', p: 1.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)' }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Write a comment..."
              variant="standard"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
              multiline
              maxRows={6}
              InputProps={{ 
                disableUnderline: true,
                sx: { fontSize: '0.9rem' }
              }}
            />
            <IconButton
              size="small"
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              sx={{ color: '#6366F1', p: 0.5 }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Menus */}
      <Menu
        anchorEl={statusAnchor}
        open={Boolean(statusAnchor)}
        onClose={() => setStatusAnchor(null)}
        PaperProps={{ sx: { minWidth: 160 } }}
      >
        {Object.entries(statusLabels).map(([status, label]) => (
          <MenuItem
            key={status}
            onClick={() => handleStatusChange(status as TaskStatus)}
            selected={task.status === status}
            sx={{ fontSize: '0.85rem' }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>

      <Menu
        anchorEl={priorityAnchor}
        open={Boolean(priorityAnchor)}
        onClose={() => setPriorityAnchor(null)}
        PaperProps={{ sx: { minWidth: 160 } }}
      >
        {(['low', 'medium', 'high', 'urgent'] as Priority[]).map((priority) => (
          <MenuItem
            key={priority}
            onClick={() => handlePriorityChange(priority)}
            selected={task.priority === priority}
            sx={{ fontSize: '0.85rem', gap: 1 }}
          >
            <FlagIcon sx={{ fontSize: 16, color: priorityColors[priority] }} />
            {priority.toUpperCase()}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
