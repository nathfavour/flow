'use client';

import React, { useState } from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
  InputBase,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  Tooltip,
  ListItemIcon,
  ListItemText,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Menu as LucideMenu,
  Search,
  Plus,
  Bell,
  Settings,
  LogOut,
  User,
  HelpCircle,
  Keyboard,
  LayoutGrid,
  Sparkles,
  Download,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useTask } from '@/context/TaskContext';
import { useAuth } from '@/context/auth/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { Logo } from '@/components/common';
import { ECOSYSTEM_APPS } from '@/lib/constants';
import dynamic from 'next/dynamic';
import { fetchProfilePreview, getCachedProfilePreview } from '@/lib/profile-preview';
import { getUserProfilePicId } from '@/lib/user-utils';

const AICommandModal = dynamic(() => import('@/components/ai/AICommandModal'), { ssr: false });
const EcosystemPortal = dynamic(() => import('@/components/common/EcosystemPortal'), { ssr: false });

function getInitials(user: { name?: string | null; email?: string | null } | null) {
  const text = user?.name?.trim() || user?.email?.split('@')[0] || '';
  if (!text) return 'U';
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AppBar() {
  const theme = useTheme();
  const { toggleSidebar, setSearchQuery, searchQuery, setTaskDialogOpen } = useTask();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const profilePicId = getUserProfilePicId(user);
    const cached = getCachedProfilePreview(profilePicId || undefined);
    if (cached !== undefined && mounted) {
      setProfileUrl(cached ?? null);
    }

    const fetchPreview = async () => {
      try {
        if (profilePicId) {
          const url = await fetchProfilePreview(profilePicId, 64, 64);
          if (mounted) setProfileUrl(url as unknown as string);
        } else if (mounted) setProfileUrl(null);
      } catch (err) {
        if (mounted) setProfileUrl(null);
      }
    };

    fetchPreview();
    return () => { mounted = false; };
  }, [user]);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

  const [portalOpen, setPortalOpen] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + Space to open portal
      if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
        e.preventDefault();
        setPortalOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setAnchorEl(null);
    setAppsAnchorEl(null);
    setNotifAnchorEl(null);
  };


  return (
    <MuiAppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(25px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      <Toolbar sx={{ gap: 1, minHeight: '64px' }}>
        {/* Menu Toggle - only on desktop */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          sx={{
            color: '#F2F2F2',
            display: { xs: 'none', md: 'flex' },
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
          }}
        >
          <LucideMenu size={20} strokeWidth={1.5} />
        </IconButton>

        {/* Logo */}
        <Box sx={{ mr: { xs: 0, md: 2 }, display: { xs: 'none', sm: 'flex' } }}>
          <Logo size="medium" showText={true} />
        </Box>
        <Box sx={{ mr: { xs: 0, md: 2 }, display: { xs: 'flex', sm: 'none' } }}>
          <Logo size="small" showText={false} />
        </Box>

        {/* Search */}
        <Box
          sx={{
            position: 'relative',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.15)',
            },
            width: { xs: 0, sm: 300, md: 400 },
            maxWidth: '100%',
            display: { xs: 'none', sm: 'block' },
            transition: 'all 0.2s ease',
          }}
        >
          <Box
            sx={{
              padding: theme.spacing(0, 2),
              height: '100%',
              position: 'absolute',
              pointerEvents: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Search size={18} strokeWidth={1.5} color="#A1A1AA" />
          </Box>
          <InputBase
            placeholder="Search tasks... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: '#F2F2F2',
              width: '100%',
              fontFamily: 'var(--font-mono)',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1.25, 1.5, 1.25, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                width: '100%',
                fontSize: '0.85rem',
                fontWeight: 500,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* AI Assistant Button */}
          <Tooltip title="AI Assistant">
            <IconButton
              onClick={() => setAiModalOpen(true)}
              sx={{
                backgroundColor: 'rgba(0, 240, 255, 0.05)',
                color: '#00F0FF',
                borderRadius: '12px',
                p: 1.25,
                border: '1px solid rgba(0, 240, 255, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  borderColor: '#00F0FF',
                },
              }}
            >
              <Sparkles size={20} strokeWidth={1.5} />
            </IconButton>
          </Tooltip>

          {/* Add Task Button */}
          <Tooltip title="Add task (Ctrl+N)">
            <IconButton
              onClick={() => setTaskDialogOpen(true)}
              sx={{
                backgroundColor: '#00F0FF',
                color: '#000000',
                borderRadius: '12px',
                p: 1.25,
                '&:hover': {
                  backgroundColor: alpha('#00F0FF', 0.8),
                  boxShadow: '0 0 20px rgba(0, 240, 255, 0.4)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
              }}
            >
              <Plus size={20} strokeWidth={2} />
            </IconButton>
          </Tooltip>

          {/* Ecosystem Apps - hidden on mobile */}
          <Tooltip title="Whisperr Portal (Ctrl+Space)">
            <IconButton
              onClick={() => setPortalOpen(true)}
              sx={{
                color: '#00F0FF',
                display: { xs: 'none', sm: 'flex' },
                borderRadius: '12px',
                p: 1.25,
                bgcolor: 'rgba(0, 240, 255, 0.05)',
                border: '1px solid rgba(0, 240, 255, 0.1)',
                animation: 'pulse 3s infinite ease-in-out',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(0, 240, 255, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(0, 240, 255, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(0, 240, 255, 0)' },
                },
                '&:hover': {
                  backgroundColor: 'rgba(0, 240, 255, 0.1)',
                  borderColor: '#00F0FF',
                  color: '#00F0FF',
                }
              }}
            >
              <LayoutGrid size={20} strokeWidth={1.5} />
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotifClick}
              sx={{
                color: unreadCount > 0 ? '#00F0FF' : '#A1A1AA',
                borderRadius: '12px',
                p: 1.25,
                bgcolor: unreadCount > 0 ? 'rgba(0, 240, 255, 0.05)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#F2F2F2',
                }
              }}
            >
              <Badge
                badgeContent={unreadCount}
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    backgroundColor: '#00F0FF',
                    color: '#000000',
                  }
                }}
              >
                <Bell size={20} strokeWidth={1.5} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="User Profile">
            <IconButton onClick={handleProfileClick} sx={{ 
              ml: 0.5,
              p: 0.5,
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '12px',
              '&:hover': { borderColor: 'rgba(0, 240, 255, 0.2)', bgcolor: 'rgba(255, 255, 255, 0.05)' }
            }}>
              <Avatar
                src={profileUrl || undefined}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: '10px',
                  bgcolor: '#0A0A0A',
                  color: '#00F0FF',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                }}
              >
                {getInitials(user)}
              </Avatar>
            </IconButton>
          </Tooltip>
        </Box>

        {/* Profile Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 240,
              mt: 1.5,
              borderRadius: '16px',
              bgcolor: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(25px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={profileUrl || undefined}
                sx={{ 
                  width: 40, 
                  height: 40, 
                  bgcolor: 'rgba(0, 240, 255, 0.1)',
                  color: 'primary.main',
                  borderRadius: '12px',
                  fontWeight: 900
                }}
              >
                {getInitials(user)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif', lineHeight: 1.2 }}>
                  {user.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }} noWrap>
                  {user.email}
                </Typography>
              </Box>
            </Box>
          )}
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <MenuItem sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}>
            <ListItemIcon>
              <User size={20} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Profile</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
            onClick={() => {
              handleClose();
              const domain = process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space';
              const idSubdomain = process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'id';
              window.location.href = `https://${idSubdomain}.${domain}/settings?source=${encodeURIComponent(window.location.origin)}`;
            }}
          >
            <ListItemIcon>
              <Settings size={20} strokeWidth={1.5} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Settings</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ py: 1.2, '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' } }}
            onClick={() => {
              alert('Exporting your data...');
              handleClose();
            }}
          >
            <ListItemIcon>
              <Download size={20} strokeWidth={1.5} color="#FFC107" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700, color: '#FFC107' }}>Export Data</ListItemText>
          </MenuItem>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <MenuItem sx={{ py: 1.2, color: 'error.main', '&:hover': { bgcolor: 'rgba(255, 0, 0, 0.05)' } }} onClick={() => logout()}>
            <ListItemIcon>
              <LogOut size={20} strokeWidth={1.5} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700 }}>Sign out</ListItemText>
          </MenuItem>
        </Menu>

        {/* Apps Menu */}
        <Menu
          anchorEl={appsAnchorEl}
          open={Boolean(appsAnchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 320,
              mt: 1.5,
              p: 1,
              borderRadius: '20px',
              bgcolor: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(25px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Typography variant="overline" sx={{ px: 2, color: 'text.secondary', fontWeight: 800, letterSpacing: '0.1em' }}>
            Whisperr Ecosystem
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
              mt: 1,
              p: 1
            }}
          >
            {ECOSYSTEM_APPS.map((app) => (
              <Box
                key={app.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: '16px',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: '1px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    transform: 'translateY(-2px)'
                  },
                }}
              >
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '12px',
                    backgroundColor: alpha(app.color, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    mb: 1,
                    border: `1px solid ${alpha(app.color, 0.2)}`
                  }}
                >
                  {app.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    textAlign: 'center',
                    color: 'text.primary'
                  }}
                >
                  {app.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Menu>

        {/* Notifications Menu */}
        <Menu
          anchorEl={notifAnchorEl}
          open={Boolean(notifAnchorEl)}
          onClose={handleClose}
          PaperProps={{
            elevation: 0,
            sx: {
              width: 360,
              mt: 1.5,
              borderRadius: '20px',
              bgcolor: 'rgba(10, 10, 10, 0.95)',
              backdropFilter: 'blur(25px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundImage: 'none',
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 900, fontFamily: '"Space Grotesk", sans-serif' }}>
              Intelligence Feed
            </Typography>
            {unreadCount > 0 && (
              <Typography
                variant="caption"
                onClick={() => { markAllAsRead(); handleClose(); }}
                sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 700 }}
              >
                Mark all read
              </Typography>
            )}
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Clock size={32} color="rgba(255, 255, 255, 0.1)" style={{ marginBottom: 12, marginLeft: 'auto', marginRight: 'auto' }} />
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                  No recent activity detected
                </Typography>
              </Box>
            ) : (
              notifications.slice(0, 10).map((notif) => {
                const isRead = !!localStorage.getItem(`read_notif_${notif.$id}`);
                return (
                  <MenuItem
                    key={notif.$id}
                    onClick={() => { markAsRead(notif.$id); handleClose(); }}
                    sx={{
                      py: 2,
                      px: 2.5,
                      borderLeft: isRead ? 'none' : '3px solid #00F5FF',
                      backgroundColor: isRead
                        ? 'transparent'
                        : 'rgba(0, 245, 255, 0.03)',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                      <Box sx={{ 
                        width: 36, 
                        height: 36, 
                        borderRadius: '10px', 
                        bgcolor: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {notif.action.toLowerCase().includes('delete') ? (
                          <XCircle size={18} color="#FF4D4D" />
                        ) : (
                          <CheckCircle size={18} color="#00F5FF" />
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
                          {notif.action.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', mt: 0.5, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {notif.targetType}: {notif.details || notif.targetId}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.disabled', mt: 0.5, display: 'block' }}>
                          {new Date(notif.timestamp).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                  </MenuItem>
                );
              })
            )}
          </Box>
          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />
          <MenuItem sx={{ justifyContent: 'center', py: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700 }}>
              View all activity
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
      <AICommandModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
      <EcosystemPortal open={portalOpen} onClose={() => setPortalOpen(false)} />
    </MuiAppBar>
  );
}
