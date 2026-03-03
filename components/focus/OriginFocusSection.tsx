'use client';

import React, { useEffect } from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useOriginFocus } from '@/hooks/useOriginFocus';

interface OriginFocusSectionProps {
  onPlaylistSelect: (playlistId: string) => void;
  selectedPlaylist: string;
}

export default function OriginFocusSection({ onPlaylistSelect, selectedPlaylist }: OriginFocusSectionProps) {
  const { isAuthenticated, playlists, fetchPlaylists, loading: loadingPlaylists } = useOriginFocus();

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylists]);

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ mb: 4, width: '100%', maxWidth: 500 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Focus Music (Spotify)</InputLabel>
        <Select
          value={selectedPlaylist}
          label="Focus Music (Spotify)"
          onChange={(e) => onPlaylistSelect(e.target.value)}
          disabled={loadingPlaylists}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {playlists.map((playlist: any) => (
            <MenuItem key={playlist.id} value={playlist.id}>
              {playlist.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
}

