'use client';

import { useState, useRef, useEffect } from 'react';
import { sendChatMessage } from '@/lib/api/client';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ChatMessage, ExtractedRequirement, ChatRequirementsResponse } from '@/lib/types';
import { Send, CheckCircle, Edit2, AlertTriangle, Sparkles, MessageSquare, Bot, User } from 'lucide-react';

interface RequirementsChatProps {
  onComplete?: (requirements: Record<string, unknown>) => void;
}

export function RequirementsChat({ onComplete }: RequirementsChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your hydrogen tank engineering assistant. I'll help you define the requirements for your tank design. Let's start with the basics - what type of application is this tank for? (e.g., automotive, aviation, stationary storage)",
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = (await sendChatMessage(
        textToSend,
        conversationHistory
      )) as ChatRequirementsResponse;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setExtractedRequirements(response.extracted_requirements);
      setSuggestions(response.suggestions || []);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
    setSuggestions([]);
  };

  const handleEditRequirement = (field: string, currentValue: string | number | null) => {
    setEditingField(field);
    setEditValue(currentValue?.toString() || '');
  };

  const handleSaveEdit = (field: string) => {
    setExtractedRequirements((prev) =>
      prev.map((req) =>
        req.field === field ? { ...req, value: editValue, confidence: 1.0 } : req
      )
    );
    setEditingField(null);
    setEditValue('');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
          <CheckCircle size={12} />
          High
        </span>
      );
    } else if (confidence >= 0.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
          <AlertTriangle size={12} />
          Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
          <AlertTriangle size={12} />
          Low
        </span>
      );
    }
  };

  const canConfirm = extractedRequirements.filter((req) => req.value !== null).length >= 5;

  const handleConfirmRequirements = () => {
    const requirements: Record<string, unknown> = {};
    extractedRequirements.forEach((req) => {
      if (req.value !== null) {
        requirements[req.field] = req.value;
      }
    });
    onComplete?.(requirements);
  };

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <MessageSquare className="text-blue-600" size={24} />
              <CardTitle>Requirements Conversation</CardTitle>
            </div>
          </CardHeader>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-200'
                }`}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-gray-600" />
                  )}
                </div>
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles size={14} className="text-blue-600" />
                      <span className="text-xs font-medium text-blue-600">
                        Engineering Assistant
                      </span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="px-4 pb-3">
              <p className="text-xs text-gray-500 mb-2">Suggested responses:</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your response..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-4"
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Right Panel - Extracted Requirements */}
      <div className="w-96">
        <Card className="h-full flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Extracted Requirements</CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Live-updating as you chat
            </p>
          </CardHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {extractedRequirements.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Sparkles size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  Requirements will appear here as you chat
                </p>
              </div>
            ) : (
              extractedRequirements.map((req) => (
                <div
                  key={req.field}
                  className={`p-3 rounded-lg border ${
                    req.value !== null
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-900">
                        {req.label}
                      </div>
                      {req.value !== null && (
                        <div className="mt-1">{getConfidenceBadge(req.confidence)}</div>
                      )}
                    </div>
                    {req.editable && req.value !== null && editingField !== req.field && (
                      <button
                        onClick={() => handleEditRequirement(req.field, req.value)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  {editingField === req.field ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(req.field)}
                          className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {req.value !== null ? (
                        <span className="font-medium text-gray-900">
                          {req.value}
                          {req.unit && <span className="text-gray-500 ml-1">{req.unit}</span>}
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Not specified yet</span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {extractedRequirements.length > 0 && (
            <div className="border-t p-4">
              <Button
                onClick={handleConfirmRequirements}
                disabled={!canConfirm}
                className="w-full"
              >
                <CheckCircle size={18} className="mr-2" />
                Confirm Requirements ({extractedRequirements.filter((r) => r.value !== null).length}/
                {extractedRequirements.length})
              </Button>
              {!canConfirm && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  At least 5 requirements needed
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
