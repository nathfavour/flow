'use client';

import React, { useEffect, useState } from 'react';
import { 
    Box, 
    Typography, 
    Button, 
    Grid, 
    Card, 
    CardContent, 
    Chip, 
    IconButton, 
    Tooltip,
    CircularProgress,
    Fade,
    Paper,
    Divider,
    Stack,
    alpha
} from '@mui/material';
import { 
    Add as AddIcon, 
    Edit as EditIcon, 
    Delete as DeleteIcon, 
    Launch as LaunchIcon,
    Assignment as FormIcon,
    Visibility as ViewIcon,
    MoreVert as MoreIcon,
    Share as ShareIcon,
    Public as PublicIcon,
    Drafts as DraftIcon
} from '@mui/icons-material';
import { FormsService } from '@/lib/services/forms';
import { DraftsService } from '@/lib/services/drafts';
import { Forms } from '@/generated/appwrite/types';
import Link from 'next/link';
import FormDialog from '@/components/forms/FormDialog';
import { useAuth } from '@/context/auth/AuthContext';

export default function FormsDashboard() {
    const { user } = useAuth();
    const [forms, setForms] = useState<Forms[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<Forms | null>(null);

    const fetchForms = async (showLoading = true) => {
        if (!user) return;
        if (showLoading) setLoading(true);
        try {
            const response = await FormsService.listUserForms(user.$id); 
            
            // Critical: Ensure no local drafts conflict with newly fetched data
            // If a draft exists, we keep it as 'UNSYNCED' but ensure the UI sees the base form
            setForms([...response.rows]);
        } catch (err) {
            console.error("Failed to fetch forms", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedForm(null);
        setDialogOpen(true);
    };

    const handleEdit = (form: Forms) => {
        setSelectedForm(form);
        setDialogOpen(true);
    };

    const handleDelete = async (formId: string) => {
        if (confirm('Are you sure you want to delete this form? All submissions will be lost.')) {
            try {
                await FormsService.deleteForm(formId);
                fetchForms(false);
            } catch (err) {
                console.error("Failed to delete form", err);
            }
        }
    };

    useEffect(() => {
        if (user) {
            fetchForms();
        }
    }, [user]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return '#10B981';
            case 'draft': return '#FFB020';
            case 'archived': return '#D14343';
            default: return 'text.secondary';
        }
    };

    return (
        <Box sx={{ animation: 'fadeIn 0.4s ease-out', p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.04em' }}>
                        Forms
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Design data collection workflows for the ecosystem.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 800, boxShadow: '0 8px 20px rgba(16, 185, 129, 0.2)' }}
                >
                    Create Form
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : forms.length === 0 ? (
                <Paper 
                    sx={{ 
                        py: 12, 
                        textAlign: 'center', 
                        bgcolor: 'rgba(255, 255, 255, 0.01)', 
                        border: '1px dashed rgba(255, 255, 255, 0.1)',
                        borderRadius: 4
                    }}
                >
                    <FormIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                    <Typography variant="h6" sx={{ opacity: 0.6, mb: 4 }}>No forms created yet.</Typography>
                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>Start Building</Button>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {forms.map((form) => (
                        <Grid item xs={12} md={6} lg={4} key={form.$id}>
                            <Fade in={true}>
                                <Card 
                                    sx={{ 
                                        bgcolor: 'rgba(255, 255, 255, 0.02)', 
                                        border: '1px solid rgba(255, 255, 255, 0.05)',
                                        borderRadius: 3,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                                            transform: 'translateY(-4px)',
                                            borderColor: 'rgba(16, 185, 129, 0.2)'
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Chip 
                                                    label={form.status.toUpperCase()} 
                                                    size="small" 
                                                    sx={{ 
                                                        fontSize: '10px', 
                                                        fontWeight: 900, 
                                                        bgcolor: 'transparent',
                                                        color: getStatusColor(form.status),
                                                        border: `1px solid ${getStatusColor(form.status)}20`
                                                    }} 
                                                />
                                                {DraftsService.hasDraft(form.$id) && (
                                                    <Chip 
                                                        label="UNSYNCED" 
                                                        size="small" 
                                                        sx={{ 
                                                            fontSize: '10px', 
                                                            fontWeight: 900, 
                                                            bgcolor: alpha('#FFB020', 0.1), 
                                                            color: '#FFB020',
                                                            border: '1px solid rgba(255, 176, 32, 0.2)'
                                                        }} 
                                                    />
                                                )}
                                            </Stack>
                                            <IconButton size="small" sx={{ opacity: 0.4 }}><MoreIcon /></IconButton>
                                        </Box>
                                        
                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#F2F2F2' }}>
                                            {form.title}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, minHeight: '3em', lineClamp: 2, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                            {form.description || 'No description provided.'}
                                        </Typography>

                                        <Divider sx={{ opacity: 0.05, mb: 3 }} />

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Submissions">
                                                <IconButton component={Link} href={`/forms/${form.$id}`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                                                    <ViewIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Design">
                                                <IconButton component={Link} href={`/forms/${form.$id}`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                                                    <EditIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            {form.status === 'published' && (
                                                <Tooltip title="Open Public Link">
                                                    <IconButton 
                                                        size="small" 
                                                        component={Link} 
                                                        href={`/form/${form.$id}`}
                                                        target="_blank"
                                                        sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', color: '#10B981' }}
                                                    >
                                                        <LaunchIcon sx={{ fontSize: 18 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                            <Box sx={{ flexGrow: 1 }} />
                                            <Tooltip title="Delete">
                                                <IconButton size="small" onClick={() => handleDelete(form.$id)} sx={{ color: '#D14343', opacity: 0.6 }}>
                                                    <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Fade>
                        </Grid>
                    ))}
                </Grid>
            )}

            <FormDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                form={selectedForm} 
                onSaved={() => fetchForms(false)} 
            />
        </Box>
    );
}
