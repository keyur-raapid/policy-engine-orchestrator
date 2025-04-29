
export interface Client {
  client_id: number;
  client_name: string;
  project_id: number;
}

export interface RuleType {
  ruletype_id: number;
  name: string;
  customFields?: CustomField[];
}

export interface CustomField {
  key: string;
  label: string;
  type: 'string' | 'icdCode';
  required?: boolean;
}

export interface RuleInput {
  [key: string]: string | number | boolean;
}

export interface Rule {
  rule_id: string;
  project_id: number;
  category_id: number;
  ruletype_id: number;
  inputs: RuleInput;
  statement?: string;
  rule_description?: string;
  regex?: string;
  valid_from?: string;
  valid_till?: string;
  version: number;
  created_at?: string;
  updated_at?: string;
}

export interface Version {
  version_id: number;
  rule_id: string;
  data: Rule;
  changed_by: string;
  changed_at: string;
}
