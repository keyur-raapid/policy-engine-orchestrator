
import { Client, Rule, RuleType } from '../lib/types';

const API_BASE_URL = 'http://localhost:8080';

// Client API calls
export const fetchClients = async (): Promise<Client[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`);
    if (!response.ok) throw new Error('Failed to fetch clients');
    return await response.json();
  } catch (error) {
    console.error('Error fetching clients:', error);
    return [];
  }
};

// Rule Type API calls
export const fetchRuleTypes = async (): Promise<RuleType[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ruletypes`);
    if (!response.ok) throw new Error('Failed to fetch rule types');
    return await response.json();
  } catch (error) {
    console.error('Error fetching rule types:', error);
    return [];
  }
};

// Rule API calls
export const fetchRulesForClient = async (
  projectId: number,
  ruleTypeId?: number
): Promise<Rule[]> => {
  let url = `${API_BASE_URL}/rules?project_id=${projectId}`;
  if (ruleTypeId) {
    url += `&ruletype_id=${ruleTypeId}`;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch rules');
    return await response.json();
  } catch (error) {
    console.error('Error fetching rules:', error);
    return [];
  }
};

export const createRule = async (rule: Omit<Rule, 'rule_id'>): Promise<Rule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    });
    
    if (!response.ok) throw new Error('Failed to create rule');
    return await response.json();
  } catch (error) {
    console.error('Error creating rule:', error);
    throw error;
  }
};

export const updateRule = async (rule: Rule): Promise<Rule> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rules/${rule.rule_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rule),
    });
    
    if (!response.ok) throw new Error('Failed to update rule');
    return await response.json();
  } catch (error) {
    console.error('Error updating rule:', error);
    throw error;
  }
};

export const deleteRule = async (ruleId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/rules/${ruleId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete rule');
  } catch (error) {
    console.error('Error deleting rule:', error);
    throw error;
  }
};

export const addRuleType = async (ruleType: Omit<RuleType, 'ruletype_id'>): Promise<RuleType> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ruletypes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ruleType),
    });
    
    if (!response.ok) throw new Error('Failed to create rule type');
    return await response.json();
  } catch (error) {
    console.error('Error creating rule type:', error);
    throw error;
  }
};

export const deleteRuleType = async (ruleTypeId: number): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/ruletypes/${ruleTypeId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) throw new Error('Failed to delete rule type');
  } catch (error) {
    console.error('Error deleting rule type:', error);
    throw error;
  }
};
