/**
 * Session Taste Memory — Session Lifecycle Management
 *
 * Taste Memory is strictly session-scoped:
 * - Uses browser sessionStorage (automatically discarded when the tab is closed).
 * - Stores ONLY non-sensitive, visitor-controlled cultural preferences.
 * - NO tracking cookies, permanent device fingerprinting, or server-side accounts.
 * - Gracefully handles server-side rendering (SSR) and private browsing restrictions.
 * - Provides an explicit reset control to purge all stored data instantly.
 */

import { type TasteMemory } from "./types";
import { createInitialTasteMemory, validateAndMigrateTasteMemory } from "./state";

export const TASTE_MEMORY_STORAGE_KEY = "accessatlas_session_taste_memory";

/**
 * Checks if browser sessionStorage is available and functional.
 */
function isSessionStorageAvailable(): boolean {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return false;
  }
  try {
    const testKey = "__taste_memory_test__";
    window.sessionStorage.setItem(testKey, "1");
    window.sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads Taste Memory from sessionStorage, safely validating and falling back to initial state.
 */
export function loadTasteMemoryFromSession(): TasteMemory {
  if (!isSessionStorageAvailable()) {
    return createInitialTasteMemory();
  }

  try {
    const serialized = window.sessionStorage.getItem(TASTE_MEMORY_STORAGE_KEY);
    if (!serialized) {
      return createInitialTasteMemory();
    }
    const parsed = JSON.parse(serialized);
    return validateAndMigrateTasteMemory(parsed);
  } catch {
    // Corrupt JSON or storage read failure
    return createInitialTasteMemory();
  }
}

/**
 * Saves Taste Memory to sessionStorage.
 * Silently handles storage quota errors or restricted private mode without crashing.
 */
export function saveTasteMemoryToSession(memory: TasteMemory): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    const serialized = JSON.stringify(memory);
    window.sessionStorage.setItem(TASTE_MEMORY_STORAGE_KEY, serialized);
  } catch {
    // Quota exceeded or private browsing restriction; gracefully ignore
  }
}

/**
 * Clears Taste Memory completely from sessionStorage.
 */
export function clearTasteMemoryFromSession(): void {
  if (!isSessionStorageAvailable()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(TASTE_MEMORY_STORAGE_KEY);
  } catch {
    // Ignore storage clear failure
  }
}
