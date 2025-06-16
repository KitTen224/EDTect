'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface ChatMessage {
    id: string;
    content: string;
    role: 'user' | 'assistant';
    timestamp: Date;
}

interface SimpleChatProps {
    currentPlan?: any;
    onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
    '他の地域を提案してほしい',
    '予算を変更して新しいプランを作って', 
    '3日目だけ観光地を変えて',
    '全体をもっとのんびりスケジュールにして',
    '温泉が多いプランに変更して',
    '食べ歩きメインのプランを作って'
];

export default function SimpleChat({ currentPlan, onClose }: SimpleChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Welcome message when first opened
        const welcomeMessage: ChatMessage = {
            id: Date.now().toString(),
            content: 'こんにちは！日本旅行プランについて何でもお聞きください。下記の質問例を参考にしていただくか、自由にご質問ください。',
            role: 'assistant',
            timestamp: new Date()
        };
        setMessages([welcomeMessage]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (message: string) => {
        if (!message.trim()) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            content: message,
            role: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Mock API call - replace with real API later
            setTimeout(() => {
                const aiResponse: ChatMessage = {
                    id: (Date.now() + 1).toString(),
                    content: `ご質問ありがとうございます！「${message}」について回答いたします。\n\n現在はDemo版のため、実際のAI機能は実装中です。近日中に以下の機能が利用可能になります：\n\n• 旅程の詳細カスタマイズ\n• 地域や観光地の変更提案\n• 予算に応じたプラン調整\n• リアルタイムでの計画修正\n\nしばらくお待ちください！`,
                    role: 'assistant',
                    timestamp: new Date()
                };
                
                setMessages(prev => [...prev, aiResponse]);
                setIsLoading(false);
            }, 1500);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputMessage(question);
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '120px',
                right: '30px',
                zIndex: 999999,
                width: '400px',
                maxWidth: '90vw',
                height: '600px',
                maxHeight: '80vh',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                border: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div 
                style={{
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bot size={20} />
                    <span style={{ fontWeight: '600' }}>AIチャット</span>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '4px'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div 
                style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                }}
            >
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            display: 'flex',
                            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
                        }}
                    >
                        <div
                            style={{
                                maxWidth: '80%',
                                borderRadius: '12px',
                                padding: '12px',
                                backgroundColor: message.role === 'user' ? '#dc2626' : '#f3f4f6',
                                color: message.role === 'user' ? 'white' : '#374151'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                {message.role === 'assistant' && (
                                    <Bot size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                )}
                                {message.role === 'user' && (
                                    <User size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                )}
                                <span style={{ fontSize: '14px', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
                                    {message.content}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                        <div
                            style={{
                                backgroundColor: '#f3f4f6',
                                borderRadius: '12px',
                                padding: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Bot size={16} />
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'pulse 1.5s infinite' }}></div>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.1s' }}></div>
                                <div style={{ width: '8px', height: '8px', backgroundColor: '#9ca3af', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length <= 1 && (
                <div style={{ padding: '0 16px 8px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                        よくある質問:
                    </div>
                    <div style={{ display: 'grid', gap: '4px' }}>
                        {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestedQuestion(question)}
                                style={{
                                    fontSize: '12px',
                                    textAlign: 'left',
                                    padding: '8px',
                                    backgroundColor: '#f9fafb',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '6px',
                                    color: '#374151',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f9fafb';
                                }}
                            >
                                {question}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div 
                style={{
                    padding: '16px',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    gap: '8px'
                }}
            >
                <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                    placeholder="旅程の相談や変更はチャットでAIにお任せください"
                    style={{
                        flex: 1,
                        padding: '12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'border-color 0.2s'
                    }}
                    onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#dc2626';
                    }}
                    onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#d1d5db';
                    }}
                />
                <button
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isLoading}
                    style={{
                        backgroundColor: inputMessage.trim() && !isLoading ? '#dc2626' : '#9ca3af',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '12px',
                        cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.2s'
                    }}
                >
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
}
