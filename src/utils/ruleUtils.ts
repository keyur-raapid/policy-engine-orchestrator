
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
 * Generate a rule statement based on rule type and inputs
 * @param ruleType The rule type object
 * @param inputs Key-value pairs of inputs
 * @returns Generated statement string
 */
export const generateStatement = (ruleType: RuleType, inputs: Record<string, string>): string => {
  if (!ruleType.customFields || ruleType.customFields.length === 0) {
    return '';
  }

  // Create a simple statement joining all field values
  const parts = ruleType.customFields.map(field => {
    const value = inputs[field.key] || '';
    return `${field.label}: ${value}`;
  });

  return `${ruleType.name}: ${parts.join(' | ')}`;
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
