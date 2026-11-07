import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Phone,
  AlertTriangle,
  Languages,
  Shield,
  HelpCircle,
  Copy,
  Check,
  User,
  Bot,
  Loader2,
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { OFFICIAL_HELPLINES } from '../data/sampleData';
import { ChatMessage } from '../types';
import { NavPage } from '../components/layout/Navbar';

interface SafeGuidePageProps {
  onNavigate: (page: NavPage) => void;
}

export const SafeGuidePage: React.FC<SafeGuidePageProps> = ({ onNavigate }) => {
  const [language, setLanguage] = useState<'en' | 'ta'>('en');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content:
        language === 'ta'
          ? 'வணக்கம்! நான் SafeZone அவசர பாதுகாப்பு உதவியாளர் (SAFEGuide AI). வெள்ள அபாயம், புயல் முன்னெச்சரிக்கை, அறுந்து விழுந்த மின்கம்பி பாதுகாப்பு மற்றும் அதிகாரப்பூர்வ அவசர உதவி எண்கள் பற்றிய வழிகாட்டலை நான் வழங்குகிறேன். நீங்கள் தமிழில் கேட்கலாம்.'
          : 'Hello! I am SAFEGuide AI, your community emergency safety assistant. I provide responsible disaster preparedness, flash flood safety protocols, fallen wire hazard procedures, and official helpline access. How can I guide you today?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: 'en',
      quickTips: [
        'Flash Flood Precautions',
        'Downed Power Line Safety',
        'Emergency Evacuation Kit',
        'Official Helplines Directory',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage(text, language, history);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: (res.detectedLanguage as 'en' | 'ta') || language,
        quickTips: res.quickTips,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content:
          language === 'ta'
            ? 'அவசர நிலை வழிகாட்டல்:\n- உடனடியாக பாதுகாப்பான உயரமான பகுதிக்கு செல்லவும்.\n- அவசர உதவிக்கு **112** அல்லது **1070** ஐ அழைக்கவும்.'
            : 'Immediate Safety Guidelines:\n- Move to higher ground immediately away from drainage channels.\n- For life safety emergencies, call **112** or Disaster Helpline **1070** right away.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const englishPrompts = [
    'What should I do if my street begins flooding?',
    'How do I handle a downed electrical wire outside my house?',
    'What are essential items for an emergency cyclone kit?',
    'What is the procedure for calling ambulance during waterlogging?',
  ];

  const tamilPrompts = [
    'தெருவில் திடீர் வெள்ளம் புகுந்தால் என்ன செய்ய வேண்டும்?',
    'அறுந்து விழுந்த மின்கம்பி இருந்தால் என்ன பாதுகாப்பு எடுக்க வேண்டும்?',
    'புயல் மற்றும் மழைக் கால அவசர பாதுகாப்பு பெட்டகம் (Kit)?',
    'அவசர உதவி எண்களின் முழு விவரம் என்ன?',
  ];

  const currentPrompts = language === 'ta' ? tamilPrompts : englishPrompts;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI CONVERSATIONAL SAFETY ASSISTANT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-1">
            SAFEGuide AI
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conversational emergency preparedness and disaster response guidance in English and Tamil (தமிழ்).
          </p>
        </div>

        {/* Language Toggle */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs self-start md:self-auto">
          <Languages className="w-3.5 h-3.5 text-slate-400 ml-2" />
          <button
            onClick={() => setLanguage('en')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              language === 'en'
                ? 'bg-teal-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ta')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
              language === 'ta'
                ? 'bg-teal-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            தமிழ் (Tamil)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Helplines Directory Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
              <Phone className="w-4 h-4 text-teal-400" />
              <span>Official Emergency Helplines</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              For immediate life threats or urgent evacuation, call official emergency desks directly:
            </p>

            <div className="space-y-2 pt-1 font-mono text-xs">
              {OFFICIAL_HELPLINES.map((line) => (
                <div
                  key={line.number}
                  className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-sans font-medium text-slate-200 text-xs truncate">
                      {line.service}
                    </div>
                    <div className="text-[11px] text-slate-300 font-sans">
                      {line.desc}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <a
                      href={`tel:${line.number}`}
                      aria-label={`Call ${line.service} at ${line.number}`}
                      className="font-bold text-teal-400 hover:text-teal-300 tabular-nums focus-visible:ring-1 focus-visible:ring-teal-400 rounded px-1"
                    >
                      {line.number}
                    </a>
                    <button
                      onClick={() => handleCopy(line.number)}
                      title={`Copy number for ${line.service}`}
                      aria-label={`Copy helpline number for ${line.service}`}
                      className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer rounded focus-visible:ring-1 focus-visible:ring-teal-400"
                    >
                      {copiedNumber === line.number ? (
                        <Check className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Safety Disclaimer Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Advisory Disclaimer</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              SAFEGuide AI provides general preparedness recommendations synthesized from public disaster management doctrines. In life-threatening emergencies, prioritize your immediate safety and contact 112.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Chat Stream */}
        <div className="lg:col-span-8 flex flex-col h-[600px] rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden shadow-2xl">
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs sm:text-sm ${
                    isAssistant ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-xl p-4 space-y-2 ${
                      isAssistant
                        ? 'bg-slate-950 border border-slate-800 text-slate-200'
                        : 'bg-teal-500 text-slate-950 font-medium'
                    }`}
                  >
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </div>

                    <div
                      className={`text-[10px] font-mono flex items-center justify-between pt-1 ${
                        isAssistant ? 'text-slate-500 border-t border-slate-900' : 'text-slate-900/70'
                      }`}
                    >
                      <span>{isAssistant ? 'SAFEGuide AI' : 'You'}</span>
                      <span className="tabular-nums">{msg.timestamp}</span>
                    </div>

                    {/* Quick follow up suggestion tips if any */}
                    {msg.quickTips && (
                      <div className="pt-2 flex flex-wrap gap-1.5">
                        {msg.quickTips.map((tip) => (
                          <button
                            key={tip}
                            onClick={() => handleSendMessage(tip)}
                            className="text-[11px] px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-teal-300 border border-teal-500/30 cursor-pointer transition-colors"
                          >
                            {tip} &rarr;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!isAssistant && (
                    <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start text-xs text-slate-400 items-center">
                <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                  <span>SAFEGuide AI is formulating safety guidance...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
            <span className="text-slate-500 text-[11px] shrink-0">Suggestions:</span>
            {currentPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 whitespace-nowrap shrink-0 transition-colors cursor-pointer text-[11px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <div className="p-3 bg-slate-950 border-t border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
              aria-label="Ask SAFEGuide AI"
            >
              <label htmlFor="safeguide-chat-input" className="sr-only">
                Ask a disaster preparedness or hazard response question
              </label>
              <input
                id="safeguide-chat-input"
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  language === 'ta'
                    ? 'பாதுகாப்பு கேள்விகளை தமிழில் கேட்கவும்...'
                    : 'Ask for safety protocols, flood response steps, helplines...'
                }
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                aria-label="Send emergency question to SAFEGuide AI"
                className="p-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-lg transition-colors cursor-pointer disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-teal-400"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
