"use client";

import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, alpha, Avatar } from '@mui/material';
import { Send as SendIcon, Description as NoteIcon, Shield as ShieldIcon } from '@mui/icons-material';

const QuickNote = () => {
    const [note, setNote] = useState('');
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#6366F1', 0.1), color: '#6366F1' }}><NoteIcon sx={{ fontSize: 20 }} /></Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>Quick Note</Typography>
            </Box>
            <TextField fullWidth multiline rows={2} placeholder="Jot summary..." value={note} onChange={(_e) => setNote(_e.target.value)} variant="standard" InputProps={{ disableUnderline: true, sx: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem' } }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}><IconButton size="small" sx={{ color: '#6366F1' }}><SendIcon sx={{ fontSize: 16 }} /></IconButton></Box>
        </Paper>
    );
};

const MiniChat = () => {
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: '#7c3aed', fontSize: '0.75rem', fontWeight: 800 }}>AR</Avatar>
                <Box><Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>Alex Rivera</Typography><Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)' }}>Active in Flow</Typography></Box>
            </Box>
            <TextField fullWidth placeholder="Message..." variant="standard" InputProps={{ disableUnderline: true, sx: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem', bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', px: 1 } }} />
        </Paper>
    );
};

import { ecosystemSecurity } from '@/lib/ecosystem/security';
import { AppwriteService } from '@/lib/appwrite/client';
import { useAuth } from '@/context/auth/AuthContext';
import SudoModal from '@/components/common/SudoModal';
import { useEffect } from 'react';

const VaultStatus = () => {
    const { user } = useAuth();
    const [isInitialized, setIsInitialized] = React.useState<boolean | null>(null);
    const [isLocked, setIsLocked] = React.useState(true);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [sudoIntent, setSudoIntent] = React.useState<"unlock" | "initialize" | "reset">("unlock");

    useEffect(() => {
        if (user?.$id) {
            AppwriteService.hasMasterpass(user.$id).then(setIsInitialized);
        }
    }, [user?.$id]);

    useEffect(() => {
        setIsLocked(!ecosystemSecurity.status.isUnlocked);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ecosystemSecurity.status.isUnlocked]);

    const handleAction = () => {
        if (isInitialized === false) {
            setSudoIntent("initialize");
        } else {
            setSudoIntent("unlock");
        }
        setIsModalOpen(true);
    };

    if (isInitialized === null) return null;

    return (
        <>
            <Paper 
                elevation={0} 
                onClick={handleAction}
                sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    bgcolor: 'rgba(255, 255, 255, 0.03)', 
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' }
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}><ShieldIcon sx={{ fontSize: 20 }} /></Box>
                        <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>
                            {isInitialized === false ? 'Setup Vault' : (isLocked ? 'Vault Locked' : 'Vault Active')}
                        </Typography>
                    </Box>
                    <Typography sx={{ 
                        fontSize: '0.625rem', 
                        color: isInitialized === false ? '#F59E0B' : (isLocked ? '#ef4444' : '#10b981'), 
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        {isInitialized === false ? 'Action Required' : (isLocked ? 'LOCKED' : 'SECURE')}
                    </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', fontWeight: 600 }}>
                    {isInitialized === false ? 'Initialize MasterPass to secure your Flow' : (isLocked ? 'Tap to unlock your ecosystem security' : 'Identity verified & monitoring active')}
                </Typography>
            </Paper>

            <SudoModal 
                isOpen={isModalOpen}
                intent={sudoIntent}
                onSuccess={() => {
                    setIsModalOpen(false);
                    if (user?.$id) AppwriteService.hasMasterpass(user.$id).then(setIsInitialized);
                }}
                onCancel={() => setIsModalOpen(false)}
            />
        </>
    );
};

import { FocusStatus } from '../contributions/FocusStatus';
import { Grid } from '@mui/material';

export const EcosystemWidgets = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 900, letterSpacing: '0.2em', mb: 2, display: 'block' }}>Ecosystem Command Center</Typography>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}><QuickNote /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><MiniChat /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><VaultStatus /></Grid>
                <Grid size={{ xs: 12, md: 6 }}><FocusStatus /></Grid>
            </Grid>
        </Box>
    );
};
