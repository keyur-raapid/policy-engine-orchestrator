
import React, { useState } from 'react';
import { RuleType, CustomField } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Plus, Trash2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

interface RuleTypeManagerProps {
  ruleTypes: RuleType[];
  onAddRuleType: (ruleType: Omit<RuleType, 'ruletype_id'>) => void;
}

const RuleTypeManager: React.FC<RuleTypeManagerProps> = ({ ruleTypes, onAddRuleType }) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [customFields, setCustomFields] = useState<CustomField[]>([]);

  const addField = () => {
    setCustomFields([
      ...customFields,
      {
        key: `field_${customFields.length + 1}`,
        label: '',
        type: 'string',
        required: false
      }
    ]);
  };

  const updateField = (index: number, updates: Partial<CustomField>) => {
    const updatedFields = [...customFields];
    updatedFields[index] = { ...updatedFields[index], ...updates };
    
    // If label changed, update key with sanitized version of label
    if (updates.label) {
      updatedFields[index].key = updates.label.toLowerCase().replace(/\s+/g, '_');
    }
    
    setCustomFields(updatedFields);
  };

  const removeField = (index: number) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name) {
      toast({
        title: "Error",
        description: "Rule type name is required",
        variant: "destructive"
      });
      return;
    }

    if (ruleTypes.some(rt => rt.name === name)) {
      toast({
        title: "Error",
        description: "Rule type name must be unique",
        variant: "destructive"
      });
      return;
    }

    if (customFields.length === 0) {
      toast({
        title: "Error",
        description: "At least one field is required",
        variant: "destructive"
      });
      return;
    }

    // Validate that all fields have labels
    const emptyLabels = customFields.some(field => !field.label);
    if (emptyLabels) {
      toast({
        title: "Error",
        description: "All fields must have labels",
        variant: "destructive"
      });
      return;
    }

    const newRuleType = {
      name,
      customFields
    };

    onAddRuleType(newRuleType);
    
    // Reset form
    setName('');
    setCustomFields([]);

    toast({
      title: "Success",
      description: `Rule type "${name}" has been created`
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Rule Type</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Rule Type Name</Label>
          <Input 
            id="name"
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter rule type name"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Fields</Label>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={addField}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>

          <div className="space-y-3 mt-2">
            {customFields.map((field, index) => (
              <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded-md">
                <div className="flex-1">
                  <Label htmlFor={`field-label-${index}`}>Label</Label>
                  <Input
                    id={`field-label-${index}`}
                    value={field.label}
                    onChange={(e) => updateField(index, { label: e.target.value })}
                    placeholder="Field label"
                    className="mb-2"
                  />
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor={`field-type-${index}`}>Type</Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateField(index, { type: value as 'string' | 'icdCode' })}
                      >
                        <SelectTrigger id={`field-type-${index}`}>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="string">String</SelectItem>
                          <SelectItem value="icdCode">ICD Code</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end mb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`field-required-${index}`}
                          checked={field.required}
                          onCheckedChange={(checked) => updateField(index, { required: !!checked })}
                        />
                        <Label htmlFor={`field-required-${index}`}>Required</Label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeField(index)}
                  className="mt-6"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {customFields.length === 0 && (
              <p className="text-sm text-gray-500">No fields added yet. Click "Add Field" to create fields for this rule type.</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSubmit} className="ml-auto">
          <Check className="mr-2 h-4 w-4" /> Create Rule Type
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RuleTypeManager;
