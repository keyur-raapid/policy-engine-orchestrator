
import { useState, useEffect } from 'react';
import { Rule, RuleType, Client } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X } from 'lucide-react';

interface RuleFormProps {
  rule?: Rule;
  client: Client;
  ruleTypes: RuleType[];
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}

const CATEGORY_ID = 71; // Default category ID as per PRD

const generateStatement = (ruleType: RuleType, inputsObj: Record<string, string>) => {
  if (ruleType.name.toLowerCase() === 'exclude_text') {
    const phrase = inputsObj['phrase'] || '';
    return `If phrase is ${phrase}, Then phrase is ${phrase}`;
  }
  // Add more rule type statement templates as needed
  return '';
};

const RuleForm = ({ rule, client, ruleTypes, onSave, onCancel }: RuleFormProps) => {
  const isEditing = !!rule;
  const initialRuleType = rule ? ruleTypes.find(rt => rt.ruletype_id === rule.ruletype_id) : null;
  
  const [ruleDescription, setRuleDescription] = useState(rule?.rule_description || '');
  const [regex, setRegex] = useState(rule?.regex || '');
  const [validFrom, setValidFrom] = useState(rule?.valid_from || '');
  const [validTill, setValidTill] = useState(rule?.valid_till || '');
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(initialRuleType);
  const [statement, setStatement] = useState(rule?.statement || '');
  
  const [inputs, setInputs] = useState<Record<string, string>>(
    rule?.inputs ? 
    Object.entries(rule.inputs).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>) : 
    { phrase: '' }
  );

  useEffect(() => {
    if (selectedRuleType) {
      const newStatement = generateStatement(selectedRuleType, inputs);
      setStatement(newStatement);
    }
  }, [selectedRuleType, inputs]);

  const addInputField = () => {
    const newKey = `input_${Object.keys(inputs).length + 1}`;
    setInputs(prev => ({ ...prev, [newKey]: '' }));
  };

  const updateInputKey = (oldKey: string, newKey: string) => {
    if (newKey && newKey !== oldKey && !inputs.hasOwnProperty(newKey)) {
      const { [oldKey]: value, ...rest } = inputs;
      setInputs({ ...rest, [newKey]: value });
    }
  };

  const updateInputValue = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const removeInputField = (key: string) => {
    const { [key]: _, ...rest } = inputs;
    setInputs(rest);
  };

  const handleSave = () => {
    if (!selectedRuleType || !statement || !validFrom || !validTill) {
      alert('Please fill all required fields');
      return;
    }

    const processedInputs: Record<string, string | number | boolean> = {};
    Object.entries(inputs).forEach(([key, value]) => {
      if (!isNaN(Number(value))) {
        processedInputs[key] = Number(value);
      } else if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
        processedInputs[key] = value.toLowerCase() === 'true';
      } else {
        processedInputs[key] = value;
      }
    });

    const updatedRule: Partial<Rule> = {
      ...rule,
      project_id: client.project_id,
      category_id: CATEGORY_ID,
      ruletype_id: selectedRuleType.ruletype_id,
      statement,
      rule_description: ruleDescription,
      regex: regex || undefined,
      valid_from: validFrom,
      valid_till: validTill,
      inputs: processedInputs
    };

    onSave(updatedRule);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{isEditing ? 'Edit Rule' : 'Create New Rule'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rule-type">Rule Type</Label>
          <Select
            value={selectedRuleType ? selectedRuleType.ruletype_id.toString() : ''}
            onValueChange={(value) => {
              const ruleType = ruleTypes.find(rt => rt.ruletype_id.toString() === value);
              if (ruleType) {
                setSelectedRuleType(ruleType);
              }
            }}
            disabled={isEditing} // Can't change rule type when editing
          >
            <SelectTrigger id="rule-type">
              <SelectValue placeholder="Select a rule type" />
            </SelectTrigger>
            <SelectContent>
              {ruleTypes.map((ruleType) => (
                <SelectItem key={ruleType.ruletype_id} value={ruleType.ruletype_id.toString()}>
                  {ruleType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Inputs</Label>
          <div className="space-y-2">
            {Object.entries(inputs).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={key}
                  onChange={(e) => updateInputKey(key, e.target.value)}
                  className="w-1/3"
                />
                <Input
                  placeholder="Value"
                  value={value}
                  onChange={(e) => updateInputValue(key, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeInputField(key)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addInputField}
            >
              Add Input
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="statement">Statement</Label>
          <Textarea
            id="statement"
            value={statement}
            readOnly
            className="h-24 bg-gray-50"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Rule Description</Label>
          <Textarea
            id="description"
            placeholder="Rule-specific attributes and description"
            value={ruleDescription}
            onChange={(e) => setRuleDescription(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="regex">Regex (optional)</Label>
          <Input
            id="regex"
            placeholder="e.g., (Test1234)"
            value={regex}
            onChange={(e) => setRegex(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valid-from">Valid From</Label>
            <Input
              id="valid-from"
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid-till">Valid Till</Label>
            <Input
              id="valid-till"
              type="date"
              value={validTill}
              onChange={(e) => setValidTill(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RuleForm;
