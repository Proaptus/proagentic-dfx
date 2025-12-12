'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { sendChatMessage } from '@/lib/api/client';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { ChatMessage, ExtractedRequirement, ChatRequirementsResponse } from '@/lib/types';
import { Send, CheckCircle, Edit2, AlertTriangle, MessageSquare, Bot, User, Car, Plane, Factory, Zap, ArrowRight } from 'lucide-react';

interface RequirementsChatProps {
  onComplete?: (requirements: Record<string, unknown>) => void;
}

// Generate unique IDs for messages using timestamp + counter
let messageIdCounter = 0;
const generateMessageId = () => `msg-${Date.now()}-${++messageIdCounter}`;

const INITIAL_MESSAGE: ChatMessage = {
  id: 'initial-welcome',
  role: 'assistant',
  content: "Hello! I'm your hydrogen tank engineering assistant. Select an application type below to get started quickly, or type your specific requirements.",
  timestamp: Date.now(),
};

const MIN_REQUIREMENTS_COUNT = 5;

// Quick-start application presets for demo/testing
const APPLICATION_PRESETS = [
  {
    id: 'automotive',
    label: 'Automotive',
    icon: Car,
    description: '700 bar Type IV for fuel cell vehicles',
    color: 'blue',
    quickMessage: 'I need a hydrogen tank for automotive fuel cell application. 700 bar, 150 liters, target weight 80 kg, budget €15,000, -40°C to +85°C, EU certification, 11,000 cycles.',
  },
  {
    id: 'aviation',
    label: 'Aviation',
    icon: Plane,
    description: '350 bar lightweight for drones/aircraft',
    color: 'purple',
    quickMessage: 'I need a hydrogen tank for aviation application. 350 bar, 50 liters, maximum weight 25 kg, budget €20,000, -55°C to +70°C, international certification, 20,000 cycles.',
  },
  {
    id: 'stationary',
    label: 'Stationary',
    icon: Factory,
    description: '500 bar for energy storage',
    color: 'green',
    quickMessage: 'I need a hydrogen tank for stationary storage application. 500 bar, 500 liters, weight not critical, budget €8,000, -10°C to +50°C, EU certification, 45,000 cycles.',
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: Zap,
    description: 'Define your own specifications',
    color: 'amber',
    quickMessage: null, // Will open chat input
  },
];

