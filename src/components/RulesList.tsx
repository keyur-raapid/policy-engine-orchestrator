
import { Rule, RuleType } from '../lib/types';
import RuleCard from './RuleCard';
import { mockRuleTypes } from '../data/mockData';

interface RulesListProps {
  rules: Rule[];
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (rule: Rule) => void;
}

const RulesList = ({ rules, onEditRule, onDeleteRule }: RulesListProps) => {
  // Find the rule type for each rule
  const getRuleType = (ruletype_id: number): RuleType | undefined => {
    return mockRuleTypes.find(rt => rt.ruletype_id === ruletype_id);
  };

  if (rules.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <p className="text-gray-500">No rules found for the selected criteria.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.map(rule => (
        <RuleCard
          key={rule.rule_id}
          rule={rule}
          ruleType={getRuleType(rule.ruletype_id)}
          onEdit={onEditRule}
          onDelete={onDeleteRule}
        />
      ))}
    </div>
  );
};

export default RulesList;
