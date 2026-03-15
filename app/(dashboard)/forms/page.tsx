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
    Tabs,
    Tab,
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
    AutoAwesome as TemplateIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { FormsService } from '@/lib/services/forms';
import { DraftsService, FormDraft } from '@/lib/services/drafts';
import { Forms } from '@/generated/appwrite/types';
import Link from 'next/link';
import FormDialog from '@/components/forms/FormDialog';
import { useAuth } from '@/context/auth/AuthContext';

export default function FormsDashboard() {
    const { user } = useAuth();
    const [forms, setForms] = useState<Forms[]>([]);
    const [offlineDrafts, setOfflineDrafts] = useState<FormDraft[]>([]);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<Forms | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<FormDraft | null>(null);

    const fetchForms = async (showLoading = true) => {
        if (!user) return;
        if (showLoading) setLoading(true);
        try {
            const response = await FormsService.listUserForms(user.$id); 
            
            // Deduplicate by ID to prevent blinking
            const uniqueForms = response.rows.filter((form, index, self) =>
                index === self.findIndex((f) => f.$id === form.$id)
            );
            
            setForms(uniqueForms);

            // Load offline drafts
            const manifest = DraftsService.getManifest();
            const draftList: FormDraft[] = [];
            Object.keys(manifest).forEach(id => {
                const d = DraftsService.getDraft(id);
                if (d) draftList.push(d);
            });
            setOfflineDrafts(draftList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));

        } catch (err) {
            console.error("Failed to fetch forms", err);
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    const handleCreate = () => {
        setSelectedForm(null);
        setSelectedDraft(null);
        setDialogOpen(true);
    };

    const handleEdit = (form: Forms) => {
        setSelectedForm(form);
        setSelectedDraft(null);
        setDialogOpen(true);
    };

    const handleEditDraft = (draft: FormDraft) => {
        // If the draft corresponds to an existing form, load that form too
        const existingForm = forms.find(f => f.$id === draft.id);
        setSelectedForm(existingForm || null);
        setSelectedDraft(draft);
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

    const handleDeleteDraft = (id: string) => {
        if (confirm('Delete this local draft?')) {
            DraftsService.clearDraft(id);
            fetchForms(false);
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

    const filteredForms = forms; // Active forms (published/draft on server)

    return (
        <Box sx={{ animation: 'fadeIn 0.4s ease-out', p: { xs: 2, md: 4 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h3" sx={{ fontWeight: 900, mb: 1, letterSpacing: '-0.04em', fontFamily: 'var(--font-clash)' }}>
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
                    sx={{ borderRadius: 2, px: 3, fontWeight: 800, bgcolor: 'var(--color-primary)', color: 'black', '&:hover': { bgcolor: alpha('#6366F1', 0.9) } }}
                >
                    Create Form
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'rgba(255,255,255,0.05)', mb: 4 }}>
                <Tabs 
                    value={tabValue} 
                    onChange={(_, v) => setTabValue(v)}
                    sx={{
                        '& .MuiTab-root': { fontWeight: 800, fontSize: '0.85rem', color: 'text.secondary', px: 3 },
                        '& .Mui-selected': { color: 'var(--color-primary) !important' },
                        '& .MuiTabs-indicator': { bgcolor: 'var(--color-primary)', height: 3, borderRadius: '3px 3px 0 0' }
                    }}
                >
                    <Tab label="Active Forms" icon={<FormIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                    <Tab label="Templates" icon={<TemplateIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                    <Tab 
                        label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Drafts
                                {offlineDrafts.length > 0 && (
                                    <Box sx={{ bgcolor: '#FFB020', color: 'black', borderRadius: '50%', width: 18, height: 18, fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {offlineDrafts.length}
                                    </Box>
                                )}
                            </Box>
                        } 
                        icon={<HistoryIcon sx={{ fontSize: 18 }} />} 
                        iconPosition="start" 
                    />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress size={32} />
                </Box>
            ) : (
                <Box>
                    {/* ACTIVE FORMS TAB */}
                    {tabValue === 0 && (
                        <>
                            {filteredForms.length === 0 ? (
                                <Paper sx={{ py: 12, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 4 }}>
                                    <FormIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                                    <Typography variant="h6" sx={{ opacity: 0.6, mb: 4 }}>No active forms.</Typography>
                                    <Button variant="outlined" startIcon={<AddIcon />} onClick={handleCreate}>Start Building</Button>
                                </Paper>
                            ) : (
                                <Grid container spacing={3}>
                                    {filteredForms.map((form) => (
                                        <Grid item xs={12} md={6} lg={4} key={form.$id}>
                                            <Fade in={true}>
                                                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: 3 }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Chip label={form.status.toUpperCase()} size="small" sx={{ fontSize: '10px', fontWeight: 900, color: getStatusColor(form.status), border: `1px solid ${getStatusColor(form.status)}20`, bgcolor: 'transparent' }} />
                                                                {DraftsService.hasDraft(form.$id) && (
                                                                    <Chip label="UNSYNCED DRAFT" size="small" sx={{ fontSize: '10px', fontWeight: 900, bgcolor: alpha('#FFB020', 0.1), color: '#FFB020', border: '1px solid rgba(255, 176, 32, 0.2)' }} />
                                                                )}
                                                            </Stack>
                                                            <IconButton size="small" sx={{ opacity: 0.4 }}><MoreIcon /></IconButton>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#F2F2F2' }}>{form.title}</Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4, minHeight: '3em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                            {form.description || 'No description provided.'}
                                                        </Typography>
                                                        <Divider sx={{ opacity: 0.05, mb: 3 }} />
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Tooltip title="View Submissions"><IconButton component={Link} href={`/forms/${form.$id}`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}><ViewIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                                            <Tooltip title="Edit Design"><IconButton onClick={() => handleEdit(form)} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}><EditIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                                            {form.status === 'published' && (
                                                                <Tooltip title="Open Public Link"><IconButton size="small" component={Link} href={`/form/${form.$id}`} target="_blank" sx={{ bgcolor: 'rgba(16, 185, 129, 0.05)', color: '#10B981' }}><LaunchIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                                                            )}
                                                            <Box sx={{ flexGrow: 1 }} />
                                                            <IconButton size="small" onClick={() => handleDelete(form.$id)} sx={{ color: '#D14343', opacity: 0.6 }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </>
                    )}

                    {/* TEMPLATES TAB */}
                    {tabValue === 1 && (
                        <Paper sx={{ py: 12, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 4 }}>
                            <TemplateIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                            <Typography variant="h6" sx={{ opacity: 0.6 }}>Templates coming soon.</Typography>
                        </Paper>
                    )}

                    {/* OFFLINE DRAFTS TAB */}
                    {tabValue === 2 && (
                        <>
                            {offlineDrafts.length === 0 ? (
                                <Paper sx={{ py: 12, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.01)', border: '1px dashed rgba(255, 255, 255, 0.1)', borderRadius: 4 }}>
                                    <HistoryIcon sx={{ fontSize: 64, opacity: 0.1, mb: 2 }} />
                                    <Typography variant="h6" sx={{ opacity: 0.6 }}>No offline drafts found.</Typography>
                                </Paper>
                            ) : (
                                <Grid container spacing={3}>
                                    {offlineDrafts.map((draft) => (
                                        <Grid item xs={12} md={6} lg={4} key={draft.id}>
                                            <Fade in={true}>
                                                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 176, 32, 0.1)', borderRadius: 3 }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                            <Chip label="LOCAL DRAFT" size="small" sx={{ fontSize: '10px', fontWeight: 900, bgcolor: alpha('#FFB020', 0.1), color: '#FFB020', border: '1px solid rgba(255, 176, 32, 0.2)' }} />
                                                            <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'var(--font-mono)' }}>
                                                                {new Date(draft.updatedAt).toLocaleTimeString()}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#F2F2F2' }}>{draft.title || 'Untitled Portal'}</Typography>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
                                                            Last saved locally. Sync required to publish.
                                                        </Typography>
                                                        <Divider sx={{ opacity: 0.05, mb: 3 }} />
                                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                                            <Button 
                                                                size="small" 
                                                                variant="outlined" 
                                                                startIcon={<EditIcon />} 
                                                                onClick={() => handleEditDraft(draft)}
                                                                sx={{ borderRadius: 1.5, fontWeight: 800, borderColor: 'rgba(255,255,255,0.1)' }}
                                                            >
                                                                Resume
                                                            </Button>
                                                            <Box sx={{ flexGrow: 1 }} />
                                                            <IconButton size="small" onClick={() => handleDeleteDraft(draft.id)} sx={{ color: '#D14343', opacity: 0.6 }}><DeleteIcon sx={{ fontSize: 18 }} /></IconButton>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Fade>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </>
                    )}
                </Box>
            )}

            <FormDialog 
                open={dialogOpen} 
                onClose={() => setDialogOpen(false)} 
                form={selectedForm}
                initialDraft={selectedDraft || undefined}
                onSaved={() => fetchForms(false)} 
            />
        </Box>
    );
}
