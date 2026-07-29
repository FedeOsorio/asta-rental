import { AiAgentPort, MaintenanceTicketClassification } from '../../domain/ports/ai-agent.port.js';

export class MockAiAdapter implements AiAgentPort {
  async generateOverdueNotice(renterName: string, amount: string, dueDate: string): Promise<string> {
    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `Estimado/a ${renterName},

Nos dirigimos a usted para recordarle que su pago por el monto de $${amount}, correspondiente al vencimiento del ${dueDate}, se encuentra actualmente atrasado.

Le solicitamos que regularice su situación a la brevedad para evitar la aplicación de recargos por mora.
Si ya realizó el pago, por favor desestime este mensaje.

Atentamente,
Administración.`;
  }

  async classifyMaintenanceTicket(text: string): Promise<MaintenanceTicketClassification> {
    // Simulate AI thinking time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const lowerText = text.toLowerCase();

    // Mock logic based on keywords
    if (lowerText.includes('fuego') || lowerText.includes('inundación') || lowerText.includes('gas')) {
      return { urgency: 'critical', category: 'gas' };
    }
    
    if (lowerText.includes('caño') || lowerText.includes('agua') || lowerText.includes('humedad')) {
      return { urgency: 'medium', category: 'plumbing' };
    }

    if (lowerText.includes('luz') || lowerText.includes('electricidad') || lowerText.includes('cortocircuito')) {
      return { urgency: 'high', category: 'electrical' };
    }

    if (lowerText.includes('pared') || lowerText.includes('techo') || lowerText.includes('grieta')) {
      return { urgency: 'high', category: 'structural' };
    }

    return { urgency: 'low', category: 'other' };
  }
}
