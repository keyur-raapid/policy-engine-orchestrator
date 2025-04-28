
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientSelector from '@/components/ClientSelector';
import RuleTypeSelector from '@/components/RuleTypeSelector';
import RulesList from '@/components/RulesList';
import RuleForm from '@/components/RuleForm';
import { mockClients, mockRuleTypes, fetchRules } from '@/data/mockData';
import { Client, Rule, RuleType } from '@/lib/types';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  
  useEffect(() => {
    if (selectedClient) {
      const fetchedRules = fetchRules(
        selectedClient.project_id, 
        selectedRuleType ? selectedRuleType.ruletype_id : undefined
      );
      setRules(fetchedRules);
    } else {
      setRules([]);
    }
  }, [selectedClient, selectedRuleType]);

  const handleSelectClient = (client: Client) => {
    setSelectedClient(client);
    setEditingRule(null);
    setIsCreatingRule(false);
  };

  const handleSelectRuleType = (ruleType: RuleType | null) => {
    setSelectedRuleType(ruleType);
    setEditingRule(null);
    setIsCreatingRule(false);
  };

  const handleCreateRule = () => {
    setIsCreatingRule(true);
    setEditingRule(null);
    setActiveTab('form');
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsCreatingRule(false);
    setActiveTab('form');
  };

  const handleDeleteRule = (rule: Rule) => {
    // In a real application, this would make an API call
    toast({
      title: "Rule Deleted",
      description: `Rule ${rule.rule_id} has been deleted.`,
    });
    
    // Remove the rule from the UI
    setRules(rules.filter(r => r.rule_id !== rule.rule_id));
  };

  const handleSaveRule = (rule: Partial<Rule>) => {
    // In a real application, this would make an API call
    
    if (editingRule) {
      // Update existing rule
      const updatedRules = rules.map(r => 
        r.rule_id === editingRule.rule_id ? { ...r, ...rule } : r
      );
      setRules(updatedRules);
      toast({
        title: "Rule Updated",
        description: "The rule has been updated successfully.",
      });
    } else {
      // Create new rule
      const newRule = {
        ...rule,
        rule_id: `r${Date.now()}`, // Generate a temporary ID
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Rule;
      
      setRules([...rules, newRule]);
      toast({
        title: "Rule Created",
        description: "The new rule has been created successfully.",
      });
    }
    
    setEditingRule(null);
    setIsCreatingRule(false);
    setActiveTab('rules');
  };

  const handleCancelRuleForm = () => {
    setEditingRule(null);
    setIsCreatingRule(false);
    setActiveTab('rules');
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Policy Management System</h1>
        <p className="text-gray-600">Manage, create, and customize rules for different clients</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ClientSelector 
          clients={mockClients}
          selectedClient={selectedClient}
          onSelectClient={handleSelectClient}
        />
        
        <RuleTypeSelector
          ruleTypes={mockRuleTypes}
          selectedRuleType={selectedRuleType}
          onSelectRuleType={handleSelectRuleType}
        />
        
        <div className="flex items-end">
          <Button 
            onClick={handleCreateRule}
            disabled={!selectedClient}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            Create New Rule
          </Button>
        </div>
      </div>
      
      {selectedClient ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="rules" className="flex-1">Rules List</TabsTrigger>
            {(isCreatingRule || editingRule) && (
              <TabsTrigger value="form" className="flex-1">
                {isCreatingRule ? 'Create Rule' : 'Edit Rule'}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="rules">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedClient.client_name}'s Rules
                  {selectedRuleType && ` - ${selectedRuleType.name}`}
                </CardTitle>
                <CardDescription>
                  {rules.length} rule{rules.length !== 1 ? 's' : ''} found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RulesList 
                  rules={rules}
                  onEditRule={handleEditRule}
                  onDeleteRule={handleDeleteRule}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="form">
            {selectedClient && (isCreatingRule || editingRule) && (
              <RuleForm
                rule={editingRule || undefined}
                client={selectedClient}
                ruleTypes={mockRuleTypes}
                onSave={handleSaveRule}
                onCancel={handleCancelRuleForm}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10">
            <div className="text-center">
              <h3 className="text-lg font-medium mb-2">Select a Client</h3>
              <p className="text-gray-500 mb-6">
                Select a client from the dropdown above to manage their rules
              </p>
              <div className="inline-block">
                <ClientSelector 
                  clients={mockClients}
                  selectedClient={selectedClient}
                  onSelectClient={handleSelectClient}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Index;
