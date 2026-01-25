'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  CircularProgress,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  VpnKey as SecretIcon,
} from '@mui/icons-material';
import { secrets as secretsApi } from '@/lib/whisperrflow';

interface Secret {
  $id: string;
  name: string;
  username: string;
}

interface SecretSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (secretId: string) => void;
}

export function SecretSelectorModal({ isOpen, onClose, onSelect }: SecretSelectorModalProps) {
  const theme = useTheme();
  const [secrets, setSecrets] = useState<Secret[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen) {
      const fetchSecrets = async () => {
        setLoading(true);
        try {
          const res = await secretsApi.list();
          setSecrets(res.documents as any[]);
        } catch (err) {
          console.error('Failed to fetch secrets:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchSecrets();
    }
  }, [isOpen]);

  const filtered = secrets.filter(s => 
    (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.username || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          backgroundImage: 'none',
          backgroundColor: '#050505',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '-0.02em', color: '#FFD700' }}>
            ATTACH SECRET
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: '0.05em' }}>
            SELECT CREDENTIAL FROM WHISPERRKEEP
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.disabled', '&:hover': { color: '#F2F2F2' } }}>
          <CloseIcon sx={{ fontSize: 20 }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        <Box sx={{ minHeight: '300px', maxHeight: '500px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search credentials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            variant="filled"
            InputProps={{
              disableUnderline: true,
              sx: { borderRadius: 2, bgcolor: 'rgba(255, 255, 255, 0.03)' },
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <CircularProgress size={32} sx={{ color: '#FFD700' }} />
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, opacity: 0.3 }}>
              <SecretIcon sx={{ fontSize: 48, mb: 1 }} />
              <Typography variant="body2">No secrets found</Typography>
            </Box>
          ) : (
            <List sx={{ flex: 1, overflowY: 'auto' }}>
              {filtered.map((item) => (
                <ListItemButton
                  key={item.$id}
                  onClick={() => onSelect(item.$id)}
                  sx={{
                    borderRadius: 2,
                    mb: 1,
                    border: '1px solid rgba(255, 255, 255, 0.03)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 215, 0, 0.05)',
                      borderColor: 'rgba(255, 215, 0, 0.2)',
                    }
                  }}
                >
                  <ListItemText 
                    primary={item.name} 
                    secondary={item.username}
                    primaryTypographyProps={{ 
                      fontSize: '0.9rem', 
                      fontWeight: 700,
                      color: '#F2F2F2'
                    }} 
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      color: 'text.secondary'
                    }}
                  />
                </ListItemButton>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
