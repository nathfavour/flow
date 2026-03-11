'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Paper,
    Stack,
    Switch,
    Divider,
    CircularProgress,
    alpha,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Tooltip
} from '@mui/material';
import {
    PersonOutline as UserIcon,
    Edit as EditIcon,
    Check as CheckIcon,
    Close as CloseIcon,
    ShieldOutlined as ShieldIcon
} from '@mui/icons-material';
import { UsersService } from '@/lib/services/users';
import { useAuth } from '@/context/auth/AuthContext';
import { ecosystemSecurity } from '@/lib/ecosystem/security';
import toast from 'react-hot-toast';

export const DiscoverabilitySettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [username, setUsername] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const loadProfile = React.useCallback(async () => {
        try {
            const p = await UsersService.getProfileById(user!.$id);
            setProfile(p);
            if (p) {
                setUsername(p.username);
                setNewUsername(p.username);
            }
        } catch (_e) {
            console.error("Failed to load profile", _e);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user?.$id) {
            loadProfile();
        }
    }, [user, loadProfile]);

    useEffect(() => {
        const check = async () => {
            const normalized = newUsername.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');
            if (!normalized || normalized === username || normalized.length < 3) {
                setIsAvailable(null);
                return;
            }

            setCheckingAvailability(true);
            try {
                const available = await UsersService.isUsernameAvailable(normalized);
                setIsAvailable(available);
            } catch (e) {
                console.error("Check failed", e);
                setIsAvailable(null);
            } finally {
                setCheckingAvailability(false);
            }
        };

        const timeoutId = setTimeout(check, 500);
        return () => clearTimeout(timeoutId);
    }, [newUsername, username]);

    const handleToggleDiscoverability = async (checked: boolean) => {
        if (!user?.$id) return;

        if (!profile) {
            setIsEditing(true);
            toast.error("Set a handle first to enable discovery");
            return;
        }

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
        } catch (_e) {
            toast.error("Failed to update preference");
        } finally {
            setSaving(false);
        }
    };

    const handleSaveUsername = async () => {
        if (!user?.$id || !newUsername) return;
        const normalized = newUsername.toLowerCase().trim().replace(/^@/, '').replace(/[^a-z0-9_]/g, '');

        if (normalized.length < 3) {
            toast.error("Username must be at least 3 characters");
            return;
        }

        setSaving(true);
        try {
            let publicKeyStr: string | undefined = undefined;

            if (profile) {
                await UsersService.updateProfile(user.$id, { username: normalized, publicKey: publicKeyStr });
                setUsername(normalized);
                setProfile({ ...profile, username: normalized, publicKey: publicKeyStr });
                toast.success("Handle updated");
            } else {
                // Creation with intelligent defaults
                const p = await UsersService.createProfile(user.$id, normalized, {
                    displayName: user.name || normalized,
                    appsActive: ['flow'],
                    publicKey: publicKeyStr
                });
                setProfile(p);
                setUsername(normalized);
                toast.success("Identity initialized!");
            }
            setIsEditing(false);
            setShowConfirm(false);
        } catch (e: any) {
            toast.error(e.message || "Failed to save handle");
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

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ flex: 1 }}>
                            {isEditing ? (
                                <Box>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        variant="standard"
                                        value={newUsername}
                                        onChange={(e) => setNewUsername(e.target.value)}
                                        placeholder="Your handle"
                                        autoFocus
                                        inputProps={{
                                            style: {
                                                fontFamily: 'JetBrains Mono, monospace',
                                                fontWeight: 700,
                                                fontSize: '1.1rem',
                                                color: 'white'
                                            }
                                        }}
                                        InputProps={{
                                            disableUnderline: true,
                                            startAdornment: <Typography sx={{ color: '#00F0FF', fontWeight: 800, mr: 0.5 }}>@</Typography>,
                                            endAdornment: (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {checkingAvailability && <CircularProgress size={14} sx={{ color: '#00F0FF' }} />}
                                                    {!checkingAvailability && isAvailable === true && <CheckIcon fontSize="small" sx={{ color: '#00F0FF' }} />}
                                                    {!checkingAvailability && isAvailable === false && <CloseIcon fontSize="small" sx={{ color: '#FF5252' }} />}
                                                </Box>
                                            ),
                                        }}
                                    />
                                    {isAvailable === false && (
                                        <Typography variant="caption" sx={{ color: '#FF5252', fontWeight: 600, mt: 0.5, display: 'block' }}>
                                            already taken
                                        </Typography>
                                    )}
                                </Box>
                            ) : (
                                <>
                                    <Typography sx={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        fontWeight: 700,
                                        fontSize: '1.1rem',
                                        opacity: (isDiscoverable || !profile) ? 1 : 0.4,
                                        color: !profile ? '#E2B714' : 'inherit'
                                    }}>
                                        @{username || 'not_set'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.4, display: 'block', mt: 0.5 }}>
                                        {!profile ? 'Identity not set' : 'Universal Identity • Ecosystem Handle'}
                                    </Typography>
                                </>
                            )}
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                            {isEditing ? (
                                <>
                                    <Tooltip title="Cancel">
                                        <IconButton size="small" onClick={() => { setIsEditing(false); setNewUsername(username); setIsAvailable(null); }} sx={{ color: 'error.main' }}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Save">
                                        <IconButton 
                                            size="small" 
                                            onClick={() => setShowConfirm(true)} 
                                            sx={{ color: '#00F0FF' }} 
                                            disabled={saving || !newUsername || isAvailable === false || checkingAvailability || (newUsername === username && !!profile)}
                                        >
                                            <CheckIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            ) : (
                                <Tooltip title={profile ? "Change Handle" : "Setup Identity"}>
                                    <IconButton
                                        size="small"
                                        onClick={() => setIsEditing(true)}
                                        sx={{
                                            color: '#00F0FF',
                                            bgcolor: !profile ? alpha('#00F0FF', 0.1) : 'transparent',
                                            '&:hover': { bgcolor: alpha('#00F0FF', 0.15) }
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}

                            {isDiscoverable && !isEditing && (
                                <Box sx={{
                                    ml: 'auto',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: '8px',
                                    bgcolor: alpha('#00F0FF', 0.1),
                                    border: '1px solid',
                                    borderColor: alpha('#00F0FF', 0.2),
                                    display: 'flex',
                                    alignItems: 'center'
                                }}>
                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 900, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Discoverable
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>
                    <Typography variant="caption" sx={{ mt: 1.5, display: 'block', opacity: 0.4, fontStyle: 'italic' }}>
                        This handle is shared across the entire Kylrix ecosystem.
                    </Typography>
                </Stack>
            </Paper>

            {/* Confirmation Dialog */}
            <Dialog
                open={showConfirm}
                onClose={() => setShowConfirm(false)}
                PaperProps={{
                    sx: {
                        borderRadius: '24px',
                        bgcolor: 'rgba(15, 15, 15, 0.95)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        maxWidth: '400px',
                        width: '100%'
                    }
                }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
                    <ShieldIcon sx={{ color: '#00F0FF' }} />
                    Update Discovery Identity
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ opacity: 0.7, color: 'white', mb: 3 }}>
                        Changes to your universal handle will sync across Kylrix Connect, Note, and Vault instances.
                    </Typography>
                    <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px dotted rgba(255, 255, 255, 0.2)' }}>
                        <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mb: 0.5 }}>NEW HANDLE</Typography>
                        <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: '#00F0FF' }}>@{newUsername.toLowerCase().trim()}</Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, pt: 0 }}>
                    <Button onClick={() => setShowConfirm(false)} sx={{ color: 'white', opacity: 0.6 }}>Cancel</Button>
                    <Button
                        onClick={handleSaveUsername}
                        variant="contained"
                        disabled={saving}
                        sx={{
                            borderRadius: '12px',
                            bgcolor: '#00F0FF',
                            color: '#000',
                            fontWeight: 700,
                            px: 3,
                            '&:hover': { bgcolor: alpha('#00F0FF', 0.8) }
                        }}
                    >
                        {saving ? <CircularProgress size={20} color="inherit" /> : "Confirm Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};
