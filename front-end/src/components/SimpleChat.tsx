'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-6 z-50 w-96 max-w-[90vw] h-[600px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden backdrop-blur-sm"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 flex items-center justify-between">
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
                    onClick={onClose}
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
                                <span className="text-sm leading-relaxed whitespace-pre-line">
                                    {message.content}
                                </span>
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
            </div>
        </motion.div>
    );
}
