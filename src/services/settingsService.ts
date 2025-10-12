import { Settings } from '@/types';
import { mockSettings } from '@/data/mockData';

class SettingsService {
  private settings: Settings = { ...mockSettings };

  get(): Settings {
    return { ...this.settings };
  }

  update(updates: Partial<Settings>): Settings {
    this.settings = {
      ...this.settings,
      ...updates
    };
    return { ...this.settings };
  }

  reset(): Settings {
    this.settings = { ...mockSettings };
    return { ...this.settings };
  }
}

export const settingsService = new SettingsService();
