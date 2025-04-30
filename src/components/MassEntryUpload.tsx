
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rule, RuleType } from '../lib/types';
import { Upload, File, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MassEntryUploadProps {
  rules: Rule[];
  ruleTypes: RuleType[];
  onMassAdd: (ruleId: string, values: string[]) => void;
}

const MassEntryUpload = ({ rules, ruleTypes, onMassAdd }: MassEntryUploadProps) => {
  const { toast } = useToast();
  const [selectedRuleId, setSelectedRuleId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState<string>('phrases');
  const [parsedValues, setParsedValues] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedRule = rules.find(rule => rule.rule_id === selectedRuleId);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setParsedValues([]);
    }
  };

  const parseFile = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    if (!selectedRuleId) {
      toast({
        title: "No rule selected",
        description: "Please select a rule for mass entry",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await file.text();
      let values: string[] = [];
      
      // Check if it's a CSV file
      if (file.name.endsWith('.csv')) {
        // Split by lines
        const lines = text.split('\n');
        
        // Find the header row and locate the target column index
        const headers = lines[0].split(',').map(header => header.trim().toLowerCase());
        const tabHeaders = lines[0].split('\t').map(header => header.trim().toLowerCase());
        
        let columnIndex = -1;
        let delimiter = ',';
        
        // Check if it's comma-separated or tab-separated
        if (headers.includes(columnName.toLowerCase())) {
          columnIndex = headers.indexOf(columnName.toLowerCase());
          delimiter = ',';
        } else if (tabHeaders.includes(columnName.toLowerCase())) {
          columnIndex = tabHeaders.indexOf(columnName.toLowerCase());
          delimiter = '\t';
        }

        if (columnIndex === -1) {
          throw new Error(`Column "${columnName}" not found in the CSV file`);
        }

        // Extract values from the column
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) { // Skip empty lines
            const cells = lines[i].split(delimiter);
            if (cells[columnIndex] && cells[columnIndex].trim()) {
              values.push(cells[columnIndex].trim());
            }
          }
        }
      } else {
        // For regular text files, treat each line as a value
        values = text.split('\n')
          .map(line => line.trim())
          .filter(line => line.length > 0);
      }

      setParsedValues(values);
      toast({
        title: "File Parsed Successfully",
        description: `Found ${values.length} entries to add`,
      });
    } catch (error) {
      toast({
        title: "Error Parsing File",
        description: error instanceof Error ? error.message : "Failed to parse the file",
        variant: "destructive"
      });
      setParsedValues([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = () => {
    if (parsedValues.length > 0 && selectedRuleId) {
      onMassAdd(selectedRuleId, parsedValues);
      // Reset form after submission
      setFile(null);
      setParsedValues([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mass Entry Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="rule-select" className="text-sm font-medium">
            Select Rule
          </label>
          <Select
            value={selectedRuleId}
            onValueChange={setSelectedRuleId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a rule" />
            </SelectTrigger>
            <SelectContent>
              {rules.map(rule => (
                <SelectItem key={rule.rule_id} value={rule.rule_id}>
                  {Object.values(rule.inputs).join(' - ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="column-name" className="text-sm font-medium">
            Column Name (for CSV files)
          </label>
          <Input
            id="column-name"
            value={columnName}
            onChange={(e) => setColumnName(e.target.value)}
            placeholder="Column name (e.g., phrases)"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="file-upload" className="text-sm font-medium">
            Upload File (CSV or Text)
          </label>
          <div className="flex items-center gap-2">
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              onChange={handleFileChange}
              accept=".csv,.txt"
              className="flex-1"
            />
            <Button 
              onClick={parseFile} 
              disabled={!file || isProcessing}
              variant="outline"
            >
              <Upload className="h-4 w-4 mr-2" />
              Parse
            </Button>
          </div>
        </div>

        {parsedValues.length > 0 && (
          <div className="space-y-2 mt-4">
            <h3 className="text-sm font-medium">Preview ({parsedValues.length} entries)</h3>
            <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
              <ul className="list-disc pl-5">
                {parsedValues.slice(0, 5).map((value, index) => (
                  <li key={index} className="text-sm">{value}</li>
                ))}
                {parsedValues.length > 5 && (
                  <li className="text-sm text-gray-500">... and {parsedValues.length - 5} more</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit} 
          disabled={parsedValues.length === 0 || !selectedRuleId}
          className="w-full"
        >
          <Check className="h-4 w-4 mr-2" />
          Add {parsedValues.length} Entries to Rule
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MassEntryUpload;
