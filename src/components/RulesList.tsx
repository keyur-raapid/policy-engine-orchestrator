
import { useState, useEffect } from 'react';
import { Rule, RuleType } from '../lib/types';
import RuleCard from './RuleCard';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface RulesListProps {
  rules: Rule[];
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (rule: Rule) => void;
}

const RulesList = ({ rules, onEditRule, onDeleteRule }: RulesListProps) => {
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Reset selected rule when rules array changes (e.g., after deletion)
  useEffect(() => {
    if (selectedRule && !rules.some(rule => rule.rule_id === selectedRule.rule_id)) {
      setSelectedRule(null);
    }
  }, [rules, selectedRule]);

  const filteredRules = rules.filter(rule => {
    const searchLower = searchTerm.toLowerCase();
    return Object.values(rule.inputs).some(value => 
      value.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteRule = (rule: Rule) => {
    onDeleteRule(rule);
    if (selectedRule && selectedRule.rule_id === rule.rule_id) {
      setSelectedRule(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search rules by input parameters..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
          {filteredRules.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No rules found for the selected criteria.</p>
            </Card>
          ) : (
            filteredRules.map(rule => (
              <button
                key={rule.rule_id}
                onClick={() => setSelectedRule(rule)}
                className="w-full text-left"
              >
                <Card
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    selectedRule?.rule_id === rule.rule_id ? 'border-primary' : ''
                  }`}
                >
                  <div className="mt-2 text-sm">
                    {Object.entries(rule.inputs).map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </Card>
              </button>
            ))
          )}
        </div>

        {selectedRule && (
          <div className="sticky top-0">
            <RuleCard
              rule={selectedRule}
              onEdit={onEditRule}
              onDelete={handleDeleteRule}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default RulesList;
