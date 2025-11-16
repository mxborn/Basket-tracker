import type { AppState } from '../types';

const SERVER_DB_KEY = 'basketstat_server_db';

// This simulates a network call delay
const simulateNetwork = <T,>(data: T): Promise<T> =>
  new Promise(resolve => setTimeout(() => resolve(data), 300));

export const api = {
  getAppState: async (): Promise<AppState | null> => {
    console.log("API: Fetching app state from server...");
    const dbString = localStorage.getItem(SERVER_DB_KEY);
    if (dbString) {
      const state = JSON.parse(dbString) as AppState;
      return simulateNetwork(state);
    }
    return simulateNetwork(null);
  },
  saveAppState: async (state: AppState): Promise<void> => {
    console.log("API: Saving app state to server...");
    localStorage.setItem(SERVER_DB_KEY, JSON.stringify(state));
    await simulateNetwork(undefined);
    console.log("API: Save complete.");
  },
};
