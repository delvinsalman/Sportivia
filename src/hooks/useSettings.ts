import { useEffect, useState, useCallback } from 'react';
import {
  getSettings,
  saveSettings,
  resetSettings,
  subscribeSettings,
  type GameSettings,
} from '../lib/settings';

export function useSettings() {
  const [settings, setSettings] = useState<GameSettings>(() => getSettings());

  useEffect(() => subscribeSettings(() => setSettings(getSettings())), []);

  const update = useCallback((patch: Partial<GameSettings>) => {
    setSettings(saveSettings(patch));
  }, []);

  const reset = useCallback(() => {
    setSettings(resetSettings());
  }, []);

  return { settings, update, reset };
}
