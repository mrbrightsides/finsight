
import React, { useState, useRef, useEffect } from 'react';
import { createAdvisorChat, speakText } from '../services/geminiService';
import { Message, UserProfile } from '../types';

interface AdvisorChatProps {
  profile: UserProfile;
}

// Helper: Decode base64 to Uint8Array
const decodeBase64 = (base64: string) => {
  const binaryString = window.atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Helper: Decode raw PCM audio data into an AudioBuffer
const decodeAudioData = async (
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> => {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
};

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ profile }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Hey ${profile.name}! I'm Finny, your personal financial guide for Hackonomics 2026. What can I help you master today? We could talk about your current net worth of $${profile.totalBalance.toLocaleString()}, how compound interest works, or even global market trends! 📈` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  // Initialize chat session with user context
  useEffect(() => {
    chatRef.current = createAdvisorChat(profile);
  }, [profile.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const result = await chatRef.current.sendMessage({ message: userMessage });
      setMessages(prev => [...prev, { role: 'model', text: result.text || "I'm having a little trouble thinking right now. Let's try that again!" }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Oops! My connection to the economic cloud dropped. Could you repeat that?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fixed handleSpeak to support raw PCM audio from Gemini API
  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
      if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
        sourceNodeRef.current = null;
      }
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    try {
      const base64Audio = await speakText(text);
      if (base64Audio) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const audioData = decodeBase64(base64Audio);
        const audioBuffer = await decodeAudioData(audioData, ctx, 24000, 1);
        
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => {
          setIsSpeaking(false);
          sourceNodeRef.current = null;
        };
        sourceNodeRef.current = source;
        source.start();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error("Speech error:", err);
      setIsSpeaking(false);
    }
  };

  const LEARNING_TOPICS = [
    { title: "Compound Interest", icon: "fa-seedling", prompt: "Explain compound interest using my current savings balance as an example." },
    { title: "Diversification", icon: "fa-layer-group", prompt: "Look at my asset allocation and explain why diversification matters for my risk profile." },
    { title: "Inflation", icon: "fa-cloud-arrow-down", prompt: "How much will my $"+profile.totalBalance.toLocaleString()+" be worth in 10 years if inflation stays at 3%?" },
    { title: "Debt Payoff", icon: "fa-fire-extinguisher", prompt: "What is the most efficient way to clear my debt based on my current profile?" }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-100px)] animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-t-[2.5rem] border-x border-t border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100 relative">
            <i className="fas fa-robot"></i>
            {isSpeaking && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-ping"></span>
            )}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Finny Advisor</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Context-Aware AI</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setMessages([messages[0]])}
            className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center"
            title="Clear History"
          >
            <i className="fas fa-trash-can text-sm"></i>
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 bg-slate-50 border-x border-slate-100 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
          >
            <div 
              className={`max-w-[85%] md:max-w-[70%] p-5 rounded-3xl shadow-sm relative group ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
              }`}
            >
              {msg.role === 'model' && (
                <button 
                  onClick={() => handleSpeak(msg.text)}
                  className={`absolute -right-10 top-2 w-8 h-8 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${isSpeaking ? 'bg-emerald-100 text-emerald-600 animate-pulse opacity-100' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600'}`}
                >
                  <i className={`fas ${isSpeaking ? 'fa-stop' : 'fa-volume-up'} text-xs`}></i>
                </button>
              )}
              <div className="whitespace-pre-wrap leading-relaxed font-medium text-sm md:text-base">
                {msg.text}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-none flex gap-2">
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Learning Path & Input */}
      <div className="bg-white p-6 rounded-b-[2.5rem] border-x border-b border-slate-100 shadow-sm space-y-6">
        {messages.length < 5 && (
          <div className="space-y-3">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Interactive Learning Path</h3>
             <div className="flex flex-wrap justify-center gap-2">
                {LEARNING_TOPICS.map((topic, i) => (
                  <button 
                    key={i}
                    onClick={() => { setInput(topic.prompt); }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white border border-slate-100 transition-all shadow-sm"
                  >
                    <i className={`fas ${topic.icon}`}></i>
                    {topic.title}
                  </button>
                ))}
             </div>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Finny anything about your finance..."
            className="w-full pl-6 pr-16 py-5 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-800"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              !input.trim() || isLoading 
                ? 'bg-slate-200 text-slate-400' 
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95'
            }`}
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </form>
        <p className="text-[10px] text-center font-bold text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
          <i className="fas fa-shield-halved"></i>
          Privacy First: Advice is generated on-device and verified by Finny.
        </p>
      </div>
    </div>
  );
};
