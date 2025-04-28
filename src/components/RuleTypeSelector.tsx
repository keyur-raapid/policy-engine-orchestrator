
import { RuleType } from '../lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RuleTypeSelectorProps {
  ruleTypes: RuleType[];
  selectedRuleType: RuleType | null;
  onSelectRuleType: (ruleType: RuleType | null) => void;
}

const RuleTypeSelector = ({ ruleTypes, selectedRuleType, onSelectRuleType }: RuleTypeSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="ruletype-select">Rule Type</Label>
      <Select
        value={selectedRuleType ? selectedRuleType.ruletype_id.toString() : ''}
        onValueChange={(value) => {
          if (value === '') {
            onSelectRuleType(null);
            return;
          }
          const ruleType = ruleTypes.find(rt => rt.ruletype_id.toString() === value);
          if (ruleType) {
            onSelectRuleType(ruleType);
          }
        }}
      >
        <SelectTrigger id="ruletype-select" className="w-full">
          <SelectValue placeholder="Select a rule type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Rule Types</SelectItem>
          {ruleTypes.map((ruleType) => (
            <SelectItem key={ruleType.ruletype_id} value={ruleType.ruletype_id.toString()}>
              {ruleType.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default RuleTypeSelector;
