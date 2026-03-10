'use client';

import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Stack, 
    Switch, 
    Divider,
    CircularProgress,
    alpha
} from '@mui/material';
import { 
    PersonOutline as UserIcon, 
    SearchOutlined as SearchIcon 
} from '@mui/icons-material';
import { UsersService } from '@/lib/services/users';
import { useAuth } from '@/context/auth/AuthContext';
import toast from 'react-hot-toast';

export const DiscoverabilitySettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (user?.$id) {
            loadProfile();
        }
    }, [user]);

    const loadProfile = async () => {
        try {
            const p = await UsersService.getProfileById(user!.$id);
            setProfile(p);
            if (p) setUsername(p.username);
        } catch (e) {
            console.error("Failed to load profile", e);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDiscoverability = async (checked: boolean) => {
        if (!user?.$id || !profile) return;
        
        setSaving(true);
        try {
            const currentApps = profile.appsActive || [];
            let appsActive;
            if (checked) {
                appsActive = Array.from(new Set([...currentApps, 'flow']));
            } else {
                appsActive = currentApps.filter((a: string) => a !== 'flow');
            }
            
            await UsersService.updateProfile(user.$id, { appsActive });
            setProfile({ ...profile, appsActive });
            toast.success(checked ? "You are now discoverable in Flow" : "Discovery disabled for Flow");
        } catch (e) {
            toast.error("Failed to update preference");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={24} sx={{ color: '#00F0FF' }} />
        </Box>
    );

    const isDiscoverable = profile?.appsActive?.includes('flow');

    return (
        <Box>
            <Typography variant="overline" sx={{ fontWeight: 800, color: '#00F0FF', mb: 2, display: 'block', letterSpacing: '0.1em' }}>
                DISCOVERABILITY
            </Typography>
            <Paper sx={{ 
                p: 4, 
                borderRadius: '24px', 
                bgcolor: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundImage: 'none'
            }}>
                <Stack spacing={4}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>Public Discovery</Typography>
                            <Typography variant="body2" sx={{ opacity: 0.6 }}>Allow others to find you for task sharing and event invites</Typography>
                        </Box>
                        <Switch 
                            checked={!!isDiscoverable} 
                            onChange={(e) => handleToggleDiscoverability(e.target.checked)}
                            disabled={saving}
                            sx={{
                                '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#00F0FF',
                                },
                                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#00F0FF',
                                },
                            }}
                        />
                    </Box>

                    <Divider sx={{ opacity: 0.05 }} />

                    <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, opacity: 0.7 }}>
                            Your Universal Handle
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            p: 2.5,
                            borderRadius: '16px',
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}>
                            <UserIcon sx={{ color: isDiscoverable ? "#00F0FF" : "rgba(255, 255, 255, 0.2)" }} />
                            <Typography sx={{ 
                                fontFamily: 'JetBrains Mono, monospace', 
                                fontWeight: 700,
                                fontSize: '1.1rem',
                                opacity: isDiscoverable ? 1 : 0.4
                            }}>
                                @{username || 'not_set'}
                            </Typography>
                            {isDiscoverable && (
                                <Box sx={{ 
                                    ml: 'auto', 
                                    px: 1.5, 
                                    py: 0.5, 
                                    borderRadius: '8px', 
                                    bgcolor: alpha('#00F0FF', 0.1),
                                    border: '1px solid',
                                    borderColor: alpha('#00F0FF', 0.2)
                                }}>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Discoverable
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        <Typography variant="caption" sx={{ mt: 1.5, display: 'block', opacity: 0.4, fontStyle: 'italic' }}>
                            Handle changes must be made through the Accounts portal.
                        </Typography>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};
