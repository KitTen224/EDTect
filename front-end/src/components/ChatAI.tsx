'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ChatMessage, ChatAIResponse } from '@/types/chat';

interface ChatAIProps {
    currentPlan?: any;
    onPlanUpdate?: (newPlan: any) => void;
}

const SUGGESTED_QUESTIONS = [
    '他の地域を提案してほしい',
    '予算を変更して新しいプランを作って', 
    '3日目だけ観光地を変えて',
    '全体をもっとのんびりスケジュールにして',
    '温泉が多いプランに変更して',
    '食べ歩きメインのプランを作って'
];

export default function ChatAI({ currentPlan, onPlanUpdate }: ChatAIProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatBoxRef = useRef<HTMLDivElement>(null);

    // Debug log
    useEffect(() => {
        console.log('🤖 ChatAI component mounted');
        console.log('🤖 Current isOpen state:', isOpen);
        console.log('🤖 DOM check - looking for chat button...');
        
        // Check if button exists in DOM
        setTimeout(() => {
            const buttons = document.querySelectorAll('[data-chat-button]');
            console.log('🤖 Found chat buttons:', buttons.length);
            
            const testButtons = document.querySelectorAll('[data-test-button]');
            console.log('🧪 Found test buttons:', testButtons.length);
        }, 1000);
    }, []);

    useEffect(() => {
        console.log('🤖 isOpen changed to:', isOpen);
    }, [isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            // Welcome message when first opened
            const welcomeMessage: ChatMessage = {
                id: Date.now().toString(),
                content: 'こんにちは！日本旅行プランについて何でもお聞きください。下記の質問例を参考にしていただくか、自由にご質問ください。',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen]);    const handleSendMessage = async (message: string) => {
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
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    context: {
                        currentPlan,
                        preferences: {}
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('APIエラーが発生しました');
            }

            const aiResponse: ChatAIResponse = await response.json();
            
            const assistantMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: aiResponse.reply,
                role: 'assistant',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);

            // If AI returns a new plan, offer to update
            if (aiResponse.plan && onPlanUpdate) {
                const confirmMessage: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    content: '新しいプランを作成しました。このプランに変更しますか？\n\n「このプランで決定」をクリックして適用してください。',
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, confirmMessage]);
            }

            // Add suggested questions if available
            if (aiResponse.suggestions && aiResponse.suggestions.length > 0) {
                const suggestionsMessage: ChatMessage = {
                    id: (Date.now() + 3).toString(),
                    content: 'こちらもご参考ください：\n' + aiResponse.suggestions.map(s => `• ${s}`).join('\n'),
                    role: 'assistant',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, suggestionsMessage]);
            }

        } catch (error) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
                role: 'assistant',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };    const handleSuggestedQuestion = (question: string) => {
        setInputMessage(question);
    };

    const handleDragStart = (e: React.MouseEvent) => {
        setIsDragging(true);
        const rect = chatBoxRef.current?.getBoundingClientRect();
        if (rect) {
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            
            const handleMouseMove = (e: MouseEvent) => {
                setPosition({
                    x: e.clientX - offsetX,
                    y: e.clientY - offsetY
                });
            };

            const handleMouseUp = () => {
                setIsDragging(false);
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
    };    return (
        <div style={{ position: 'relative', zIndex: 1 }}>
            {/* SUPER SIMPLE TEST BUTTON - SHOULD ALWAYS BE VISIBLE */}
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 9999999,
                    backgroundColor: '#ff0000',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    width: '70px',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '30px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    border: '3px solid white'
                }}
                onClick={() => {
                    console.log('🤖 SUPER SIMPLE Chat button clicked!');
                    alert('SUPER SIMPLE Chat button works!');
                    setIsOpen(true);
                }}
                title="AIチャットを開く"
            >
                💬
            </div>

            {/* Test Button - Always Visible for Debugging */}
            <div
                data-test-button="true"
                className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded cursor-pointer text-sm font-bold"
                style={{ 
                    zIndex: 999999,
                    position: 'fixed',
                    top: '16px',
                    right: '16px'
                }}
                onClick={() => {
                    console.log('🧪 Test button clicked!');
                    alert('Test button works! Chat AI should be visible at bottom-right corner.');
                }}
            >
                TEST CHAT
            </div>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatBoxRef}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        style={{
                            position: 'fixed',
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            zIndex: 1000
                        }}
                        className="w-96 max-w-[90vw] h-[500px] max-h-[80vh] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col"
                    >
                        {/* Header */}
                        <div 
                            className="bg-red-600 text-white p-4 rounded-t-xl flex items-center justify-between cursor-move"
                            onMouseDown={handleDragStart}
                        >
                            <div className="flex items-center gap-2">
                                <Bot className="w-5 h-5" />
                                <span className="font-medium">AIチャット</span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-gray-200 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 ${
                                            message.role === 'user'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {message.role === 'assistant' && (
                                                <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            )}
                                            {message.role === 'user' && (
                                                <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            )}
                                            <div>
                                                <span className="text-sm whitespace-pre-line">{message.content}</span>
                                                {/* Show confirm button for plan updates */}
                                                {message.role === 'assistant' && 
                                                 message.content.includes('このプランで決定') && (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={() => {
                                                                if (onPlanUpdate) {
                                                                    onPlanUpdate({ timeline: currentPlan });
                                                                }
                                                                const confirmMsg: ChatMessage = {
                                                                    id: Date.now().toString(),
                                                                    content: 'プランが適用されました！',
                                                                    role: 'assistant',
                                                                    timestamp: new Date()
                                                                };
                                                                setMessages(prev => [...prev, confirmMsg]);
                                                            }}
                                                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-colors"
                                                        >
                                                            このプランで決定
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-4 h-4" />
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {messages.length <= 1 && (
                            <div className="px-4 pb-2">
                                <div className="text-xs text-gray-600 mb-2">よくある質問:</div>
                                <div className="grid grid-cols-1 gap-1">
                                    {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="text-xs text-left p-2 bg-gray-50 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 border-t border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
                                    placeholder="旅程の相談や変更はチャットでAIにお任せください"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                                />
                                <button
                                    onClick={() => handleSendMessage(inputMessage)}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                        </div>                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
