'use client';

import { useState, useEffect } from 'react';

interface UserSettings {
  customGeminiKey?: string;
}

export const useSettings = () => {
  const [userSettings, setUserSettings] = useState<UserSettings>({});

  useEffect(() => {
    const storedSettings = localStorage.getItem('kylrix_settings');
    if (storedSettings) {
      try {
        setUserSettings(JSON.parse(storedSettings));
      } catch (e) {
        console.error('Failed to parse settings', e);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('kylrix_settings', JSON.stringify(updated));
      return updated;
    });
  };

  return { userSettings, updateSettings };
};
