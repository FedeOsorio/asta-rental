export interface MaintenanceTicketClassification {
  urgency: 'low' | 'medium' | 'high' | 'critical';
  category: 'plumbing' | 'electrical' | 'gas' | 'structural' | 'other';
}

export interface AiAgentPort {
  generateOverdueNotice(renterName: string, amount: string, dueDate: string): Promise<string>;
  classifyMaintenanceTicket(text: string): Promise<MaintenanceTicketClassification>;
}
