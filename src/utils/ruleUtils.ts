
/**
 * Utilities for working with rules and rule types
 */

/**
 * Get default inputs for a specific rule type
 * @param ruleTypeName The name of the rule type
 * @returns A record containing default input keys and values
 */
export const getDefaultInputsForRuleType = (ruleTypeName: string): Record<string, string> => {
  const type = ruleTypeName.toLowerCase();

  switch (type) {
    case 'excludetext':
    case 'exclude_text':
      return { phrase: '' };

    case 'phrasesrule':
    case 'phrases_rule':
      return { 
        phrase: '',
        critical: 'false'
      };

    case 'allergiesrule':
    case 'allergies_rule':
      return { 
        allergen: '',
        severe: 'false'
      };

    case 'conditionalvalidation':
    case 'conditional_validation':
      return {
        condition: '',
        value: ''
      };
    
    case 'lessspecificcodebasedonstatistics':
    case 'less_specific_code_based_on_statistics':
      return {
        code: '',
        level: '1'
      };
    
    default:
      // For unknown rule types, return an empty input object
      return { input: '' };
  }
};

/**
 * Generate a rule statement based on rule type and inputs
 * @param ruleType The rule type object
 * @param inputs Key-value pairs of inputs
 * @returns Generated statement string
 */
export const generateStatement = (ruleType: { name: string }, inputs: Record<string, string>): string => {
  const type = ruleType.name.toLowerCase();

  switch (type) {
    case 'excludetext':
    case 'exclude_text':
      const phrase = inputs['phrase'] || '';
      return `If phrase is ${phrase}, Then phrase is ${phrase}`;
    
    case 'phrasesrule':
    case 'phrases_rule':
      const phraseValue = inputs['phrase'] || '';
      const critical = inputs['critical'] === 'true' ? 'critical' : 'standard';
      return `If phrase is ${phraseValue}, Then mark as ${critical} phrase`;
    
    case 'allergiesrule':
    case 'allergies_rule':
      const allergen = inputs['allergen'] || '';
      const severity = inputs['severe'] === 'true' ? 'severe' : 'normal';
      return `If allergen is ${allergen}, Then flag as ${severity} allergen`;
    
    case 'conditionalvalidation':
    case 'conditional_validation':
      const condition = inputs['condition'] || '';
      const value = inputs['value'] || '';
      return `If condition ${condition} is met, Then validate with value ${value}`;
    
    case 'lessspecificcodebasedonstatistics':
    case 'less_specific_code_based_on_statistics':
      const code = inputs['code'] || '';
      const level = inputs['level'] || '1';
      return `If code is ${code}, Then use less specific code at level ${level}`;
    
    default:
      // For unknown rule types, create a generic statement based on inputs
      const inputEntries = Object.entries(inputs);
      if (inputEntries.length === 0) {
        return '';
      }
      
      const conditions = inputEntries
        .map(([key, value]) => `${key} is ${value}`)
        .join(' AND ');
      
      return `If ${conditions}, Then apply rule: ${ruleType.name}`;
  }
};

/**
 * Get custom form configuration for a specific rule type
 * @param ruleTypeName The name of the rule type
 * @returns Form configuration for the rule type
 */
export interface InputFieldConfig {
  fieldType: 'text' | 'checkbox' | 'select' | 'number' | 'textarea';
  label: string;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  key: string;
  required?: boolean;
}

export const getFormConfigForRuleType = (ruleTypeName: string): InputFieldConfig[] => {
  const type = ruleTypeName.toLowerCase();

  switch (type) {
    case 'excludetext':
    case 'exclude_text':
      return [
        {
          fieldType: 'text',
          label: 'Phrase to exclude',
          placeholder: 'Enter phrase',
          key: 'phrase',
          required: true
        }
      ];

    case 'phrasesrule':
    case 'phrases_rule':
      return [
        {
          fieldType: 'text',
          label: 'Phrase',
          placeholder: 'Enter phrase',
          key: 'phrase',
          required: true
        },
        {
          fieldType: 'checkbox',
          label: 'Critical',
          key: 'critical'
        }
      ];

    case 'allergiesrule':
    case 'allergies_rule':
      return [
        {
          fieldType: 'text',
          label: 'Allergen',
          placeholder: 'Enter allergen',
          key: 'allergen',
          required: true
        },
        {
          fieldType: 'checkbox',
          label: 'Severe',
          key: 'severe'
        }
      ];

    case 'conditionalvalidation':
    case 'conditional_validation':
      return [
        {
          fieldType: 'text',
          label: 'Condition',
          placeholder: 'Enter condition',
          key: 'condition',
          required: true
        },
        {
          fieldType: 'text',
          label: 'Value',
          placeholder: 'Enter value',
          key: 'value',
          required: true
        }
      ];
    
    case 'lessspecificcodebasedonstatistics':
    case 'less_specific_code_based_on_statistics':
      return [
        {
          fieldType: 'text',
          label: 'Code',
          placeholder: 'Enter code',
          key: 'code',
          required: true
        },
        {
          fieldType: 'select',
          label: 'Level',
          key: 'level',
          options: [
            { value: '1', label: 'Level 1' },
            { value: '2', label: 'Level 2' },
            { value: '3', label: 'Level 3' }
          ]
        }
      ];
    
    default:
      // For unknown rule types, return a generic input field
      return [
        {
          fieldType: 'text',
          label: 'Input',
          placeholder: 'Enter value',
          key: 'input'
        }
      ];
  }
};

/**
 * Generate validation rules for specific form fields based on rule type
 * @param ruleTypeName The name of the rule type 
 * @returns Validation rules for the form
 */
export const getValidationRulesForRuleType = (ruleTypeName: string): Record<string, { required?: boolean }> => {
  const formConfig = getFormConfigForRuleType(ruleTypeName);
  
  const validationRules: Record<string, { required?: boolean }> = {};
  
  formConfig.forEach(field => {
    if (field.required) {
      validationRules[field.key] = { required: true };
    }
  });
  
  return validationRules;
};
