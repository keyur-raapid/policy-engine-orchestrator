
import { Client, Rule, RuleType } from '../lib/types';

export const mockClients: Client[] = [
  { client_id: 1, client_name: 'Client A', project_id: 101 },
  { client_id: 2, client_name: 'Client B', project_id: 102 },
  { client_id: 3, client_name: 'Client C', project_id: 103 },
  { client_id: 4, client_name: 'raapid', project_id: 999 } // Global rules client
];

export const mockRuleTypes: RuleType[] = [
  { ruletype_id: 1, name: 'ExcludeText' },
  { ruletype_id: 2, name: 'lessSpecificCodeBasedOnStatistics' },
  { ruletype_id: 3, name: 'PhrasesRule' },
  { ruletype_id: 4, name: 'AllergiesRule' },
  { ruletype_id: 5, name: 'ConditionalValidation' }
];

export const mockRules: Rule[] = [
  {
    rule_id: 'r1',
    project_id: 101,
    category_id: 71,
    ruletype_id: 1,
    inputs: { phrase: 'Test1234' },
    statement: 'If phrase is Test1234, Then phrase is Test1234',
    rule_description: 'Exclude text rule for phrase Test1234',
    regex: '(Test1234)',
    valid_from: '2023-01-01',
    valid_till: '2023-12-31',
    version: 1,
    created_at: '2023-01-01T12:00:00Z',
    updated_at: '2023-01-01T12:00:00Z'
  },
  {
    rule_id: 'r2',
    project_id: 101,
    category_id: 71,
    ruletype_id: 3,
    inputs: { phrase: 'Important phrase' },
    statement: 'If phrase is Important phrase, Then apply special handling',
    rule_description: 'Special handling for important phrases',
    valid_from: '2023-02-01',
    valid_till: '2023-11-30',
    version: 2,
    created_at: '2023-02-01T10:00:00Z',
    updated_at: '2023-02-15T14:30:00Z'
  },
  {
    rule_id: 'r3',
    project_id: 999, // Global rule from 'raapid' client
    category_id: 71,
    ruletype_id: 4,
    inputs: { allergen: 'Peanut' },
    statement: 'If allergen is Peanut, Then flag as severe allergen',
    rule_description: 'Global rule for peanut allergies',
    valid_from: '2023-01-15',
    valid_till: '2025-01-15',
    version: 1,
    created_at: '2023-01-15T09:20:00Z',
    updated_at: '2023-01-15T09:20:00Z'
  }
];

// Helper function to fetch rules based on project_id and ruletype_id
export const fetchRules = (project_id: number, ruletype_id?: number): Rule[] => {
  const globalRules = mockRules.filter(rule => rule.project_id === 999);
  const clientRules = mockRules.filter(rule => rule.project_id === project_id && rule.project_id !== 999);
  
  let combinedRules = [...globalRules, ...clientRules];
  
  if (ruletype_id) {
    combinedRules = combinedRules.filter(rule => rule.ruletype_id === ruletype_id);
  }
  
  return combinedRules;
};
