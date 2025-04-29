
/**
 * Utilities for working with rules and rule types
 */
import { RuleType, CustomField } from '../lib/types';

/**
 * Get default inputs for a specific rule type
 * @param ruleType The rule type object
 * @returns A record containing default input keys and values
 */
export const getDefaultInputsForRuleType = (ruleType: RuleType): Record<string, string> => {
  if (!ruleType.customFields || ruleType.customFields.length === 0) {
    return {};
  }

  const defaultInputs: Record<string, string> = {};
  ruleType.customFields.forEach(field => {
    defaultInputs[field.key] = '';
  });

  return defaultInputs;
};

/**
 * Form field configuration
 */
export interface InputFieldConfig {
  fieldType: 'text' | 'icdCode';
  label: string;
  placeholder?: string;
  key: string;
  required?: boolean;
}

/**
 * Get custom form configuration for a specific rule type
 * @param ruleType The rule type
 * @returns Form configuration for the rule type
 */
export const getFormConfigForRuleType = (ruleType: RuleType): InputFieldConfig[] => {
  if (!ruleType.customFields || ruleType.customFields.length === 0) {
    return [];
  }

  return ruleType.customFields.map(field => ({
    fieldType: field.type === 'icdCode' ? 'icdCode' : 'text',
    label: field.label,
    placeholder: `Enter ${field.label.toLowerCase()}`,
    key: field.key,
    required: field.required
  }));
};

/**
 * Generate validation rules for specific form fields based on rule type
 * @param ruleType The rule type
 * @returns Validation rules for the form
 */
export const getValidationRulesForRuleType = (ruleType: RuleType): Record<string, { required?: boolean }> => {
  if (!ruleType.customFields || ruleType.customFields.length === 0) {
    return {};
  }
  
  const validationRules: Record<string, { required?: boolean }> = {};
  
  ruleType.customFields.forEach(field => {
    if (field.required) {
      validationRules[field.key] = { required: true };
    }
  });
  
  return validationRules;
};

/**
 * Count rules for a specific rule type
 * @param rules All rules
 * @param ruleTypeId The rule type ID
 * @returns Number of rules for the specified rule type
 */
export const countRulesForRuleType = (rules: any[], ruleTypeId: number): number => {
  return rules.filter(rule => rule.ruletype_id === ruleTypeId).length;
};
