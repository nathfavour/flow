'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  MenuItem,
  Divider,
  Stack,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Paper,
  alpha,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragHandle as DragIcon,
  Close as CloseIcon,
  List as ListIcon,
  RadioButtonChecked as RadioIcon,
  CheckBox as CheckIcon,
  Abc as TextIcon,
  Notes as TextAreaIcon,
  AlternateEmail as EmailIcon,
  Numbers as NumberIcon,
} from '@mui/icons-material';
import { FormsService } from '@/lib/services/forms';
import { Forms } from '@/generated/appwrite/types';

interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  form?: Forms | null;
  onSaved: () => void;
}

const FIELD_TYPES = [
  { value: 'text', label: 'Short Text', icon: <TextIcon fontSize="small" /> },
  { value: 'textarea', label: 'Long Text', icon: <TextAreaIcon fontSize="small" /> },
  { value: 'email', label: 'Email', icon: <EmailIcon fontSize="small" /> },
  { value: 'number', label: 'Number', icon: <NumberIcon fontSize="small" /> },
  { value: 'select', label: 'Dropdown', icon: <ListIcon fontSize="small" /> },
  { value: 'radio', label: 'Single Choice (Radio)', icon: <RadioIcon fontSize="small" /> },
  { value: 'checkbox', label: 'Multiple Choice (Checkbox)', icon: <CheckIcon fontSize="small" /> },
];

