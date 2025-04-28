
import { Rule, RuleType } from '../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface RuleCardProps {
  rule: Rule;
  ruleType?: RuleType;
  onEdit: (rule: Rule) => void;
  onDelete: (rule: Rule) => void;
}

const RuleCard = ({ rule, ruleType, onEdit, onDelete }: RuleCardProps) => {
  const isGlobalRule = rule.project_id === 999;
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={`border-l-4 ${isGlobalRule ? 'border-l-blue-500' : 'border-l-gray-300'}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold">
            {ruleType?.name || `Rule Type ${rule.ruletype_id}`}
            {isGlobalRule && (
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-300">
                Global Rule
              </Badge>
            )}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            v{rule.version}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium">Statement</p>
          <p className="text-gray-700">{rule.statement}</p>
        </div>
        
        <div>
          <p className="font-medium">Inputs</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {Object.entries(rule.inputs).map(([key, value]) => (
              <Badge key={key} variant="secondary" className="text-xs">
                {key}: {value}
              </Badge>
            ))}
          </div>
        </div>
        
        {rule.rule_description && (
          <div>
            <p className="font-medium">Description</p>
            <p className="text-gray-700">{rule.rule_description}</p>
          </div>
        )}
        
        {rule.regex && (
          <div>
            <p className="font-medium">Regex</p>
            <code className="bg-gray-100 p-1 rounded text-sm">{rule.regex}</code>
          </div>
        )}
        
        <Separator />
        
        <div className="flex justify-between text-sm text-gray-500">
          <div>
            Valid: {formatDate(rule.valid_from)} to {formatDate(rule.valid_till)}
          </div>
          <div>
            ID: {rule.rule_id}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(rule)}>
          <Edit className="h-4 w-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(rule)}>
          <Trash2 className="h-4 w-4 mr-1" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RuleCard;
