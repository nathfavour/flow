'use client';

import { useAuth } from "@campnetwork/origin/react";
import { useState } from "react";

export const useOriginSocial = () => {
  const { isAuthenticated } = useAuth();
  const [socialContext, setSocialContext] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchSocialContext = async (handle: string) => {
    if (!isAuthenticated || !handle) return;
    setLoading(true);
    try {
      const placeholder = {
        user: { name: handle, username: handle, profileImage: undefined },
        tweets: [
          { id: "origin-demo-tweet-1", text: `Context snapshot for @${handle}` },
          { id: "origin-demo-tweet-2", text: "This is a placeholder tweet." },
        ],
      };
      setSocialContext(placeholder);
    } catch (e) {
      console.error("Origin social placeholder failed", e);
    } finally {
      setLoading(false);
    }
  };

  return {
    isAuthenticated,
    socialContext,
    loading,
    fetchSocialContext,
  };
};
