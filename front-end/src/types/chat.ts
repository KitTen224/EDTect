export interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
    reused?: boolean;
}

export interface ChatAIResponse {
    reply: string;
    plan?: any;
    suggestions?: string[];
    reused?: boolean;
}

export interface ChatRequest {
    message: string;
    context?: {
        currentPlan?: any;
        preferences?: any;
    };
}
