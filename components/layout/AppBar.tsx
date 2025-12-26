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
  Bars3Icon as MenuIcon,
  MagnifyingGlassIcon as SearchIcon,
  PlusIcon as AddIcon,
  BellIcon as NotificationsIcon,
  Cog6ToothIcon as SettingsIcon,
  MoonIcon as DarkModeIcon,
  SunIcon as LightModeIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  UserIcon as PersonIcon,
  QuestionMarkCircleIcon as HelpIcon,
  CommandLineIcon as KeyboardIcon,
  Squares2X2Icon as AppsIcon,
  SparklesIcon as AutoAwesomeIcon,
} from '@heroicons/react/24/outline';
import { useTask } from '@/context/TaskContext';
import { useAuth } from '@/context/auth/AuthContext';
import { useThemeMode } from '@/theme';
import { Logo } from '@/components/common';
import { ECOSYSTEM_APPS } from '@/lib/constants';
import dynamic from 'next/dynamic';

const AICommandModal = dynamic(() => import('@/components/ai/AICommandModal'), { ssr: false });

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
  const { mode, toggleMode } = useThemeMode();
  const { toggleSidebar, setSearchQuery, searchQuery, setTaskDialogOpen } = useTask();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [appsAnchorEl, setAppsAnchorEl] = useState<null | HTMLElement>(null);
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAppsClick = (event: React.MouseEvent<HTMLElement>) => {
    setAppsAnchorEl(event.currentTarget);
  };

  const handleNotifClick = (event: React.MouseEvent<HTMLElement>) => {
    setNotifAnchorEl(event.currentTarget);
  };

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
        backgroundColor: theme.palette.background.paper,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Menu Toggle - only on desktop */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label="toggle sidebar"
          onClick={toggleSidebar}
          sx={{
            color: theme.palette.text.primary,
            display: { xs: 'none', md: 'flex' },
          }}
        >
          <MenuIcon />
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
            borderRadius: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderColor: theme.palette.primary.main,
            },
            width: { xs: 0, sm: 300, md: 400 },
            maxWidth: '100%',
            display: { xs: 'none', sm: 'block' },
            transition: 'all 0.1s ease',
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
            <SearchIcon className="h-5 w-5" style={{ color: theme.palette.text.secondary }} />
          </Box>
          <InputBase
            placeholder="Search tasks... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              color: theme.palette.text.primary,
              width: '100%',
              fontFamily: 'var(--font-mono)',
              '& .MuiInputBase-input': {
                padding: theme.spacing(1.25, 1.5, 1.25, 0),
                paddingLeft: `calc(1em + ${theme.spacing(4)})`,
                width: '100%',
                fontSize: '0.9rem',
                fontWeight: 600,
              },
            }}
          />
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        {/* Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* AI Assistant Button */}
          <Tooltip title="AI Assistant">
            <IconButton
              onClick={() => setAiModalOpen(true)}
              sx={{
                backgroundColor: 'rgba(26, 35, 126, 0.2)',
                color: '#8C9EFF',
                borderRadius: 1,
                p: 1.25,
                border: '1px solid rgba(26, 35, 126, 0.3)',
                '&:hover': {
                  backgroundColor: 'rgba(26, 35, 126, 0.4)',
                },
              }}
            >
              <AutoAwesomeIcon className="h-5 w-5" />
            </IconButton>
          </Tooltip>

          {/* Add Task Button */}
          <Tooltip title="Add task (Ctrl+N)">
            <IconButton
              onClick={() => setTaskDialogOpen(true)}
              sx={{
                backgroundColor: theme.palette.primary.main,
                color: '#1B1C20',
                borderRadius: 1,
                p: 1.25,
                boxShadow: '4px 4px 0 rgba(26, 35, 126, 0.8)',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  transform: 'translate(-1px, -1px)',
                  boxShadow: '6px 6px 0 rgba(26, 35, 126, 0.9)',
                },
                '&:active': {
                  transform: 'translate(1px, 1px)',
                  boxShadow: 'none',
                },
              }}
            >
              <AddIcon className="h-5 w-5" />
            </IconButton>
          </Tooltip>

          {/* Ecosystem Apps - hidden on mobile */}
          <Tooltip title="Whisperr Apps">
            <IconButton
              onClick={handleAppsClick}
              sx={{
                color: theme.palette.text.secondary,
                display: { xs: 'none', sm: 'flex' },
                borderRadius: 1,
                p: 1.25,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <AppsIcon className="h-5 w-5" />
            </IconButton>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip title={`Switch to ${mode === 'dark' ? 'light' : mode === 'light' ? 'system' : 'dark'} mode`}>
            <IconButton
              onClick={toggleMode}
              sx={{
                color: theme.palette.text.secondary,
                borderRadius: 1,
                p: 1.25,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              {mode === 'dark' ? <LightModeIcon className="h-5 w-5" /> : <DarkModeIcon className="h-5 w-5" />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={handleNotifClick}
              sx={{
                color: theme.palette.text.secondary,
                borderRadius: 1,
                p: 1.25,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }
              }}
            >
              <Badge
                badgeContent={3}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    fontSize: '0.65rem',
                    borderRadius: 0,
                  }
                }}
              >
                <NotificationsIcon className="h-5 w-5" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Profile */}
          <Tooltip title="User Profile">
            <IconButton onClick={handleProfileClick} sx={{ ml: 0.5 }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      bgcolor: '#10b981',
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.background.default}`,
                      boxShadow: '0 0 4px rgba(16, 185, 129, 0.5)'
                    }}
                  />
                }
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: 1,
                    bgcolor: theme.palette.primary.main,
                    color: '#1B1C20',
                    fontSize: '0.9rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                    boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                  }}
                >
                  {getInitials(user)}
                </Avatar>
              </Badge>
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
            elevation: 3,
            sx: { width: 240, mt: 1.5 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {user && (
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            </Box>
          )}
          <Divider />
          <MenuItem>
            <ListItemIcon>
              <PersonIcon className="h-5 w-5" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 500 }}>Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            handleClose();
            const domain = process.env.NEXT_PUBLIC_DOMAIN || 'whisperrnote.space';
            const authSub = process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'accounts';
            window.location.href = `https://${authSub}.${domain}/settings?source=${encodeURIComponent(window.location.origin)}`;
          }}>
            <ListItemIcon>
              <SettingsIcon className="h-5 w-5" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Vault Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => {
            alert('Exporting your data...');
            handleClose();
          }}>
            <ListItemIcon>
              <LogoutIcon className="h-5 w-5 rotate-180" style={{ color: '#FFC107' }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 700, color: '#FFC107' }}>Export Data</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <KeyboardIcon className="h-5 w-5" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 500 }}>Keyboard shortcuts</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <HelpIcon className="h-5 w-5" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 500 }}>Help & Support</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem sx={{ color: 'error.main' }} onClick={() => logout()}>
            <ListItemIcon>
              <LogoutIcon className="h-5 w-5" style={{ color: theme.palette.error.main }} />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ fontWeight: 600 }}>Sign out</ListItemText>
          </MenuItem>
        </Menu>

        {/* Apps Menu */}
        <Menu
          anchorEl={appsAnchorEl}
          open={Boolean(appsAnchorEl)}
          onClose={handleClose}
          onClick={handleClose}
          PaperProps={{
            elevation: 3,
            sx: { width: 320, mt: 1.5, p: 1 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Typography variant="overline" sx={{ px: 1, color: 'text.secondary' }}>
            Whisperr Ecosystem
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 0.5,
              mt: 1,
            }}
          >
            {ECOSYSTEM_APPS.map((app) => (
              <Box
                key={app.name}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  borderRadius: 2,
                  cursor: 'pointer',
                  backgroundColor: app.active
                    ? alpha(theme.palette.primary.main, 0.1)
                    : 'transparent',
                  border: app.active
                    ? `1px solid ${theme.palette.primary.main}`
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: alpha(app.color, 0.15),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    mb: 0.5,
                  }}
                >
                  {app.icon}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: app.active ? 600 : 400,
                    textAlign: 'center',
                  }}
                >
                  {app.shortName}
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
            elevation: 3,
            sx: { width: 360, mt: 1.5 },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Notifications
            </Typography>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer' }}
            >
              Mark all read
            </Typography>
          </Box>
          <Divider />
          {[
            {
              title: 'Task due soon',
              message: '"Fix login bug" is due today',
              time: '5m ago',
              unread: true,
            },
            {
              title: 'Comment added',
              message: 'Sarah commented on "Design dashboard"',
              time: '1h ago',
              unread: true,
            },
            {
              title: 'Task completed',
              message: 'You completed "Set up CI/CD pipeline"',
              time: '2h ago',
              unread: true,
            },
          ].map((notif, index) => (
            <MenuItem
              key={index}
              sx={{
                py: 1.5,
                backgroundColor: notif.unread
                  ? alpha(theme.palette.primary.main, 0.05)
                  : 'transparent',
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={500}>
                  {notif.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {notif.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notif.time}
                </Typography>
              </Box>
            </MenuItem>
          ))}
          <Divider />
          <MenuItem sx={{ justifyContent: 'center' }}>
            <Typography color="primary" variant="body2">
              View all notifications
            </Typography>
          </MenuItem>
        </Menu>
      </Toolbar>
      <AICommandModal open={aiModalOpen} onClose={() => setAiModalOpen(false)} />
    </MuiAppBar>
  );
}
