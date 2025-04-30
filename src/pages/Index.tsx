import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ClientSelector from '@/components/ClientSelector';
import RuleTypeSelector from '@/components/RuleTypeSelector';
import RulesList from '@/components/RulesList';
import RuleForm from '@/components/RuleForm';
import RuleTypeManager from '@/components/RuleTypeManager';
import MassEntryUpload from '@/components/MassEntryUpload';
import { mockClients, mockRuleTypes, fetchRules } from '@/data/mockData';
import { Client, Rule, RuleType } from '@/lib/types';
import { Plus, Settings, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(null);
  const [rules, setRules] = useState<Rule[]>([]);
  const [ruleTypes, setRuleTypes] = useState<RuleType[]>(mockRuleTypes);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [showRuleTypeManager, setShowRuleTypeManager] = useState(false);
  const [showMassEntry, setShowMassEntry] = useState(false);
  
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
    setShowRuleTypeManager(false);
    setShowMassEntry(false);
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
    setShowRuleTypeManager(false);
    setShowMassEntry(false);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsCreatingRule(false);
    setActiveTab('form');
    setShowRuleTypeManager(false);
    setShowMassEntry(false);
  };

  const handleDeleteRule = (rule: Rule) => {
    toast({
      title: "Rule Deleted",
      description: `Rule ${rule.rule_id} has been deleted.`,
    });
    
    setRules(rules.filter(r => r.rule_id !== rule.rule_id));
  };

  const handleSaveRule = (rule: Partial<Rule>) => {
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

  const handleAddRuleType = (newRuleType: Omit<RuleType, 'ruletype_id'>) => {
    const nextId = Math.max(...ruleTypes.map(rt => rt.ruletype_id)) + 1;
    const ruleType = {
      ...newRuleType,
      ruletype_id: nextId
    };
    setRuleTypes([...ruleTypes, ruleType]);
  };

  const handleDeleteRuleType = (ruleTypeId: number) => {
    setRuleTypes(ruleTypes.filter(rt => rt.ruletype_id !== ruleTypeId));
    
    // If the currently selected rule type is deleted, reset the selection
    if (selectedRuleType && selectedRuleType.ruletype_id === ruleTypeId) {
      setSelectedRuleType(null);
    }
  };

  const handleToggleRuleTypeManager = () => {
    setShowRuleTypeManager(!showRuleTypeManager);
    setShowMassEntry(false);
    if (!showRuleTypeManager) {
      setIsCreatingRule(false);
      setEditingRule(null);
      setActiveTab('settings');
    } else {
      setActiveTab('rules');
    }
  };

  const handleToggleMassEntry = () => {
    setShowMassEntry(!showMassEntry);
    setShowRuleTypeManager(false);
    if (!showMassEntry) {
      setIsCreatingRule(false);
      setEditingRule(null);
      setActiveTab('mass-entry');
    } else {
      setActiveTab('rules');
    }
  };

  const handleMassAdd = (ruleTypeId: number, values: Record<string, string>[]) => {
    // This would be where you would normally send the data to an API
    if (!values || values.length === 0) {
      toast({
        title: "No Data",
        description: "No data to add",
        variant: "destructive"
      });
      return;
    }
    
    // Find the rule type name for the success message
    const ruleType = ruleTypes.find(rt => rt.ruletype_id === ruleTypeId);
    
    // Generate new rules based on the imported data
    const newRules = values.map(value => {
      return {
        rule_id: `r${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        project_id: selectedClient?.project_id || 0,
        category_id: 1, // Default category
        ruletype_id: ruleTypeId,
        inputs: value,
        version: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Rule;
    });
    
    // Add the new rules to the rules array
    setRules([...rules, ...newRules]);
    
    toast({
      title: "Mass Entry Successful",
      description: `Added ${values.length} entries to ${ruleType?.name || 'selected rule type'}`,
      variant: "default"
    });
    
    // Switch back to rules view to show the new rules
    setActiveTab('rules');
    setShowMassEntry(false);
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
          ruleTypes={ruleTypes}
          selectedRuleType={selectedRuleType}
          onSelectRuleType={handleSelectRuleType}
        />
        
        <div className="flex items-end gap-2">
          <Button 
            onClick={handleCreateRule}
            disabled={!selectedClient}
            className="flex-1"
          >
            <Plus className="mr-2 h-4 w-4" /> 
            Create Rule
          </Button>
          <Button 
            variant="outline"
            onClick={handleToggleMassEntry}
            disabled={!selectedClient}
            className="flex-shrink-0"
          >
            <File className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline"
            onClick={handleToggleRuleTypeManager}
            className="flex-shrink-0"
          >
            <Settings className="h-4 w-4" />
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
            {showMassEntry && (
              <TabsTrigger value="mass-entry" className="flex-1">
                Mass Entry Upload
              </TabsTrigger>
            )}
            {showRuleTypeManager && (
              <TabsTrigger value="settings" className="flex-1">
                Manage Rule Types
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
                ruleTypes={ruleTypes}
                onSave={handleSaveRule}
                onCancel={handleCancelRuleForm}
              />
            )}
          </TabsContent>
          
          <TabsContent value="mass-entry">
            {showMassEntry && (
              <MassEntryUpload
                rules={rules}
                ruleTypes={ruleTypes}
                onMassAdd={handleMassAdd}
              />
            )}
          </TabsContent>
          
          <TabsContent value="settings">
            {showRuleTypeManager && (
              <RuleTypeManager
                ruleTypes={ruleTypes}
                rules={rules}
                clientId={selectedClient?.project_id}
                onAddRuleType={handleAddRuleType}
                onDeleteRuleType={handleDeleteRuleType}
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
