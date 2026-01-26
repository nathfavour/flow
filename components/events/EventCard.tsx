'use client';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Avatar,
  AvatarGroup,
  IconButton,
  Chip,
  useTheme,
  alpha,
} from '@mui/material';
import {
  LocationOn,
  Share,
  AccessTime,
  People,
  MoreVert as MoreIcon,
  Assignment as NoteIcon,
} from '@mui/icons-material';
import { Event } from '@/types';
import { format, isToday, isTomorrow } from 'date-fns';
import { generateEventPattern as generatePattern } from '@/utils/patternGenerator';
import { useState } from 'react';
import { Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import { NoteSelectorModal } from '../common/NoteSelectorModal';
import { SecretSelectorModal } from '../common/SecretSelectorModal';
import { events as eventApi } from '@/lib/whisperrflow';
import { VpnKey as KeyIcon } from '@mui/icons-material';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

export default function EventCard({ event, onClick }: EventCardProps) {
  const theme = useTheme();
  const pattern = generatePattern(event.id);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const getDateLabel = () => {
    const date = new Date(event.startTime);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return null;
  };
  
  const dateLabel = getDateLabel();

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setAnchorEl(e.currentTarget as HTMLElement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Card
      elevation={0}
      onContextMenu={handleMenuClick}
      sx={{
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.15)}`,
          borderColor: alpha(theme.palette.primary.main, 0.4),
          '& .event-image': {
            transform: 'scale(1.05)',
          },
          '& .event-overlay': {
            opacity: 0.4,
          },
        },
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.mode === 'light' 
          ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))'
          : 'linear-gradient(180deg, rgba(32,32,32,0.98), rgba(24,24,24,0.92))',
        backdropFilter: 'blur(10px)',
      }}
      onClick={onClick}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        <CardMedia
          component="img"
          height="140"
          image={event.coverImage || undefined}
          alt={event.title}
          className="event-image"
          sx={{
            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            background: !event.coverImage ? pattern : undefined,
            objectFit: 'cover',
          }}
        />
        {/* Gradient overlay */}
        <Box
          className="event-overlay"
          sx={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(180deg, transparent 40%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
            opacity: 0.6,
            transition: 'opacity 0.3s ease',
          }}
        />
        {/* Date badge */}
        <Box
          sx={{
            position: 'absolute',
            top: 12,
            left: 12,
            bgcolor: theme.palette.mode === 'light' 
              ? 'rgba(255, 255, 255, 0.95)' 
              : 'rgba(32, 32, 32, 0.95)',
            borderRadius: 2.5,
            px: 1.5,
            py: 0.75,
            boxShadow: `0 4px 12px ${alpha('#000', 0.15)}`,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 48,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Typography 
            variant="caption" 
            fontWeight="700" 
            sx={{ 
              textTransform: 'uppercase',
              color: theme.palette.primary.main,
              fontSize: '0.65rem',
              letterSpacing: '0.05em',
            }}
          >
            {format(new Date(event.startTime), 'MMM')}
          </Typography>
          <Typography 
            variant="h5" 
            fontWeight="800" 
            sx={{ 
              lineHeight: 1,
              color: theme.palette.text.primary,
            }}
          >
            {format(new Date(event.startTime), 'd')}
          </Typography>
        </Box>
        {/* Today/Tomorrow chip */}
        {dateLabel && (
          <Chip
            label={dateLabel}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              bgcolor: dateLabel === 'Today' 
                ? alpha(theme.palette.success.main, 0.9)
                : alpha(theme.palette.info.main, 0.9),
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.7rem',
              height: 24,
              backdropFilter: 'blur(4px)',
            }}
          />
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5 }}>
        <Box>
          <Typography 
            variant="h6" 
            fontWeight="700" 
            gutterBottom 
            noWrap
            sx={{
              fontSize: '1.05rem',
              lineHeight: 1.3,
            }}
          >
            {event.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', mb: 0.75 }}>
            <AccessTime sx={{ fontSize: 15, color: theme.palette.primary.main }} />
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
            </Typography>
          </Box>
          {event.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary' }}>
              <LocationOn sx={{ fontSize: 15, color: theme.palette.secondary.main }} />
              <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>
                {event.location}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 1 }}>
          {event.attendees.length > 0 ? (
            <AvatarGroup 
              max={4} 
              sx={{ 
                '& .MuiAvatar-root': { 
                  width: 28, 
                  height: 28, 
                  fontSize: 11,
                  border: `2px solid ${theme.palette.background.paper}`,
                  boxShadow: `0 2px 8px ${alpha('#000', 0.1)}`,
                } 
              }}
            >
              {event.attendees.map((id) => (
                <Avatar key={id} alt="User" src={`https://i.pravatar.cc/150?u=${id}`} />
              ))}
            </AvatarGroup>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
              <People sx={{ fontSize: 16 }} />
              <Typography variant="caption">No attendees yet</Typography>
            </Box>
          )}
          <IconButton 
            size="small" 
            onClick={handleMenuClick}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <MoreIcon fontSize="small" sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </CardContent>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { 
            minWidth: 180, 
            borderRadius: 2,
            backgroundColor: '#0A0A0A',
            border: '1px solid #222222',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          },
        }}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon><Share fontSize="small" sx={{ fontSize: 16, color: '#A1A1AA' }} /></ListItemIcon>
          <ListItemText primary="Share Event" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
        </MenuItem>
      </Menu>
    </Card>
  );
}
