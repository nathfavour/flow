"use client";

import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, Typography, alpha, Avatar } from '@mui/material';
import { Send as SendIcon, Description as NoteIcon, Shield as ShieldIcon } from '@mui/icons-material';

const QuickNote = () => {
    const [note, setNote] = useState('');
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#00F5FF', 0.1), color: '#00F5FF' }}><NoteIcon sx={{ fontSize: 20 }} /></Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>Quick Note</Typography>
            </Box>
            <TextField fullWidth multiline rows={2} placeholder="Jot summary..." value={note} onChange={(e) => setNote(e.target.value)} variant="standard" InputProps={{ disableUnderline: true, sx: { color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.8125rem' } }} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}><IconButton size="small" sx={{ color: '#00F5FF' }}><SendIcon sx={{ fontSize: 16 }} /></IconButton></Box>
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

const VaultStatus = () => {
    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '10px', bgcolor: alpha('#F59E0B', 0.1), color: '#F59E0B' }}><ShieldIcon sx={{ fontSize: 20 }} /></Box>
                <Typography sx={{ fontWeight: 800, fontSize: '0.875rem', color: 'white' }}>Vault Secure</Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: 'rgba(16, 185, 129, 0.8)', fontWeight: 800 }}>✓ LOCKED & MONITORED</Typography>
        </Paper>
    );
};

import { FocusStatus } from '../contributions/FocusStatus';
import { Grid } from '@mui/material';

export const EcosystemWidgets = () => {
    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="overline" sx={{ color: 'rgba(255, 255, 255, 0.3)', fontWeight: 900, letterSpacing: '0.2em', mb: 2, display: 'block' }}>Ecosystem Command Center</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} md={6}><QuickNote /></Grid>
                <Grid item xs={12} md={6}><MiniChat /></Grid>
                <Grid item xs={12} md={6}><VaultStatus /></Grid>
                <Grid item xs={12} md={6}><FocusStatus /></Grid>
            </Grid>
        </Box>
    );
};
