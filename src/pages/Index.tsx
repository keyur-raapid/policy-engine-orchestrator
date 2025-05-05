
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
import { Client, Rule, RuleType } from '@/lib/types';
import { Plus, Settings, File } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchClients, 
  fetchRuleTypes, 
  fetchRulesForClient, 
  createRule, 
  updateRule,
  deleteRule,
  addRuleType,
  deleteRuleType
} from '@/services/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Index = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedRuleType, setSelectedRuleType] = useState<RuleType | null>(null);
  const [isCreatingRule, setIsCreatingRule] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [activeTab, setActiveTab] = useState('rules');
  const [showRuleTypeManager, setShowRuleTypeManager] = useState(false);
  const [showMassEntry, setShowMassEntry] = useState(false);
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Active Tab:", activeTab);
    console.log("Is Creating Rule:", isCreatingRule);
  }, [activeTab, isCreatingRule]);
  
  // Fetch clients data
  const { 
    data: clients = [], 
    isLoading: isLoadingClients 
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });
  
  // Fetch rule types data
  const {
    data: ruleTypes = [],
    isLoading: isLoadingRuleTypes
  } = useQuery({
    queryKey: ['ruleTypes'],
    queryFn: fetchRuleTypes
  });
  
  // Fetch rules data based on selected client and rule type
  const {
    data: rules = [],
    isLoading: isLoadingRules
  } = useQuery({
    queryKey: ['rules', selectedClient?.project_id, selectedRuleType?.ruletype_id],
    queryFn: () => selectedClient ? fetchRulesForClient(
      selectedClient.project_id,
      selectedRuleType ? selectedRuleType.ruletype_id : undefined
    ) : [],
    enabled: !!selectedClient
  });
  
  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: "Rule Created",
        description: "The new rule has been created successfully.",
      });
      setEditingRule(null);
      setIsCreatingRule(false);
      setActiveTab('rules');
    },
    onError: (error) => {
      toast({
        title: "Error Creating Rule",
        description: `${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: updateRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: "Rule Updated",
        description: "The rule has been updated successfully.",
      });
      setEditingRule(null);
      setIsCreatingRule(false);
      setActiveTab('rules');
    },
    onError: (error) => {
      toast({
        title: "Error Updating Rule",
        description: `${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: deleteRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      toast({
        title: "Rule Deleted",
        description: "Rule has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Rule",
        description: `${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Add rule type mutation
  const addRuleTypeMutation = useMutation({
    mutationFn: addRuleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ruleTypes'] });
      toast({
        title: "Rule Type Added",
        description: "New rule type has been created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adding Rule Type",
        description: `${error}`,
        variant: "destructive"
      });
    }
  });
  
  // Delete rule type mutation
  const deleteRuleTypeMutation = useMutation({
    mutationFn: deleteRuleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ruleTypes'] });
      toast({
        title: "Rule Type Deleted",
        description: "Rule type has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Deleting Rule Type",
        description: `${error}`,
        variant: "destructive"
      });
    }
  });

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
    
    // Add this line for debugging
    console.log("Create Rule button clicked, setting activeTab to 'form'");
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setIsCreatingRule(false);
    setActiveTab('form');
    setShowRuleTypeManager(false);
    setShowMassEntry(false);
  };

  const handleDeleteRule = (rule: Rule) => {
    deleteRuleMutation.mutate(rule.rule_id);
  };

  const handleSaveRule = (rule: Partial<Rule>) => {
    if (editingRule) {
      // Update existing rule
      updateRuleMutation.mutate({
        ...editingRule,
        ...rule
      } as Rule);
    } else {
      // Create new rule
      createRuleMutation.mutate({
        ...rule,
        version: 1,
      } as Omit<Rule, 'rule_id'>);
    }
  };

  const handleCancelRuleForm = () => {
    setEditingRule(null);
    setIsCreatingRule(false);
    setActiveTab('rules');
  };

  const handleAddRuleType = (newRuleType: Omit<RuleType, 'ruletype_id'>) => {
    addRuleTypeMutation.mutate(newRuleType);
  };

  const handleDeleteRuleType = (ruleTypeId: number) => {
    deleteRuleTypeMutation.mutate(ruleTypeId);
    
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

  const handleMassAdd = async (ruleTypeId: number, values: Record<string, string>[]) => {
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
    
    try {
      // Create an array of promises for all rules to be created
      const createPromises = values.map(value => {
        const newRule = {
          project_id: selectedClient?.project_id || 0,
          category_id: 1, // Default category
          ruletype_id: ruleTypeId,
          inputs: value,
          version: 1,
        } as Omit<Rule, 'rule_id'>;
        
        return createRule(newRule);
      });
      
      // Wait for all rules to be created
      await Promise.all(createPromises);
      
      // Invalidate the rules query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['rules'] });
      
      toast({
        title: "Mass Entry Successful",
        description: `Added ${values.length} entries to ${ruleType?.name || 'selected rule type'}`,
        variant: "default"
      });
      
      // Switch back to rules view to show the new rules
      setActiveTab('rules');
      setShowMassEntry(false);
    } catch (error) {
      toast({
        title: "Error Adding Rules",
        description: `${error}`,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Policy Management System</h1>
        <p className="text-gray-600">Manage, create, and customize rules for different clients</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <ClientSelector 
          clients={clients}
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
      
      {isLoadingClients ? (
        <Card>
          <CardContent className="flex justify-center items-center p-10">
            <p>Loading clients...</p>
          </CardContent>
        </Card>
      ) : selectedClient ? (
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
                  {isLoadingRules ? 'Loading...' : `${rules.length} rule${rules.length !== 1 ? 's' : ''} found`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingRules ? (
                  <p>Loading rules...</p>
                ) : (
                  <RulesList 
                    rules={rules}
                    onEditRule={handleEditRule}
                    onDeleteRule={handleDeleteRule}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="form">
            {selectedClient && (
              <RuleForm
                rule={editingRule || undefined}
                client={selectedClient}
                ruleTypes={ruleTypes}
                rules={rules}
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
                  clients={clients}
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
