'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  useTheme,
  alpha,
  Chip,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  Event as EventIcon,
  CheckCircle as CheckCircleIcon,
  AccessTime as ScheduleIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import { useAI } from '@/hooks/useAI';
import { useTask } from '@/context/TaskContext';
import { useAuth } from '@/context/auth/AuthContext';
import { events as eventApi } from '@/lib/whisperrflow';
import { permissions } from '@/lib/permissions';

interface AICommandModalProps {
  open: boolean;
  onClose: () => void;
}

type AIIntent = 'create_task' | 'create_event' | 'unknown';

interface TaskData {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
}

interface EventData {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
}

interface AIResponse {
  intent: AIIntent;
  data: TaskData & EventData; // Union or intersection for simplicity in handling
  summary: string;
}

export default function AICommandModal({ open, onClose }: AICommandModalProps) {
  const theme = useTheme();
  const { generate } = useAI();
  const { addTask, projects, userId } = useTask();
  const { user } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<AIResponse | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    onClose();
    setPrompt('');
    setResult(null);
    setIsExecuting(false);
  };

  const handleAnalyze = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);

    const systemPrompt = `
      You are an intelligent assistant for a productivity app.
      Analyze the user's request and extract the intent to create a "task" or an "event".
      
      Current Date: ${new Date().toISOString()}
      
      Return ONLY a valid JSON object with this structure:
      {
        "intent": "create_task" | "create_event" | "unknown",
        "summary": "A short summary of what will be created",
        "data": {
          // For tasks:
          "title": "string",
          "description": "string (optional)",
          "priority": "low" | "medium" | "high" | "urgent",
          "dueDate": "ISO date string (optional)",
          
          // For events:
          "title": "string",
          "description": "string (optional)",
          "startTime": "ISO date string",
          "endTime": "ISO date string",
          "location": "string (optional)"
        }
      }
      
      If the intent is unclear, set intent to "unknown".
    `;

    try {
      const response = await generate(`${systemPrompt}\n\nUser Request: ${prompt}`);
      
      // Clean up the response to ensure it's valid JSON
      const jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      setResult(parsed);
    } catch (error) {
      console.error('AI Analysis failed', error);
      // Handle error (maybe show a snackbar)
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecute = async () => {
    if (!result || !result.data) return;

    setIsExecuting(true);
    try {
      if (result.intent === 'create_task') {
        await addTask({
          title: result.data.title,
          description: result.data.description,
          priority: result.data.priority || 'medium',
          dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined,
          status: 'todo',
          labels: [],
          subtasks: [],
          comments: [],
          attachments: [],
          reminders: [],
          timeEntries: [],
          assigneeIds: [user?.$id || ''],
          projectId: 'inbox', // Default to inbox
          creatorId: user?.$id || 'guest',
          isArchived: false,
        });
      } else if (result.intent === 'create_event') {
        const currentUserId = userId || 'guest';
        const visibility = 'public'; // Default to public for now
        const eventPermissions = permissions.forVisibility(visibility, currentUserId);
        
        // Default duration if not specified or same as start
        const start = new Date(result.data.startTime);
        let end = new Date(result.data.endTime);
        if (isNaN(end.getTime()) || end <= start) {
            end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default
        }

        await eventApi.create(
          {
            title: result.data.title,
            description: result.data.description || '',
            startTime: start.toISOString(),
            endTime: end.toISOString(),
            location: result.data.location || '',
            meetingUrl: '',
            visibility: visibility,
            status: 'confirmed',
            coverImageId: '',
            maxAttendees: 0,
            recurrenceRule: '',
            calendarId: projects[0]?.id || 'default',
            userId: currentUserId,
          },
          eventPermissions
        );
      }
      
      handleClose();
    } catch (error) {
      console.error('Execution failed', error);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundImage: 'none',
          background: theme.palette.mode === 'dark' 
            ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.95)} 100%)`
            : theme.palette.background.paper,
          backdropFilter: 'blur(10px)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color={theme.palette.secondary.main} />
        <Typography variant="h6" fontWeight={600}>
          AI Assistant
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {!result ? (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Describe what you want to do, and I&apos;ll help you create it.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={3}
              placeholder="e.g., 'Schedule a team meeting for next Tuesday at 2 PM' or 'Remind me to buy groceries tomorrow'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isLoading}
              sx={{
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Here&apos;s what I found:
            </Typography>
            
            <Card variant="outlined" sx={{ mt: 2, borderRadius: 2, position: 'relative', overflow: 'visible' }}>
              <Box
                sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  bgcolor: theme.palette.success.main,
                  color: 'white',
                  borderRadius: '50%',
                  p: 0.5,
                  display: 'flex',
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 20 }} />
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Chip 
                    label={result.intent === 'create_task' ? 'Task' : 'Event'} 
                    color={result.intent === 'create_task' ? 'primary' : 'secondary'}
                    size="small"
                    icon={result.intent === 'create_task' ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <EventIcon sx={{ fontSize: 16 }} />}
                  />
                  <Typography variant="h6" component="div">
                    {result.data.title}
                  </Typography>
                </Box>
                
                {result.data.description && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, color: 'text.secondary' }}>
                    <DescriptionIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">{result.data.description}</Typography>
                  </Box>
                )}

                {(result.data.dueDate || result.data.startTime) && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, color: 'text.secondary' }}>
                    <ScheduleIcon sx={{ fontSize: 20 }} />
                    <Typography variant="body2">
                      {result.intent === 'create_task' && result.data.dueDate
                        ? new Date(result.data.dueDate).toLocaleString()
                        : result.intent === 'create_event'
                        ? `${new Date(result.data.startTime).toLocaleString()} - ${new Date(result.data.endTime).toLocaleTimeString()}`
                        : ''
                      }
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
            
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
              {result.summary}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        {!result ? (
          <Button
            variant="contained"
            onClick={handleAnalyze}
            disabled={!prompt.trim() || isLoading}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
            fullWidth
            sx={{
              borderRadius: 2,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: 'white',
              py: 1,
            }}
          >
            {isLoading ? 'Analyzing...' : 'Generate'}
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
            <Button
              variant="outlined"
              onClick={() => setResult(null)}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Try Again
            </Button>
            <Button
              variant="contained"
              onClick={handleExecute}
              disabled={isExecuting}
              fullWidth
              sx={{
                borderRadius: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                color: 'white',
              }}
            >
              {isExecuting ? 'Creating...' : 'Confirm & Create'}
            </Button>
          </Box>
        )}
      </DialogActions>
    </Dialog>
  );
}
