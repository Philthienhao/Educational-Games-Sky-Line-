import defaultExperiments from './experimentCatalog.json';
import { IDBStorageService } from './idbStorage';
import { CloudStorageService } from './cloudStorage';
import { StorageService } from './storage';

const EXPERIMENTS_KEY_PREFIX = 'gvd_user_experiments_';
const DELETED_EXP_KEY_PREFIX = 'gvd_deleted_exp_ids_';

export const ExperimentService = {
  /**
   * Get effective user ID
   */
  getUserId(userId) {
    if (userId) return userId;
    const current = StorageService.getCurrentUser();
    return current?.id || 'guest_user';
  },

  /**
   * Get all experiments for a given user (Default catalog + Teacher's custom experiments)
   */
  getExperiments(userId) {
    const uid = this.getUserId(userId);
    const deletedIds = this.getDeletedExperimentIds(uid);

    let customExps = [];
    try {
      const stored = localStorage.getItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`);
      if (stored) {
        customExps = JSON.parse(stored);
      }
    } catch (e) {
      console.warn("ExperimentService.getExperiments parse error:", e);
    }

    // Combine default catalog + custom
    const all = [...defaultExperiments, ...(Array.isArray(customExps) ? customExps : [])];

    // Filter out deleted
    return all.filter(exp => !deletedIds.includes(exp.id));
  },

  /**
   * Save a new or edited experiment
   */
  async saveExperiment(userId, experiment) {
    const uid = this.getUserId(userId);
    if (!experiment.id) {
      experiment.id = `custom_exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    experiment.userId = uid;
    experiment.updatedAt = new Date().toISOString();
    experiment.isCustomized = true;

    let customExps = [];
    try {
      const stored = localStorage.getItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`);
      if (stored) customExps = JSON.parse(stored);
    } catch (e) {
      customExps = [];
    }

    const idx = customExps.findIndex(e => e.id === experiment.id);
    if (idx >= 0) {
      customExps[idx] = experiment;
    } else {
      customExps.push(experiment);
    }

    // 1. LocalStorage Sync
    localStorage.setItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`, JSON.stringify(customExps));

    // 2. IndexedDB Sync
    try {
      await IDBStorageService.setItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`, customExps);
    } catch (err) {
      console.warn("IDB save error for experiments:", err);
    }

    // 3. Cloud KV Sync
    try {
      await CloudStorageService.saveUserPrivateCloudData(uid, `experiments`, customExps);
    } catch (err) {
      console.warn("Cloud save error for experiments:", err);
    }

    return experiment;
  },

  /**
   * Delete an experiment for a teacher
   */
  async deleteExperiment(userId, expId) {
    const uid = this.getUserId(userId);
    const deletedIds = this.getDeletedExperimentIds(uid);
    if (!deletedIds.includes(expId)) {
      deletedIds.push(expId);
    }

    // Update deleted blacklist
    localStorage.setItem(`${DELETED_EXP_KEY_PREFIX}${uid}`, JSON.stringify(deletedIds));

    // Also remove from custom list if present
    let customExps = [];
    try {
      const stored = localStorage.getItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`);
      if (stored) customExps = JSON.parse(stored);
    } catch (e) {}
    customExps = customExps.filter(e => e.id !== expId);
    localStorage.setItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`, JSON.stringify(customExps));

    // Async IDB & Cloud sync
    try {
      await IDBStorageService.setItem(`${DELETED_EXP_KEY_PREFIX}${uid}`, deletedIds);
      await IDBStorageService.setItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`, customExps);
      await CloudStorageService.saveUserPrivateCloudData(uid, `deleted_exp_ids`, deletedIds);
      await CloudStorageService.saveUserPrivateCloudData(uid, `experiments`, customExps);
    } catch (e) {}

    return true;
  },

  /**
   * Get deleted experiment IDs blacklist
   */
  getDeletedExperimentIds(userId) {
    const uid = this.getUserId(userId);
    try {
      const stored = localStorage.getItem(`${DELETED_EXP_KEY_PREFIX}${uid}`);
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return [];
  },

  /**
   * Sync experiments from Cloud / IndexedDB on login
   */
  async syncAllUserData(userId) {
    const uid = this.getUserId(userId);
    try {
      const idbExps = await IDBStorageService.getItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`);
      if (Array.isArray(idbExps) && idbExps.length > 0) {
        localStorage.setItem(`${EXPERIMENTS_KEY_PREFIX}${uid}`, JSON.stringify(idbExps));
      }
    } catch (e) {}
  }
};
