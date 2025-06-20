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
        <div className="relative z-10">
            {/* Chat Trigger Button - Redesigned to match app style */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                    console.log('🤖 Chat button clicked!');
                    setIsOpen(true);
                }}
                className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
                title="AIチャットを開く"
                data-chat-button="true"
            >
                <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
                
                {/* Notification dot for new features */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full border-2 border-white"></div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={chatBoxRef}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            left: `${position.x}px`,
                            top: `${position.y}px`,
                            zIndex: 1000
                        }}
                        className="w-96 max-w-[90vw] h-[500px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden backdrop-blur-sm"
                    >
                        {/* Header */}
                        <div 
                            className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between cursor-move"
                            onMouseDown={handleDragStart}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="font-light text-lg">AIチャット</h3>
                                    <p className="text-xs text-red-100">旅程の相談・変更</p>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-2xl p-4 ${
                                            message.role === 'user'
                                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                                                : 'bg-white text-gray-800 shadow-md border border-gray-100'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            {message.role === 'assistant' && (
                                                <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <Bot className="w-3 h-3 text-red-600" />
                                                </div>
                                            )}
                                            {message.role === 'user' && (
                                                <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                                                    <User className="w-3 h-3" />
                                                </div>
                                            )}
                                            <div>
                                                <span className="text-sm leading-relaxed whitespace-pre-line">{message.content}</span>
                                                {/* Show confirm button for plan updates */}
                                                {message.role === 'assistant' && 
                                                 message.content.includes('このプランで決定') && (
                                                    <div className="mt-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
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
                                                            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
                                                        >
                                                            このプランで決定
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            
                            {isLoading && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                                                <Bot className="w-3 h-3 text-red-600" />
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Suggested Questions */}
                        {messages.length <= 1 && (
                            <div className="px-6 pb-4">
                                <div className="text-xs font-medium text-gray-500 mb-3">💡 よくある質問:</div>
                                <div className="space-y-2">
                                    {SUGGESTED_QUESTIONS.slice(0, 3).map((question, index) => (
                                        <motion.button
                                            key={index}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="w-full text-xs text-left p-3 bg-gray-50 hover:bg-red-50 hover:border-red-200 rounded-xl text-gray-700 hover:text-red-700 transition-all duration-200 border border-gray-100"
                                        >
                                            {question}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputMessage)}
                                    placeholder="旅程について何でもお聞きください..."
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm bg-white transition-all duration-200 placeholder-gray-400"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleSendMessage(inputMessage)}
                                    disabled={!inputMessage.trim() || isLoading}
                                    className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg disabled:shadow-none"
                                >
                                    <Send className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </div>                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
