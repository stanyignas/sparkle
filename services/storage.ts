import { UserData } from '../types';

const STORAGE_KEY = 'pocketlove_db_v1';

export const saveUser = (user: UserData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const getUser = (): UserData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load data", e);
    return null;
  }
};

export const clearData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
