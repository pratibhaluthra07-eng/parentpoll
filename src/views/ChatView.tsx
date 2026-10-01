import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { sendChatMessage } from '../services/api';
import { Message, StructuredAiResponse } from '../types';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  ChevronRight,
  Heart,
  HelpCircle,
  History,
  Lightbulb,
  Loader2,
  Plus,
  Search,
  Send,
  Trash2,
  User,
  Volume2,
} from 'lucide-react';

export const ChatView: React.FC = () => {
  const {
    activeChild,
    conversations,
    activeConversationId,
    setActiveConversationId,
    createConversation,
    addMessageToConversation,
    deleteConversation,
    setCurrentTab,
    setIsUrgentModalOpen,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Active conversation
  const currentConversation =
    conversations.find(c => c.id === activeConversationId) ||
    conversations[0] ||
    null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, loading]);

  // Check if a pending query was sent from Home
  useEffect(() => {
    const pending = sessionStorage.getItem('pending_chat_query');
    if (pending) {
      sessionStorage.removeItem('pending_chat_query');
      handleSend(pending);
    }
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim() || loading) return;

    let convId = activeConversationId;
    if (!convId || !currentConversation) {
      convId = createConversation(textToSend);
    }

    // Add user message
    addMessageToConversation(convId, {
      role: 'user',
      content: textToSend,
    });

    setInputText('');
    setLoading(true);

    try {
      // Build history
      const history = (currentConversation?.messages || []).map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChatMessage(textToSend, activeChild, history);

      addMessageToConversation(convId, {
        role: 'assistant',
        content: response.data.whyThisIsHappening || 'Here is what you can do right now:',
        structuredData: response.data,
        isEmergency: response.isEmergency,
      });
    } catch (err: any) {
      // Fallback message
      addMessageToConversation(convId, {
        role: 'assistant',
        content: "I'm right here with you. Here are practical next steps to handle this situation with " + activeChild.name + ":",
        structuredData: {
          whatYouCanDoNow: [
            `Acknowledge ${activeChild.name}'s feelings calmly with eye contact.`,
            'Offer two clear, acceptable choices so they feel a sense of agency.',
            'Keep your own voice low and calm to help co-regulate their nervous system.',
          ],
          whyThisIsHappening: `At ${activeChild.ageFormatted}, their emotional expression develops faster than verbal impulse control.`,
          tryThis: ['Take a brief 30-second reset together with a favorite book or calm toy.'],
          watchFor: ['Fatigue, overtiredness, or hunger as common root triggers.'],
          quickScript: 'I hear you. I am right here with you and you are safe.',
          oneFollowUpQuestion: 'Would you like a quick sensory activity or a low-stress meal idea next?',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpClick = (question: string) => {
    handleSend(question);
  };

  const filteredConversations = conversations.filter(c =>
    c.title.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="pb-24 pt-1 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-7rem)]">
      {/* Chat Top Header */}
      <div className="bg-white/95 dark:bg-stone-800/95 backdrop-blur-md rounded-2xl p-3 border border-stone-200/80 dark:border-stone-700 shadow-2xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setHistoryOpen(true)}
            className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors"
            title="Conversation history"
          >
            <History className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-bold text-stone-900 dark:text-stone-100 font-display flex items-center gap-1.5 truncate max-w-[190px] sm:max-w-xs">
              <span>{currentConversation?.title || 'ParentPal Assistant'}</span>
            </div>
            <div className="text-[11px] text-stone-500">
              Context: <strong className="text-stone-700 dark:text-stone-300">{activeChild.name}</strong> ({activeChild.ageFormatted} · {activeChild.dietaryPreference})
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              createConversation('New conversation');
            }}
            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 transition-colors text-xs font-semibold flex items-center gap-1"
            title="Start new chat"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pr-1.5">
        {(!currentConversation || currentConversation.messages.length === 0) && (
          <div className="py-10 text-center space-y-3 px-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-stone-800 dark:text-stone-200 font-display">
              Ask anything about {activeChild.name}
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              ParentPal AI understands {activeChild.name}'s age ({activeChild.ageFormatted}), dietary preferences ({activeChild.dietaryPreference}), allergies, and previous chats.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-1.5">
              {[
                "She didn't eat lunch today",
                'How to handle toddler hitting?',
                'Wake windows for 2 year old',
                'Screen-free ideas for rainy day',
              ].map((starter, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(starter)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-amber-400 text-xs text-stone-700 dark:text-stone-300 shadow-2xs"
                >
                  “{starter}”
                </button>
              ))}
            </div>
          </div>
        )}

        {currentConversation?.messages.map((message: Message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {/* User message */}
            {message.role === 'user' ? (
              <div className="max-w-[85%] bg-amber-600 text-white rounded-2xl rounded-br-xs px-4 py-2.5 text-xs shadow-xs leading-relaxed">
                {message.content}
              </div>
            ) : (
              /* Assistant message */
              <div className="max-w-[96%] w-full space-y-3 bg-white dark:bg-stone-850 rounded-3xl rounded-tl-xs p-4 sm:p-5 border border-stone-200/90 dark:border-stone-700/80 shadow-xs">
                {/* Emergency banner if medical flags detected */}
                {message.isEmergency && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-900 dark:text-rose-200">
                      <strong className="block">Immediate Medical Advisory:</strong>
                      If {activeChild.name} is having difficulty breathing, severe allergic reaction, seizure, or loss of consciousness, seek urgent medical emergency care immediately (dial 911 / 112).
                    </div>
                  </div>
                )}

                {/* Structured Sections */}
                {message.structuredData ? (
                  <div className="space-y-3.5">
                    {/* What you can do now */}
                    {message.structuredData.whatYouCanDoNow?.length > 0 && (
                      <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/50 rounded-2xl p-3.5">
                        <div className="text-[11px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          What You Can Do Now
                        </div>
                        <ul className="space-y-1.5 text-xs text-stone-800 dark:text-stone-200">
                          {message.structuredData.whatYouCanDoNow.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="w-4 h-4 rounded-full bg-amber-200 dark:bg-amber-800/60 text-amber-900 dark:text-amber-200 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Why this may be happening */}
                    {message.structuredData.whyThisIsHappening && (
                      <div>
                        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
                          Why this may be happening
                        </div>
                        <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50 dark:bg-stone-800/40 p-3 rounded-xl border border-stone-100 dark:border-stone-800">
                          {message.structuredData.whyThisIsHappening}
                        </p>
                      </div>
                    )}

                    {/* What to say (Script) */}
                    {message.structuredData.quickScript && (
                      <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/50 rounded-2xl p-3.5">
                        <div className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4 text-emerald-600" />
                          What you can say to {activeChild.name}
                        </div>
                        <div className="text-xs font-medium text-stone-900 dark:text-stone-100 italic leading-relaxed">
                          "{message.structuredData.quickScript}"
                        </div>
                      </div>
                    )}

                    {/* Try this (Alternatives) */}
                    {message.structuredData.tryThis?.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          Try This
                        </div>
                        <ul className="space-y-1 text-xs text-stone-700 dark:text-stone-300 list-disc pl-4">
                          {message.structuredData.tryThis.map((alt, idx) => (
                            <li key={idx} className="leading-relaxed">{alt}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Watch for (Warning signs) */}
                    {message.structuredData.watchFor?.length > 0 && (
                      <div className="pt-1">
                        <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-1">
                          Watch for
                        </div>
                        <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                          {message.structuredData.watchFor.map((sign, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                              <span>{sign}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* When to seek professional help */}
                    {message.structuredData.whenToSeekHelp && (
                      <div className="p-3 bg-stone-100/70 dark:bg-stone-800/80 rounded-xl text-[11px] text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-stone-700 dark:text-stone-200">When to consult your pediatrician: </span>
                          {message.structuredData.whenToSeekHelp}
                        </div>
                      </div>
                    )}

                    {/* One follow-up question CTA button */}
                    {message.structuredData.oneFollowUpQuestion && (
                      <div className="pt-2 border-t border-stone-100 dark:border-stone-800">
                        <button
                          onClick={() => handleFollowUpClick(message.structuredData!.oneFollowUpQuestion!)}
                          className="w-full text-left p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-xs font-medium text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 transition-colors flex items-center justify-between group"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="text-amber-600 font-bold">Suggested Follow-up:</span>
                            <span>{message.structuredData.oneFollowUpQuestion}</span>
                          </span>
                          <ChevronRight className="w-4 h-4 text-amber-600 group-hover:translate-x-0.5 transition-transform shrink-0 ml-1" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                    {message.content}
                  </p>
                )}

                <div className="text-[10px] text-stone-400 text-right pt-1">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-4 bg-white dark:bg-stone-800 rounded-3xl w-48 border border-stone-200 dark:border-stone-700 shadow-2xs">
            <Loader2 className="w-4 h-4 text-amber-600 animate-spin" />
            <span className="text-xs text-stone-500 font-medium">Thinking calmly...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field Form */}
      <div className="mt-2 bg-white dark:bg-stone-850 p-2 sm:p-2.5 rounded-2xl border border-stone-200 dark:border-stone-700 shadow-md">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            placeholder={`Ask about ${activeChild.name}'s food, sleep, or behavior...`}
            className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="w-9 h-9 rounded-xl bg-amber-600 hover:bg-amber-700 text-white flex items-center justify-center shrink-0 disabled:opacity-40 transition-all shadow-xs"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Conversation History Drawer */}
      {historyOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-2xs"
            onClick={() => setHistoryOpen(false)}
          ></div>

          <div className="relative bg-white dark:bg-stone-900 w-80 max-w-[85vw] h-full shadow-2xl z-10 flex flex-col border-r border-stone-200 dark:border-stone-800">
            {/* Drawer Header */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 font-display">
                  Recent Chats
                </h3>
              </div>
              <button
                onClick={() => setHistoryOpen(false)}
                className="text-stone-400 hover:text-stone-600 p-1"
              >
                ✕
              </button>
            </div>

            {/* Search */}
            <div className="p-3 border-b border-stone-100 dark:border-stone-800">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs">
                <Search className="w-3.5 h-3.5 text-stone-400" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={e => setSearchFilter(e.target.value)}
                  placeholder="Search conversations..."
                  className="bg-transparent flex-1 text-stone-900 dark:text-white focus:outline-none placeholder:text-stone-400"
                />
              </div>
            </div>

            {/* Conversation list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  className={`group rounded-xl p-2.5 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                    conv.id === activeConversationId
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                      : 'hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                  onClick={() => {
                    setActiveConversationId(conv.id);
                    setHistoryOpen(false);
                  }}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <div className="truncate">{conv.title}</div>
                    <div className="text-[10px] text-stone-400">
                      {new Date(conv.updatedAt).toLocaleDateString()} · {conv.category}
                    </div>
                  </div>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-rose-600 transition-opacity"
                    title="Delete conversation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* New Chat Button */}
            <div className="p-3 border-t border-stone-100 dark:border-stone-800">
              <button
                onClick={() => {
                  createConversation('New conversation');
                  setHistoryOpen(false);
                }}
                className="w-full py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-stone-800"
              >
                <Plus className="w-4 h-4" />
                <span>Start New Conversation</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
