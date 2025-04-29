
import { useState, useEffect } from 'react';
import { Rule, RuleType, Client } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ICDCodeInput from './ICDCodeInput';
import { 
  getDefaultInputsForRuleType, 
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
      const config = getFormConfigForRuleType(selectedRuleType);
      setFormConfig(config);
      
      if (!isEditing) {
        const defaultInputs = getDefaultInputsForRuleType(selectedRuleType);
        setInputs(defaultInputs);
      }
    }
  }, [selectedRuleType, isEditing]);

  const validateForm = () => {
    if (!selectedRuleType) {
      toast({
        title: "Missing Rule Type",
        description: "Please select a rule type",
        variant: "destructive"
      });
      return false;
    }

    // Field-specific validation based on rule type
    const validationRules = getValidationRulesForRuleType(selectedRuleType);
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

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const processedInputs: Record<string, string | number | boolean> = {};
    Object.entries(inputs).forEach(([key, value]) => {
      processedInputs[key] = value;
    });

    const updatedRule: Partial<Rule> = {
      ...rule,
      project_id: client.project_id,
      category_id: CATEGORY_ID,
      ruletype_id: selectedRuleType!.ruletype_id,
      inputs: processedInputs,
      version: rule?.version || 1,
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
        <h3 className="font-medium">{selectedRuleType.name} Fields</h3>
        {formConfig.map((field) => (
          <div key={field.key} className="space-y-2">
            {renderField(field)}
            {errors[field.key] && (
              <p className="text-sm text-red-500">{errors[field.key]}</p>
            )}
          </div>
        ))}
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
        
      case 'icdCode':
        return (
          <>
            <Label htmlFor={field.key}>{field.label}</Label>
            <ICDCodeInput
              value={value}
              onChange={(newValue) => updateInputValue(field.key, newValue)}
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            />
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
          <select
            id="rule-type"
            value={selectedRuleType ? selectedRuleType.ruletype_id : ''}
            onChange={(e) => {
              const ruleType = ruleTypes.find(rt => rt.ruletype_id.toString() === e.target.value);
              if (ruleType) {
                setSelectedRuleType(ruleType);
              }
            }}
            disabled={isEditing}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="">Select a rule type</option>
            {ruleTypes.map((ruleType) => (
              <option key={ruleType.ruletype_id} value={ruleType.ruletype_id}>
                {ruleType.name}
              </option>
            ))}
          </select>
        </div>

        {renderDynamicFields()}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Check className="mr-2 h-4 w-4" />
          {isEditing ? 'Update Rule' : 'Create Rule'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RuleForm;
