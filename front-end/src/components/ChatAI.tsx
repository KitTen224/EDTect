'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { ChatMessage, ChatAIResponse } from '@/types/chat';

interface ChatAIProps {
  currentPlan?: any;
  onPlanUpdate?: (newPlan: any) => void;
}

const SUGGESTED_QUESTIONS = [
  'のんびり旅に',
  '観光少なめに',
  '〇日目だけ温泉体験に',
  '〇日目だけ文化体験に',
  '〇日目だけショッピングに',
  '食べ歩きメインのプランに',
  '予算を下げて',
  '高級プランに',
];

function generateId() {
  return `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export default function ChatAI({ currentPlan, onPlanUpdate }: ChatAIProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [previousPlan, setPreviousPlan] = useState<any>(null);
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          content: 'おはようございます！日本旅行プランについて何でもお聞きください。',
          role: 'assistant',
          timestamp: new Date()
        },
        {
          id: 'suggestions',
          content:
            '💡 以下のようなご要望が可能です：\n',
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    sessionStorage.setItem('chatAI-messages', JSON.stringify(messages));
  }, [messages]);
  useEffect(() => {
    sessionStorage.setItem('chatAI-input', inputMessage);
  }, [inputMessage]);

  useEffect(() => {
    if (pendingPlan) sessionStorage.setItem('chatAI-pendingPlan', JSON.stringify(pendingPlan));
  }, [pendingPlan]);

  useEffect(() => {
    if (previousPlan) sessionStorage.setItem('chatAI-previousPlan', JSON.stringify(previousPlan));
  }, [previousPlan]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, context: { currentPlan } })
      });

      const aiResponse: ChatAIResponse = await response.json();

      const newMessages: ChatMessage[] = [];

      // 1. Phản hồi chính của AI
      newMessages.push({
        id: generateId(),
        content: aiResponse.reply,
        role: 'assistant',
        timestamp: new Date(),
        reused: aiResponse.reused ?? false
      });

      // 2. Nếu có plan => thêm xác nhận
      if (aiResponse.plan) {
        if (aiResponse.plan.timeline) {
          setPendingPlan(aiResponse.plan);
        } else {
          setPendingPlan(aiResponse.plan);
        }

        newMessages.push({
          id: generateId(),
          content: 'このプランに変更しますか？\n\n「このプランで決定」をクリックして適用してください。',
          role: 'assistant',
          timestamp: new Date()
        });
      }

      // 3. Nếu có suggestion => thêm suggestion message
      if (aiResponse.suggestions?.length) {
        newMessages.push({
          id: `suggestions-${Date.now()}`,
          content: '💡 以下のようなご要望が可能です：\n', // không cần nội dung
          role: 'assistant',
          timestamp: new Date()
        });
      }

      // 4. Cập nhật toàn bộ messages cùng lúc
      setMessages(prev => [...prev, ...newMessages]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: generateId(),
          content: '申し訳ございません。エラーが発生しました。もう一度お試しください。',
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden">
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
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' : 'bg-white text-gray-800 border border-gray-100'}`}>
              <div className="flex gap-3 items-start">
                {msg.role === 'assistant' && <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center"><Bot className="w-3 h-3 text-red-600" /></div>}
                {msg.role === 'user' && <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center"><User className="w-3 h-3" /></div>}
                <div>
                  <span className="text-sm whitespace-pre-line">{msg.content}</span>
                  {msg.content?.includes('このプランで決定') && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (onPlanUpdate && pendingPlan) {
                            const snapshot = currentPlan ? structuredClone(currentPlan) : null;
                            onPlanUpdate(pendingPlan);
                            if (snapshot) {
                              setPreviousPlan(snapshot);
                            }

                            const applyMessages: ChatMessage[] = [
                              {
                                id: generateId(),
                                content: 'プランが適用されました！',
                                role: 'assistant',
                                timestamp: new Date()
                              },
                              {
                                id: `suggestions-${Date.now()}`,
                                content: '元のプランに戻す or \n💡 以下のようなご要望が可能です：\n',
                                role: 'assistant',
                                timestamp: new Date()
                              },

                            ];

                            setMessages(prev => [...prev, ...applyMessages]);
                            setPendingPlan(null);
                          }
                        }}

                        className="mt-3 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl text-sm"
                      >
                        このプランで決定
                      </motion.button>
                    </>
                  )}
                  {/* ✅ Nếu là message id 'suggestions', render các nút */}
                  {msg.id.startsWith('suggestions') && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        {SUGGESTED_QUESTIONS.map((s, idx) => (
                          <motion.button
                            key={idx}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setInputMessage(s)}
                            className="text-[11px] px-2 py-1 rounded-md bg-gray-100 border border-gray-300 hover:bg-gray-200 whitespace-nowrap"
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>

                      {previousPlan && (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            if (onPlanUpdate && previousPlan) {
                              onPlanUpdate(previousPlan);
                              const rollbackMessages: ChatMessage[] = [
                                {
                                  id: generateId(),
                                  content: '元のプランに戻しました。',
                                  role: 'assistant',
                                  timestamp: new Date()
                                },
                                {
                                  id: `suggestions-${Date.now()}`,
                                  content: '💡 以下のようなご要望が可能です：\n',
                                  role: 'assistant',
                                  timestamp: new Date()
                                }
                              ];
                              setMessages(prev => [...prev, ...rollbackMessages]);
                              setPreviousPlan(null);
                            }
                          }}
                          className="mt-2 bg-red-700 text-white px-4 py-2 rounded-xl text-sm"
                        >
                          元のプランに戻す
                        </motion.button>
                      )}
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        ))}

        {isLoading && <div className="text-sm text-gray-500">AIが考え中...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 pb-3">

        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputMessage)}
            placeholder="旅程について何でもお聞きください..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm"
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSendMessage(inputMessage)}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>

  );
}