export function RequirementsChat({ onComplete }: RequirementsChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [extractedRequirements, setExtractedRequirements] = useState<ExtractedRequirement[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [showPresets, setShowPresets] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSendMessage = useCallback(async (messageText?: string) => {
    const textToSend = messageText || inputValue.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateMessageId(),
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
        id: generateMessageId(),
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setExtractedRequirements(response.extracted_requirements);
      setSuggestions(response.suggestions || []);
    } catch {
      const errorMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, isLoading, messages]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    handleSendMessage(suggestion);
    setSuggestions([]);
  }, [handleSendMessage]);

  const handlePresetClick = useCallback((preset: typeof APPLICATION_PRESETS[0]) => {
    setShowPresets(false);
    if (preset.quickMessage) {
      // Send the quick message immediately
      handleSendMessage(preset.quickMessage);
    }
    // For custom, just hide presets and let user type
  }, [handleSendMessage]);

  const handleEditRequirement = useCallback((field: string, currentValue: string | number | null) => {
    setEditingField(field);
    setEditValue(currentValue?.toString() || '');
  }, []);

  const handleSaveEdit = useCallback((field: string) => {
    setExtractedRequirements((prev) =>
      prev.map((req) =>
        req.field === field ? { ...req, value: editValue, confidence: 1.0 } : req
      )
    );
    setEditingField(null);
    setEditValue('');
  }, [editValue]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const getConfidenceBadge = useCallback((confidence: number) => {
    if (confidence >= 0.8) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-900 text-white text-xs rounded-full">
          <CheckCircle size={12} aria-hidden="true" />
          High
        </span>
      );
    } else if (confidence >= 0.5) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-500 text-white text-xs rounded-full">
          <AlertTriangle size={12} aria-hidden="true" />
          Medium
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-300 text-gray-700 text-xs rounded-full">
          <AlertTriangle size={12} aria-hidden="true" />
          Low
        </span>
      );
    }
  }, []);

  const completedRequirementsCount = useMemo(
    () => extractedRequirements.filter((req) => req.value !== null).length,
    [extractedRequirements]
  );

  const canConfirm = completedRequirementsCount >= MIN_REQUIREMENTS_COUNT;

  const handleConfirmRequirements = useCallback(() => {
    const requirements: Record<string, unknown> = {};
    extractedRequirements.forEach((req) => {
      if (req.value !== null) {
        requirements[req.field] = req.value;
      }
    });
    onComplete?.(requirements);
  }, [extractedRequirements, onComplete]);

  return (
    <div className="h-[calc(100vh-220px)] flex gap-6 overflow-hidden">
      {/* Left Panel - Chat */}
      <div className="flex-1 flex flex-col min-h-0">
        <Card padding="none" className="h-full flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg" aria-hidden="true">
                <MessageSquare className="text-gray-700" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Requirements Conversation</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Chat with AI to define specifications
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4" role="log" aria-label="Chat messages" aria-live="polite">
            {messages.map((msg, index) => (
              <div key={msg.id}>
                <div
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user' ? 'bg-gray-900' : 'bg-gray-200'
                  }`} aria-hidden="true">
                    {msg.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-1">
                        <Bot size={14} className="text-gray-600" aria-hidden="true" />
                        <span className="text-xs font-medium text-gray-600">
                          Engineering Assistant
                        </span>
                      </div>
                    )}
                    <span className={`text-sm whitespace-pre-wrap block ${msg.role === 'user' ? 'text-white' : 'text-gray-900'}`}>{msg.content}</span>
                  </div>
                </div>

                {/* Quick-start Preset Cards - Show after initial message */}
                {index === 0 && showPresets && msg.role === 'assistant' && (
                  <div className="mt-4 ml-11">
                    <p className="text-xs font-medium text-gray-500 mb-3 uppercase tracking-wide">
                      Quick Start - Select Application Type
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {APPLICATION_PRESETS.map((preset) => {
                        const PresetIcon = preset.icon;
                        return (
                          <button
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className="group p-4 rounded-lg border border-gray-300 hover:border-gray-900 hover:bg-gray-50 text-gray-900 transition-all text-left"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="p-2 rounded-lg bg-gray-100">
                                <PresetIcon size={20} className="text-gray-700" />
                              </div>
                              <span className="font-semibold">{preset.label}</span>
                              <ArrowRight size={16} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-600" />
                            </div>
                            <p className="text-xs text-gray-500">{preset.description}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                  <Bot className="w-4 h-4 text-gray-600" />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex gap-1" aria-label="Loading">
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
            <div className="flex-shrink-0 px-4 pb-3 border-t border-gray-200 bg-gray-50">
              <div className="pt-3">
                <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
                  Suggested Responses
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((suggestion) => (
                    <button
                      key={`suggestion-${suggestion}`}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="group flex items-center gap-2 px-4 py-2.5 text-sm bg-white text-gray-900 rounded-lg border border-gray-300 hover:border-gray-900 hover:bg-gray-50 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <span className="font-medium">{suggestion}</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Input - Fixed at bottom */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-gray-50">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
              <label htmlFor="chat-input" className="sr-only">Type your response</label>
              <input
                id="chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-gray-400 bg-white transition-shadow"
                disabled={isLoading}
              />
              <Button
                type="submit"
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="px-6"
                aria-label="Send message"
              >
                <Send size={18} />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      {/* Right Panel - Extracted Requirements */}
      <div className="w-96 flex-shrink-0 min-h-0">
        <Card padding="none" className="h-full flex flex-col">
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg" aria-hidden="true">
                <CheckCircle className="text-gray-700" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Extracted Requirements</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Live-updating as you chat
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-3">
            {extractedRequirements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4" aria-hidden="true">
                  <CheckCircle size={28} className="text-gray-400" />
                </div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">No Requirements Yet</h4>
                <p className="text-sm text-gray-500 max-w-xs">
                  Requirements will be extracted and displayed here as you chat with the assistant
                </p>
              </div>
            ) : (
              extractedRequirements.map((req) => (
                <div
                  key={req.field}
                  className={`p-4 rounded-lg border transition-all ${
                    req.value !== null
                      ? 'bg-white border-gray-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200'
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
                        className="text-gray-600 hover:text-gray-900 p-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded"
                        aria-label={`Edit ${req.label}`}
                      >
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  {editingField === req.field ? (
                    <div className="space-y-2">
                      <label htmlFor={`edit-${req.field}`} className="sr-only">Edit {req.label}</label>
                      <input
                        id={`edit-${req.field}`}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-gray-400"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveEdit(req.field)}
                          className="flex-1 px-2 py-1 text-xs bg-gray-900 text-white rounded hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
            <div className="flex-shrink-0 border-t border-gray-200 p-6 bg-gray-50">
              <Button
                onClick={handleConfirmRequirements}
                disabled={!canConfirm}
                className="w-full justify-center"
              >
                <CheckCircle size={18} className="mr-2" />
                Confirm Requirements ({completedRequirementsCount}/{extractedRequirements.length})
              </Button>
              {!canConfirm && (
                <p className="text-xs text-gray-600 text-center mt-3">
                  At least {MIN_REQUIREMENTS_COUNT} requirements needed to proceed
                </p>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
