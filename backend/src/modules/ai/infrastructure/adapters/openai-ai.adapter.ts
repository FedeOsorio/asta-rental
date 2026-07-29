import { AiAgentPort, MaintenanceTicketClassification } from '../../domain/ports/ai-agent.port.js';

export class OpenAiAdapter implements AiAgentPort {
  // In a real scenario, you would initialize the OpenAI client here
  // private openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateOverdueNotice(_renterName: string, _amount: string, _dueDate: string): Promise<string> {
    throw new Error('OpenAI API not implemented in demo portfolio mode. Please use MockAiAdapter.');
    
    /* 
    const prompt = `Escribe un aviso de cobro formal para ${_renterName}. Debe $${_amount} que venció el ${_dueDate}. Sé educado pero firme.`;
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }]
    });
    return response.choices[0].message.content || '';
    */
  }

  async classifyMaintenanceTicket(_text: string): Promise<MaintenanceTicketClassification> {
    throw new Error('OpenAI API not implemented in demo portfolio mode. Please use MockAiAdapter.');

    /*
    const prompt = `Clasifica el siguiente reclamo de mantenimiento: "${text}". 
    Devuelve un JSON estricto con dos claves: 
    "urgency" (puede ser 'low', 'medium', 'high', 'critical')
    "category" (puede ser 'plumbing', 'electrical', 'gas', 'structural', 'other')`;
    
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: "json_object" },
      messages: [{ role: 'user', content: prompt }]
    });
    
    return JSON.parse(response.choices[0].message.content || '{}') as MaintenanceTicketClassification;
    */
  }
}
