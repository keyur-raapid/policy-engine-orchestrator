
import { useState } from 'react';
import { Client } from '../lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ClientSelectorProps {
  clients: Client[];
  selectedClient: Client | null;
  onSelectClient: (client: Client) => void;
}

const ClientSelector = ({ clients, selectedClient, onSelectClient }: ClientSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="client-select">Client</Label>
      <Select
        value={selectedClient ? selectedClient.client_id.toString() : ''}
        onValueChange={(value) => {
          const client = clients.find(c => c.client_id.toString() === value);
          if (client) {
            onSelectClient(client);
          }
        }}
      >
        <SelectTrigger id="client-select" className="w-full">
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.client_id} value={client.client_id.toString()}>
              {client.client_name} (Project ID: {client.project_id})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
