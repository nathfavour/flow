'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  alpha
} from '@mui/material';
import { Visibility as ViewIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { FormsService } from '@/lib/services/forms';
import { FormSubmissions } from '@/generated/appwrite/types';

export default function SubmissionViewer({ formId }: { formId: string }) {
  const [submissions, setSubmissions] = useState<FormSubmissions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await FormsService.listSubmissions(formId);
        setSubmissions(res.rows);
      } catch (e) {
        console.error('Failed to fetch submissions', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [formId]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={24} /></Box>;

  if (submissions.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 10, opacity: 0.5 }}>
        <Typography variant="body1" sx={{ fontWeight: 700 }}>No telemetry received.</Typography>
      </Box>
    );
  }

  const parsePayload = (payload: string) => {
    try {
      return JSON.parse(payload);
    } catch (e) {
      return { data: payload };
    }
  };

  const firstPayload = parsePayload(submissions[0].payload);
  const headers = Object.keys(firstPayload);

  const renderValue = (val: any) => {
    if (Array.isArray(val)) {
        return (
            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {val.map((v, i) => (
                    <Chip key={i} label={v} size="small" sx={{ fontSize: '10px', fontWeight: 800, bgcolor: alpha('#6366F1', 0.1), color: 'var(--color-primary)' }} />
                ))}
            </Box>
        );
    }
    return String(val || '-');
  };

  return (
    <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px', overflow: 'hidden' }}>
      <Table size="medium">
        <TableHead>
          <TableRow sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
            <TableCell sx={{ fontWeight: 900, color: 'text.secondary', py: 3, borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>TIMESTAMP</TableCell>
            {headers.map(h => (
              <TableCell key={h} sx={{ fontWeight: 900, color: 'text.secondary', textTransform: 'uppercase', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.7rem', letterSpacing: '0.1em' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((sub) => {
            const data = parsePayload(sub.payload);
            return (
              <TableRow key={sub.$id} sx={{ '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' }, transition: 'background-color 0.2s' }}>
                <TableCell sx={{ color: 'text.secondary', fontSize: '0.8rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  {new Date(sub.submittedAt).toLocaleString()}
                </TableCell>
                {headers.map(h => (
                  <TableCell key={h} sx={{ color: '#F2F2F2', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                    {renderValue(data[h])}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
