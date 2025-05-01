
import { Rule, RuleInput } from "../lib/types";

/**
 * Check if a rule with identical inputs already exists
 * @param existingRules All existing rules for the client
 * @param ruleTypeId The rule type ID of the new rule
 * @param inputs The inputs of the new rule
 * @returns Boolean indicating if a duplicate rule was found, and the duplicate rule if found
 */
export const checkDuplicateRule = (
  existingRules: Rule[],
  ruleTypeId: number,
  inputs: Record<string, string | number | boolean>
): { isDuplicate: boolean; duplicateRule: Rule | null } => {
  // Filter rules by rule type
  const rulesOfSameType = existingRules.filter(r => r.ruletype_id === ruleTypeId);
  
  // Check if any rule has the same inputs
  const duplicate = rulesOfSameType.find(rule => {
    // Check if all inputs match
    const ruleInputs = rule.inputs;
    
    // All keys in the new rule must match values in the existing rule
    const allKeysMatch = Object.entries(inputs).every(([key, value]) => {
      // Convert both to strings for comparison to handle different types
      return ruleInputs[key]?.toString() === value.toString();
    });
    
    // The number of keys should also match to ensure complete equality
    const hasSameNumberOfKeys = Object.keys(inputs).length === Object.keys(ruleInputs).length;
    
    return allKeysMatch && hasSameNumberOfKeys;
  });
  
  return {
    isDuplicate: !!duplicate,
    duplicateRule: duplicate || null
  };
};
