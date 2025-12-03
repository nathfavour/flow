'use client';

import { useAuth } from "@campnetwork/origin/react";
import { useState } from "react";

export const useOriginFocus = () => {
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPlaylists = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const placeholder = [
        { id: "origin-demo-deep-work", name: "Origin Deep Work" },
        { id: "origin-demo-chill", name: "Origin Chill Focus" },
      ];
      setPlaylists(placeholder);
    } catch (e) {
      console.error("Origin focus placeholder failed", e);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    playlists,
    loading,
    fetchPlaylists,
  };
};