export default function FormDialog({ open, onClose, form, onSaved }: FormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft');
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    if (form) {
      setTitle(form.title);
      setDescription(form.description || '');
      setStatus(form.status as any);
      try {
        setFields(JSON.parse(form.schema || '[]'));
      } catch (e) {
        setFields([]);
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('draft');
      setFields([{ id: 'field_1', label: 'Full Name', type: 'text', required: true }]);
    }
  }, [form, open]);

  const addField = () => {
    const id = `field_${Date.now()}`;
    setFields([...fields, { 
      id, 
      label: 'New Question', 
      type: 'text', 
      required: false,
      options: ['Option 1'] // Default option for choice types
    }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const addOption = (fieldIndex: number) => {
    const newFields = [...fields];
    const options = newFields[fieldIndex].options || [];
    newFields[fieldIndex].options = [...options, `Option ${options.length + 1}`];
    setFields(newFields);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const newFields = [...fields];
    newFields[fieldIndex].options[optionIndex] = value;
    setFields(newFields);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const newFields = [...fields];
    newFields[fieldIndex].options = newFields[fieldIndex].options.filter((_: any, i: number) => i !== optionIndex);
    setFields(newFields);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = {
        title,
        description,
        status,
        schema: JSON.stringify(fields),
        settings: JSON.stringify({}),
      };

      if (form) {
        await FormsService.updateForm(form.$id, formData);
      } else {
        await FormsService.createForm('current', formData);
      }
      onSaved();
      onClose();
    } catch (error) {
      console.error('Failed to save form', error);
    } finally {
      setLoading(false);
    }
  };

  const isChoiceType = (type: string) => ['select', 'radio', 'checkbox'].includes(type);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      fullWidth 
      maxWidth="md"
      scroll="paper"
      PaperProps={{
        sx: { 
          bgcolor: 'rgba(10, 10, 10, 0.9)', 
          backdropFilter: 'blur(30px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '28px',
          backgroundImage: 'none',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 4,
        pb: 2
      }}>
        <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: 'var(--font-clash)', letterSpacing: '-0.02em' }}>
            {form ? 'Refine Design' : 'Create Intelligence Portal'}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, letterSpacing: '0.1em' }}>
                KYLRIX FLOW / FORMS ENGINE
            </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' } }}>
            <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4, pt: 1 }}>
        <Stack spacing={5}>
          <Box>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Identity Label"
                variant="filled"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Nexus Registration"
                InputProps={{ disableUnderline: true, sx: { borderRadius: '16px', fontWeight: 800, fontSize: '1.1rem' } }}
              />
              <TextField
                fullWidth
                label="Mission Brief"
                variant="filled"
                multiline
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe the objective..."
                InputProps={{ disableUnderline: true, sx: { borderRadius: '16px' } }}
              />
              <FormControl fullWidth variant="filled">
                <InputLabel>Deployment Status</InputLabel>
                <Select
                  value={status}
                  label="Deployment Status"
                  onChange={(e) => setStatus(e.target.value as any)}
                  disableUnderline
                  sx={{ borderRadius: '16px' }}
                >
                  <MenuItem value="draft">DRAFT (INTERNAL)</MenuItem>
                  <MenuItem value="published">PUBLISHED (PUBLIC ACCESS)</MenuItem>
                  <MenuItem value="archived">ARCHIVED (READ-ONLY)</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Box>

          <Divider sx={{ opacity: 0.08 }} />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box sx={{ width: 4, height: 16, bgcolor: 'var(--color-primary)', borderRadius: 2 }} />
                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 900, letterSpacing: '0.15em' }}>
                        LOGIC SCHEMA
                    </Typography>
                </Box>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />} 
                onClick={addField} 
                sx={{ 
                    borderRadius: '12px', 
                    fontWeight: 800, 
                    borderColor: alpha('#6366F1', 0.2),
                    bgcolor: alpha('#6366F1', 0.03),
                    '&:hover': { borderColor: 'var(--color-primary)', bgcolor: alpha('#6366F1', 0.1) }
                }}
              >
                Insert Field
              </Button>
            </Box>

            <Stack spacing={3}>
              {fields.map((field, fIdx) => (
                <Paper 
                  key={field.id} 
                  sx={{ 
                    p: 3, 
                    bgcolor: 'rgba(255, 255, 255, 0.01)', 
                    border: '1px solid rgba(255, 255, 255, 0.04)',
                    borderRadius: '20px',
                    transition: 'border-color 0.2s ease',
                    '&:hover': { borderColor: 'rgba(255, 255, 255, 0.1)' }
                  }}
                >
                  <Stack spacing={3}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-start">
                        <Box sx={{ pt: 1, display: { xs: 'none', md: 'block' } }}>
                            <DragIcon sx={{ color: 'rgba(255,255,255,0.1)', cursor: 'grab' }} />
                        </Box>
                        
                        <Stack spacing={2} sx={{ flexGrow: 1, width: '100%' }}>
                            <TextField
                                fullWidth
                                variant="standard"
                                placeholder="Question Label"
                                value={field.label}
                                onChange={(e) => updateField(fIdx, { label: e.target.value })}
                                InputProps={{ disableUnderline: true, sx: { fontSize: '1rem', fontWeight: 800 } }}
                            />
                            
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FormControl variant="filled" size="small" sx={{ minWidth: 200 }}>
                                    <Select
                                        value={field.type}
                                        onChange={(e) => updateField(fIdx, { type: e.target.value })}
                                        disableUnderline
                                        sx={{ borderRadius: '10px', fontSize: '0.8rem', fontWeight: 700 }}
                                        renderValue={(selected) => (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                {FIELD_TYPES.find(t => t.value === selected)?.icon}
                                                {FIELD_TYPES.find(t => t.value === selected)?.label}
                                            </Box>
                                        )}
                                    >
                                        {FIELD_TYPES.map(t => (
                                        <MenuItem key={t.value} value={t.value} sx={{ fontSize: '0.85rem', gap: 1.5, py: 1.5 }}>
                                            {t.icon}
                                            {t.label}
                                        </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                
                                <FormControlLabel
                                    control={
                                        <Switch 
                                            size="small" 
                                            checked={field.required} 
                                            onChange={(e) => updateField(fIdx, { required: e.target.checked })} 
                                        />
                                    }
                                    label={<Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.6 }}>REQUIRED</Typography>}
                                />
                                
                                <Box sx={{ flexGrow: 1 }} />
                                
                                <Tooltip title="Remove Field">
                                    <IconButton size="small" sx={{ color: alpha('#ef4444', 0.5), '&:hover': { color: '#ef4444', bgcolor: alpha('#ef4444', 0.1) } }} onClick={() => removeField(fIdx)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>

                    {isChoiceType(field.type) && (
                        <Box sx={{ pl: { md: 5 } }}>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 900, mb: 1.5, display: 'block', letterSpacing: '0.05em' }}>
                                CONFIGURE OPTIONS
                            </Typography>
                            <Stack spacing={1}>
                                {(field.options || []).map((opt: string, oIdx: number) => (
                                    <Stack key={oIdx} direction="row" spacing={1} alignItems="center">
                                        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)' }} />
                                        <TextField
                                            fullWidth
                                            size="small"
                                            variant="standard"
                                            value={opt}
                                            onChange={(e) => updateOption(fIdx, oIdx, e.target.value)}
                                            InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
                                        />
                                        <IconButton size="small" onClick={() => removeOption(fIdx, oIdx)} sx={{ opacity: 0.3 }}>
                                            <CloseIcon fontSize="inherit" />
                                        </IconButton>
                                    </Stack>
                                ))}
                                <Button 
                                    size="small" 
                                    onClick={() => addOption(fIdx)} 
                                    sx={{ 
                                        justifyContent: 'flex-start', 
                                        color: 'var(--color-primary)', 
                                        fontWeight: 800, 
                                        fontSize: '0.7rem',
                                        mt: 1
                                    }}
                                >
                                    + ADD OPTION
                                </Button>
                            </Stack>
                        </Box>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 2, gap: 2 }}>
        <Button onClick={onClose} disabled={loading} sx={{ fontWeight: 800, color: 'text.secondary' }}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleSave} 
          disabled={loading || !title}
          sx={{ 
            borderRadius: '16px', 
            px: 5, 
            py: 1.5,
            fontWeight: 900,
            bgcolor: 'var(--color-primary)',
            color: 'black',
            boxShadow: `0 8px 32px ${alpha('#6366F1', 0.3)}`,
            '&:hover': { bgcolor: alpha('#6366F1', 0.9) }
          }}
        >
          {loading ? 'Encrypting...' : (form ? 'Commit Changes' : 'Initialize Portal')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
