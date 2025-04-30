
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Rule, RuleType } from '../lib/types';
import { Upload, Check, Plus, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface MassEntryUploadProps {
  rules: Rule[];
  ruleTypes: RuleType[];
  onMassAdd: (ruleTypeId: number, values: Record<string, string>[]) => void;
}

const MassEntryUpload = ({ rules, ruleTypes, onMassAdd }: MassEntryUploadProps) => {
  const { toast } = useToast();
  const [selectedRuleTypeId, setSelectedRuleTypeId] = useState<string>(ruleTypes.length > 0 ? ruleTypes[0].ruletype_id.toString() : '');
  const [file, setFile] = useState<File | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [newColumn, setNewColumn] = useState<string>('');
  const [parsedValues, setParsedValues] = useState<Record<string, string>[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const selectedRuleType = ruleTypes.find(rt => rt.ruletype_id.toString() === selectedRuleTypeId);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setParsedValues([]);
      setAvailableColumns([]);
      setSelectedColumns([]);
      
      // Auto-parse the file on selection
      parseFile(selectedFile);
    }
  };

  const detectDelimiterAndHeaders = (text: string): { delimiter: string, headers: string[] } => {
    // Check for common delimiters
    const firstLine = text.split('\n')[0];
    
    // Try to detect the delimiter
    let delimiter = ','; // Default to comma
    if (firstLine.includes('\t') && firstLine.split('\t').length > 1) {
      delimiter = '\t';
    } else if (firstLine.includes(',') && firstLine.split(',').length > 1) {
      delimiter = ',';
    } else if (firstLine.includes(';') && firstLine.split(';').length > 1) {
      delimiter = ';';
    } else if (firstLine.includes('|') && firstLine.split('|').length > 1) {
      delimiter = '|';
    }
    
    // Get headers
    const headers = firstLine.split(delimiter).map(h => h.trim());
    
    return { delimiter, headers };
  };

  const parseFile = async (fileToProcess?: File) => {
    const fileToUse = fileToProcess || file;
    
    if (!fileToUse) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const text = await fileToUse.text();
      
      // Detect delimiter and headers
      const { delimiter, headers } = detectDelimiterAndHeaders(text);
      
      // Set available columns from headers
      const validHeaders = headers.filter(h => h !== '');
      setAvailableColumns(validHeaders);
      
      // Auto-select all available columns
      setSelectedColumns(validHeaders);
      
      // Parse data rows
      const lines = text.split('\n');
      const parsedData: Record<string, string>[] = [];
      
      // Start from second line (index 1) to skip headers
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) { // Skip empty lines
          const cells = lines[i].split(delimiter);
          const rowData: Record<string, string> = {};
          
          // Map values to their column names
          headers.forEach((header, index) => {
            if (header.trim()) { // Avoid empty headers
              rowData[header.trim()] = (cells[index] || '').trim();
            }
          });
          
          parsedData.push(rowData);
        }
      }
      
      setParsedValues(parsedData);
      
      toast({
        title: "File Parsed Successfully",
        description: `Found ${parsedData.length} rows with ${validHeaders.length} columns`,
        variant: "default"
      });
    } catch (error) {
      toast({
        title: "Error Parsing File",
        description: error instanceof Error ? error.message : "Failed to parse the file",
        variant: "destructive"
      });
      setParsedValues([]);
      setAvailableColumns([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddColumn = () => {
    if (newColumn && !selectedColumns.includes(newColumn)) {
      setSelectedColumns([...selectedColumns, newColumn]);
      setNewColumn('');
    }
  };

  const handleRemoveColumn = (column: string) => {
    setSelectedColumns(selectedColumns.filter(c => c !== column));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (parsedValues.length > 0 && selectedRuleTypeId && selectedColumns.length > 0) {
      // Convert selectedRuleTypeId to a number
      const ruleTypeId = parseInt(selectedRuleTypeId);
      
      // Only include selected columns in the data
      const filteredData = parsedValues.map(row => {
        const filteredRow: Record<string, string> = {};
        selectedColumns.forEach(col => {
          if (col in row) {
            filteredRow[col] = row[col];
          }
        });
        return filteredRow;
      });
      
      onMassAdd(ruleTypeId, filteredData);
      
      toast({
        title: "Success",
        description: `Added ${filteredData.length} entries to selected rule type`,
        variant: "default" 
      });
      
      // Reset form after submission
      setFile(null);
      setParsedValues([]);
      setSelectedColumns([]);
      setAvailableColumns([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      if (!selectedRuleTypeId) {
        toast({
          title: "No Rule Type Selected",
          description: "Please select a rule type for mass entry",
          variant: "destructive"
        });
      } else if (selectedColumns.length === 0) {
        toast({
          title: "No Columns Selected",
          description: "Please select at least one column to import",
          variant: "destructive"
        });
      } else if (parsedValues.length === 0) {
        toast({
          title: "No Data Available",
          description: "Please upload and parse a file first",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Mass Entry Upload</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="ruletype-select" className="text-sm font-medium">
              Select Rule Type
            </label>
            <Select
              value={selectedRuleTypeId}
              onValueChange={setSelectedRuleTypeId}
            >
              <SelectTrigger>
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
            <label htmlFor="file-upload" className="text-sm font-medium">
              Upload File (CSV, TSV, or Text)
            </label>
            <div className="flex items-center gap-2">
              <Input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                accept=".csv,.tsv,.txt,text/plain,text/csv"
                className="flex-1"
              />
              <Button 
                type="button"
                onClick={() => parseFile()}
                disabled={!file || isProcessing}
                variant="outline"
              >
                <Upload className="h-4 w-4 mr-2" />
                Parse
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Supports files with or without extensions. The first row should contain column headers.
            </p>
          </div>

          {availableColumns.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Columns to Import
              </label>
              <div className="flex items-center gap-2 mb-2">
                <Select
                  value={newColumn}
                  onValueChange={setNewColumn}
                  disabled={availableColumns.length === selectedColumns.length}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a column" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableColumns
                      .filter(col => !selectedColumns.includes(col))
                      .map((column) => (
                        <SelectItem key={column} value={column}>
                          {column}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button 
                  type="button"
                  onClick={handleAddColumn} 
                  disabled={!newColumn || availableColumns.length === selectedColumns.length}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {selectedColumns.map(column => (
                  <Badge key={column} variant="secondary" className="flex items-center gap-1">
                    {column}
                    <button 
                      type="button"
                      onClick={() => handleRemoveColumn(column)} 
                      className="text-gray-500 hover:text-gray-700 ml-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {parsedValues.length > 0 && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium">Preview ({parsedValues.length} rows)</h3>
              <div className="max-h-40 overflow-y-auto border rounded p-2 bg-gray-50">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {selectedColumns.map(col => (
                        <th key={col} className="px-2 py-1 text-left font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedValues.slice(0, 5).map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {selectedColumns.map(col => (
                          <td key={`${rowIndex}-${col}`} className="px-2 py-1 border-t">
                            {col in row ? row[col] : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {parsedValues.length > 5 && (
                      <tr>
                        <td colSpan={selectedColumns.length} className="px-2 py-1 text-gray-500 border-t">
                          ... and {parsedValues.length - 5} more rows
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button 
            type="submit"
            disabled={parsedValues.length === 0 || !selectedRuleTypeId || selectedColumns.length === 0}
            className="w-full"
          >
            <Check className="h-4 w-4 mr-2" />
            Add {parsedValues.length} Entries to Rule Type
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MassEntryUpload;
