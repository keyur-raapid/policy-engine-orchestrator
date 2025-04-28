
import { useState, useEffect } from 'react';
import { Rule, RuleType, Client } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { 
  getDefaultInputsForRuleType, 
  generateStatement, 
  getFormConfigForRuleType,
  InputFieldConfig,
  getValidationRulesForRuleType
} from '../utils/ruleUtils';

interface RuleFormProps {
  rule?: Rule;
  client: Client;
  ruleTypes: RuleType[];
  onSave: (rule: Partial<Rule>) => void;
  onCancel: () => void;
}

const CATEGORY_ID = 71; // Default category ID as per PRD

const RuleForm = ({ rule, client, ruleTypes, onSave, onCancel }: RuleFormProps) => {
  const { toast } = useToast();
  const isEditing = !!rule;
  const initialRuleType = rule ? ruleTypes.find(rt => rt.ruletype_id === rule.ruletype_id) : null;
  
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(initialRuleType);
  const [formConfig, setFormConfig] = useState<InputFieldConfig[]>([]);
  const [ruleDescription, setRuleDescription] = useState(rule?.rule_description || '');
  const [regex, setRegex] = useState(rule?.regex || '');
  const [validFrom, setValidFrom] = useState(rule?.valid_from || '');
  const [validTill, setValidTill] = useState(rule?.valid_till || '');
  const [statement, setStatement] = useState(rule?.statement || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [inputs, setInputs] = useState<Record<string, string>>(
    rule?.inputs ? 
    Object.entries(rule.inputs).reduce((acc, [key, value]) => {
      acc[key] = value.toString();
      return acc;
    }, {} as Record<string, string>) : 
    {}
  );

  useEffect(() => {
    // When rule type changes, update form configuration and inputs with default values for that rule type
    if (selectedRuleType) {
      const config = getFormConfigForRuleType(selectedRuleType.name);
      setFormConfig(config);
      
      if (!isEditing) {
        const defaultInputs = getDefaultInputsForRuleType(selectedRuleType.name);
        setInputs(defaultInputs);
      }
    }
  }, [selectedRuleType, isEditing]);

  useEffect(() => {
    if (selectedRuleType) {
      const newStatement = generateStatement(selectedRuleType, inputs);
      setStatement(newStatement);
    }
  }, [selectedRuleType, inputs]);

  const validateForm = () => {
    if (!selectedRuleType) {
      toast({
        title: "Missing Rule Type",
        description: "Please select a rule type",
        variant: "destructive"
      });
      return false;
    }

    if (!statement) {
      toast({
        title: "Missing Statement",
        description: "Rule statement cannot be empty",
        variant: "destructive"
      });
      return false;
    }

    if (!validFrom || !validTill) {
      toast({
        title: "Missing Dates",
        description: "Please provide valid from and valid till dates",
        variant: "destructive"
      });
      return false;
    }

    // Field-specific validation based on rule type
    const validationRules = getValidationRulesForRuleType(selectedRuleType.name);
    const newErrors: Record<string, string> = {};
    
    Object.entries(validationRules).forEach(([field, rules]) => {
      if (rules.required && (!inputs[field] || inputs[field].trim() === '')) {
        newErrors[field] = `${field} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updateInputValue = (key: string, value: string | boolean) => {
    setInputs(prev => ({
      ...prev,
      [key]: value.toString()
    }));
    
    // Clear error for this field if it exists
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const addCustomInputField = () => {
    const newKey = `custom_${Object.keys(inputs).length + 1}`;
    setInputs(prev => ({ ...prev, [newKey]: '' }));
  };

  const updateCustomInputKey = (oldKey: string, newKey: string) => {
    if (newKey && newKey !== oldKey && !inputs.hasOwnProperty(newKey)) {
      const { [oldKey]: value, ...rest } = inputs;
      setInputs({ ...rest, [newKey]: value });
    }
  };

  const removeCustomInputField = (key: string) => {
    const { [key]: _, ...rest } = inputs;
    setInputs(rest);
  };

  const handleSave = () => {
    if (!validateForm()) {
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
      ruletype_id: selectedRuleType!.ruletype_id,
      statement,
      rule_description: ruleDescription,
      regex: regex || undefined,
      valid_from: validFrom,
      valid_till: validTill,
      inputs: processedInputs
    };

    onSave(updatedRule);
  };

  // Render dynamic form fields based on rule type
  const renderDynamicFields = () => {
    if (!selectedRuleType || formConfig.length === 0) {
      return (
        <div className="space-y-2 mt-4">
          <p className="text-sm text-gray-500">Select a rule type to see its specific fields.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4 mt-4">
        <h3 className="font-medium">Rule Type Fields</h3>
        {formConfig.map((field) => (
          <div key={field.key} className="space-y-2">
            {renderField(field)}
            {errors[field.key] && (
              <p className="text-sm text-red-500">{errors[field.key]}</p>
            )}
          </div>
        ))}
        
        {/* Custom fields section for advanced users */}
        {selectedRuleType.name.toLowerCase() === 'custom' && (
          <div className="space-y-2 mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Custom Fields</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomInputField}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Custom Field
              </Button>
            </div>
            
            {Object.entries(inputs).filter(([key]) => key.startsWith('custom_')).map(([key, value]) => (
              <div key={key} className="flex gap-2">
                <Input
                  placeholder="Key"
                  value={key.replace('custom_', '')}
                  onChange={(e) => updateCustomInputKey(key, `custom_${e.target.value}`)}
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
                  onClick={() => removeCustomInputField(key)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Render a specific field based on its configuration
  const renderField = (field: InputFieldConfig) => {
    const value = inputs[field.key] || '';
    
    switch (field.fieldType) {
      case 'text':
        return (
          <>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => updateInputValue(field.key, e.target.value)}
            />
          </>
        );
        
      case 'number':
        return (
          <>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Input
              id={field.key}
              type="number"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => updateInputValue(field.key, e.target.value)}
            />
          </>
        );
        
      case 'textarea':
        return (
          <>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Textarea
              id={field.key}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
              value={value}
              onChange={(e) => updateInputValue(field.key, e.target.value)}
            />
          </>
        );
        
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              id={field.key} 
              checked={value === 'true'} 
              onCheckedChange={(checked) => updateInputValue(field.key, checked ? 'true' : 'false')}
            />
            <Label htmlFor={field.key}>{field.label}</Label>
          </div>
        );
        
      case 'select':
        return (
          <>
            <Label htmlFor={field.key}>{field.label}</Label>
            <Select
              value={value}
              onValueChange={(newValue) => updateInputValue(field.key, newValue)}
            >
              <SelectTrigger id={field.key}>
                <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        );
        
      default:
        return null;
    }
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

        {renderDynamicFields()}

        <div className="space-y-2 mt-4 border-t pt-4">
          <Label htmlFor="statement">Rule Statement</Label>
          <Textarea
            id="statement"
            value={statement}
            readOnly
            className="h-24 bg-gray-50"
          />
          <p className="text-sm text-gray-500">Statement is automatically generated based on rule type and inputs.</p>
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
