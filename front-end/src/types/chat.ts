export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

export interface ChatAIResponse {
    reply: string;
    plan?: any;
    suggestions?: string[];
}

export interface ChatRequest {
    message: string;
    context?: {
        currentPlan?: any;
        preferences?: any;
    };
}
