
import { Client, Rule, RuleType } from '../lib/types';

// These arrays are now empty as we're fetching data from the backend
export const mockClients: Client[] = [];
export const mockRuleTypes: RuleType[] = [];
export const mockRules: Rule[] = [];

// Helper function for backward compatibility
// This function is no longer used as we're using the API directly
export const fetchRules = (project_id: number, ruletype_id?: number): Rule[] => {
  console.warn('fetchRules from mockData is deprecated, use API service instead');
  return [];
};
