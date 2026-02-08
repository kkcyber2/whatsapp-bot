
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, Bell, LogOut, Activity, ChevronRight, Plus, MessageSquare,
  ShieldCheck, Globe, ImageIcon, Mic, Brain, Loader2, Download, Sparkles, 
  Zap, Phone, Mail, ShoppingCart, DollarSign, BarChart3, MoreHorizontal, 
  TrendingUp, PhoneIncoming, PhoneOff, Layers, Cpu, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { NAV_ITEMS, PLATFORM_CONFIGS } from './constants';
import { Platform, Message, Sentiment } from './types';
import { INITIAL_CUSTOMERS, INITIAL_MESSAGES, MOCK_ANALYTICS } from './mockData';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { OmniAIService } from './geminiService';
import { signInWithEmail, signUp, signOut, onAuthStateChange } from './src/services/authService';
import type { User } from '@supabase/supabase-js';
import { ThemeToggle } from './src/components/ThemeToggle';
import { useTheme } from './src/hooks/useTheme';
import { getChartTheme } from './src/theme/darkMode';
import { BillingPage } from './src/components/BillingPage';

// --- Global Audio Helpers ---
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

// --- Component: Dashboard ---
const DashboardView = () => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="p-4 sm:p-8 lg:p-10 max-w-7xl mx-auto space-y-12 sm:space-y-16 pb-20 sm:pb-40"
  >
    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 md:gap-12">
      <div className="space-y-3 sm:space-y-4">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Intelligence Center</h1>
        <p className="text-slate-500 font-medium text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl">Neural network overview of your global business operations.</p>
      </div>
      <button className="px-6 sm:px-10 py-4 sm:py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 transition-all flex items-center gap-3 sm:gap-4 active:scale-95 whitespace-nowrap justify-center">
         <Plus className="w-5 h-5 sm:w-6 sm:h-6" /> <span className="hidden sm:inline">Deploy Agent</span><span className="sm:hidden">Deploy</span>
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
      {[
        { label: 'Conversations', val: '2.4k', trend: '+12%', icon: <MessageSquare />, color: 'bg-indigo-500' },
        { label: 'Sales Flow', val: '$14k', trend: '+24%', icon: <ShoppingCart />, color: 'bg-emerald-500' },
        { label: 'Saved Capacity', val: '142h', trend: 'Peak', icon: <Zap />, color: 'bg-amber-500' },
        { label: 'Stability Index', val: '99.8%', trend: 'Optimum', icon: <ShieldCheck />, color: 'bg-slate-900' }
      ].map((stat, i) => (
        <motion.div 
          key={i}
          whileHover={{ y: -5 }}
          className="bg-white dark:bg-slate-800 p-8 sm:p-12 rounded-[2.5rem] sm:rounded-[4rem] border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-2xl transition-all group"
        >
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <div className={`w-16 h-16 sm:w-20 sm:h-20 ${stat.color} rounded-[1.5rem] sm:rounded-[2rem] flex items-center justify-center text-white shadow-xl transition-transform group-hover:rotate-6`}>
              {React.cloneElement(stat.icon as any, { className: 'w-7 h-7 sm:w-8 sm:h-8' })}
            </div>
            <span className="text-[10px] font-black px-3 sm:px-4 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-100 dark:border-indigo-800 flex-shrink-0">{stat.trend}</span>
          </div>
          <p className="text-[11px] sm:text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.val}</p>
        </motion.div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-16">
      <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-12 sm:mb-16">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Performance Matrix</h3>
          <div className="flex gap-3 sm:gap-4 flex-wrap">
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Revenue</button>
            <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-colors">Inbound</button>
          </div>
        </div>
        <div className="h-64 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_ANALYTICS}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:[&_line]:stroke-slate-700" />
              <XAxis dataKey="date" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '2rem', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#e2e8f0' }} />
              <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={4} fill="#4f46e5" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="lg:col-span-4 bg-slate-900 dark:bg-slate-800 p-8 sm:p-16 rounded-[3rem] sm:rounded-[5rem] text-white flex flex-col justify-between relative overflow-hidden border border-slate-800 dark:border-slate-700">
        <div className="relative z-10">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-3 sm:mb-4">Neural Health</h3>
          <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]">Optimized by Gemini-3</p>
        </div>
        <div className="relative z-10 flex flex-col gap-4 sm:gap-8 mt-8 sm:mt-0">
           {[
             { label: 'WA Integration', val: 'Active', color: 'bg-emerald-500' },
             { label: 'IG Automated', val: 'Standby', color: 'bg-amber-500' },
             { label: 'Neural Sync', val: '98%', color: 'bg-indigo-500' }
           ].map((it, i) => (
             <div key={i} className="flex items-center justify-between p-4 sm:p-6 bg-white/5 rounded-2xl sm:rounded-3xl border border-white/10">
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">{it.label}</span>
                <span className={`px-3 sm:px-4 py-1.5 ${it.color} text-white text-[10px] font-black rounded-lg uppercase flex-shrink-0`}>{it.val}</span>
             </div>
           ))}
        </div>
        <Brain className="absolute -bottom-20 -right-20 w-[20rem] h-[20rem] sm:w-[30rem] sm:h-[30rem] opacity-[0.03] text-white pointer-events-none" />
      </div>
    </div>
  </motion.div>
);

// --- Component: Unified Inbox ---
const UnifiedInbox = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(INITIAL_CUSTOMERS[0]);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListOpen, setIsListOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: Math.random().toString(),
      senderId: 'me',
      senderName: 'You',
      platform: selectedCustomer.lastPlatform,
      content: input,
      timestamp: new Date(),
      sentiment: Sentiment.NEUTRAL,
      isAiResponse: false
    };
    setMessages(prev => [...prev, msg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await OmniAIService.generateAgentResponse(input, selectedCustomer.name, selectedCustomer.lastPlatform);
      const aiMsg: Message = {
        id: Math.random().toString(),
        senderId: 'ai',
        senderName: 'OmniBot',
        platform: selectedCustomer.lastPlatform,
        content: response.text,
        timestamp: new Date(),
        sentiment: Sentiment.POSITIVE,
        isAiResponse: true
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSelectCustomer = (customer: typeof INITIAL_CUSTOMERS[0]) => {
    setSelectedCustomer(customer);
    setIsListOpen(false);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-slate-900 overflow-hidden flex-col md:flex-row">
      {/* Mobile Customer List Modal */}
      <AnimatePresence>
        {isListOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 md:hidden"
            onClick={() => setIsListOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Customer List Sidebar */}
      <motion.div 
        initial={false}
        animate={{ x: isListOpen ? 0 : -400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`w-full md:w-96 border-r border-slate-100 dark:border-slate-800 flex flex-col fixed md:static inset-y-24 left-0 md:inset-0 bg-white dark:bg-slate-900 z-40 md:z-0`}
      >
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center justify-between mb-6">
             <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Neural Feed</h2>
             <motion.button 
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.95 }}
               onClick={() => setIsListOpen(false)} 
               className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
             >
               <X className="w-5 h-5" />
             </motion.button>
           </div>
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl pl-12 py-3.5 text-xs font-bold outline-none" />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {INITIAL_CUSTOMERS.map(c => (
             <button 
                key={c.id} 
                onClick={() => handleSelectCustomer(c)}
                className={`w-full p-6 sm:p-8 flex items-start gap-5 transition-all border-b border-slate-50 dark:border-slate-800/50 ${selectedCustomer.id === c.id ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <img src={`https://picsum.photos/seed/${c.id}/100`} className="w-12 h-12 rounded-2xl shadow-lg flex-shrink-0" alt="" />
                <div className="flex-1 text-left min-w-0">
                   <div className="flex justify-between items-center mb-1 gap-2">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">{c.name}</h4>
                      <span className="text-[9px] font-black text-slate-400 flex-shrink-0">12:45 PM</span>
                   </div>
                   <p className="text-[11px] text-slate-500 font-medium line-clamp-1">Last transmission recorded...</p>
                </div>
             </button>
           ))}
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30 dark:bg-slate-950/20 min-w-0">
        {/* Chat Header */}
        <div className="h-20 sm:h-24 px-4 sm:px-10 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
           <div className="flex items-center gap-4 sm:gap-6 min-w-0">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsListOpen(true)} 
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5 text-slate-400" />
              </motion.button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg flex-shrink-0"><Activity className="w-5 h-5 sm:w-6 sm:h-6" /></div>
              <div className="min-w-0">
                 <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tighter uppercase truncate">{selectedCustomer.name}</h3>
                 <p className="text-[9px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest">Connected via {selectedCustomer.lastPlatform}</p>
              </div>
           </div>
           <motion.button 
             whileHover={{ scale: 1.05 }}
             whileTap={{ scale: 0.95 }}
             className="p-2 sm:p-3 text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
           >
             <MoreHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
           </motion.button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-12 space-y-8 sm:space-y-10 custom-scrollbar">
           {messages.filter(m => m.senderId === selectedCustomer.id || m.senderId === 'ai' || m.senderId === 'me').map((m, i) => (
             <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: m.senderId === 'me' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] ${m.senderId === 'me' ? 'bg-slate-900 text-white' : m.isAiResponse ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'} p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-slate-100 dark:border-slate-700/50 shadow-sm text-sm font-medium leading-relaxed break-words`}>
                   {m.content}
                </div>
             </motion.div>
           ))}
           {isTyping && (
             <div className="flex justify-start">
                <div className="bg-slate-200 dark:bg-slate-800 p-4 rounded-full animate-pulse text-[10px] font-black uppercase tracking-widest text-slate-500">OmniBot Thinking...</div>
             </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Input Area - Fixed at bottom */}
        <div className="p-4 sm:p-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
           <div className="max-w-4xl mx-auto flex items-center gap-3 sm:gap-4">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                type="text" 
                placeholder="Neural Command..." 
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl sm:rounded-3xl px-4 sm:px-8 py-3 sm:py-5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" 
              />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={sendMessage} 
                className="p-3 sm:p-5 bg-indigo-600 text-white rounded-xl sm:rounded-3xl shadow-xl hover:bg-indigo-700 transition-all flex-shrink-0"
              >
                <Send className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- Component: Live Assistant (Live API Rebuild) ---
const LiveAssistantView = () => {
  const [isActive, setIsActive] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const toggleCall = async () => {
    if (isActive) {
      if (wsRef.current) wsRef.current.close();
      setIsActive(false);
      return;
    }

    try {
      // Connect to WebSocket proxy instead of direct API
      wsRef.current = new WebSocket('ws://localhost:3001/ws/gemini-live');
      
      audioContextRef.current = {
        input: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 }),
        output: new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 }),
      };
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      wsRef.current.onopen = () => {
        setIsActive(true);
        const source = audioContextRef.current!.input.createMediaStreamSource(stream);
        const scriptProcessor = audioContextRef.current!.input.createScriptProcessor(4096, 1, 1);
        scriptProcessor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          const int16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
          const pcmBlob = {
            data: encodeBase64(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
          };
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'send_audio', payload: { media: pcmBlob } }));
          }
        };
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContextRef.current!.input.destination);
      };

      wsRef.current.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        if (msg.type === 'server_message' && msg.data?.serverContent?.modelTurn?.parts) {
          const base64Audio = msg.data.serverContent.modelTurn.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            const outCtx = audioContextRef.current.output;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
            const buffer = await decodeAudioData(decodeBase64(base64Audio), outCtx, 24000, 1);
            const source = outCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outCtx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => sourcesRef.current.delete(source);
          }
        }
        if (msg.type === 'session_closed') {
          setIsActive(false);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        alert("Connection to audio proxy failed. Ensure proxy is running on port 3001.");
        setIsActive(false);
      };

      wsRef.current.onclose = () => {
        setIsActive(false);
      };
    } catch (e) {
      console.error(e);
      alert("Microphone connection failed.");
    }
  };

  return (
    <div className="p-10 max-w-7xl mx-auto h-[calc(100vh-6rem)] flex flex-col items-center justify-center space-y-16 animate-in fade-in duration-1000">
      <div className="text-center space-y-4">
         <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Live Voice Node</h1>
         <p className="text-slate-500 font-medium text-xl">Real-time low-latency neural conversation gate.</p>
      </div>

      <div className="relative">
        <motion.div 
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2 }}
          className={`w-96 h-96 rounded-full flex flex-col items-center justify-center relative z-10 transition-all ${isActive ? 'bg-indigo-600 shadow-[0_0_100px_rgba(79,70,229,0.3)]' : 'bg-slate-200 dark:bg-slate-800'}`}
        >
          <div className={`p-12 rounded-full mb-6 ${isActive ? 'bg-white/20' : 'bg-white shadow-xl shadow-slate-200/50'}`}>
            {isActive ? <Mic className="w-16 h-16 text-white" /> : <PhoneIncoming className="w-16 h-16 text-slate-400" />}
          </div>
          <p className={`text-xs font-black uppercase tracking-[0.4em] ${isActive ? 'text-white animate-pulse' : 'text-slate-400'}`}>
            {isActive ? 'Connection Stable' : 'Node Offline'}
          </p>
        </motion.div>
        {isActive && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-10" />
             <div className="absolute inset-0 bg-indigo-500 rounded-full animate-ping opacity-5 delay-1000" />
          </div>
        )}
      </div>

      <button 
        onClick={toggleCall}
        className={`px-16 py-8 rounded-[3rem] text-xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 ${isActive ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
      >
        {isActive ? 'Terminate Node' : 'Initialize Voice Link'}
      </button>

      <div className="max-w-2xl w-full p-10 bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 flex items-center gap-8">
        <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30 rounded-3xl flex items-center justify-center text-indigo-600 shadow-inner">
           <Globe className="w-8 h-8" />
        </div>
        <div>
           <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-1">Global Routing</h4>
           <p className="text-xs text-slate-400 font-medium leading-relaxed">Automatic region detection and neural latency optimization enabled.</p>
        </div>
      </div>
    </div>
  );
};

// --- Component: Sidebar ---
const Sidebar = ({ isOpen, toggle }: { isOpen: boolean, toggle: () => void }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={toggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -320 }}
        animate={{ x: isOpen ? 0 : -320 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 text-slate-300 shadow-2xl lg:translate-x-0 lg:static lg:inset-0 lg:animate-none`}
      >
        <div className="flex items-center justify-between h-24 px-10 bg-slate-950/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
              <Zap className="text-white w-7 h-7 fill-current" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter uppercase">OMNIBOT<span className="text-indigo-500">AI</span></span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggle} 
            className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Close sidebar"
          >
            <X className="w-6 h-6" />
          </motion.button>
      </div>
      <nav className="mt-12 px-8 space-y-3">
        {NAV_ITEMS.map((item) => (
          <Link 
            key={item.id} 
            to={"/" + item.id} 
            className={`flex items-center gap-5 px-8 py-5 text-[13px] font-black rounded-[2rem] transition-all uppercase tracking-[0.15em] ${(((item.id === 'dashboard' && (currentPath === '/' || currentPath === '')) || currentPath.includes(item.id)) ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 translate-x-3' : 'hover:bg-white/5 hover:text-white hover:translate-x-1')}`}
          >
            {React.cloneElement(item.icon as any, { className: 'w-6 h-6' })} {item.label}
          </Link>
        ))}
      </nav>
      <div className="absolute bottom-0 w-full p-10 space-y-6">
        <Link to="/billing" className="block p-8 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all shadow-2xl">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-3">Neural Level</p>
          <p className="text-xl font-black text-white tracking-tighter">Pro Elite</p>
        </Link>
        <button className="flex items-center justify-center gap-4 w-full px-8 py-6 text-[12px] font-black text-slate-500 uppercase tracking-[0.25em] border border-white/5 rounded-3xl hover:bg-rose-900/10 hover:text-rose-400 transition-all">
          <LogOut className="w-5 h-5" /> Terminate Session
        </button>
      </div>
      </motion.aside>
    </>
  );
};

// --- Component: Login Form ---
const LoginForm = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = isSignUp
        ? await signUp(email, password)
        : await signInWithEmail(email, password);

      if (result.error) {
        setError(result.error.message);
      } else {
        setEmail('');
        setPassword('');
        onLoginSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 p-12 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
              OmniBot
            </h1>
            <p className="text-slate-500 font-medium">
              {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 rounded-xl text-sm text-rose-600 dark:text-rose-400"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-8 py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-xl"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="w-full text-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

// --- Component: MainShell ---
const MainLayout = ({ children, user, onLogout }: { children?: React.ReactNode; user: User | null; onLogout: () => void }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      onLogout();
    }
  };

  // Close sidebar on route change
  const location = useLocation();
  React.useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 antialiased tracking-tight">
      <Sidebar isOpen={isSidebarOpen} toggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-24 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 sm:px-10 flex items-center justify-between sticky top-0 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 z-30">
          <div className="flex items-center gap-4 sm:gap-8 flex-1 min-w-0">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)} 
              className="lg:hidden p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Open menu"
            >
              <Menu className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </motion.button>
            <div className="relative hidden md:block flex-1 max-w-md">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600" />
              <input 
                type="text" 
                placeholder="Neural Command..." 
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-[1.5rem] pl-14 py-3.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner text-slate-900 dark:text-slate-100" 
              />
            </div>
          </div>
          <div className="flex items-center gap-4 sm:gap-8 ml-4">
            <ThemeToggle />
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate max-w-[120px]">{user?.email || 'User'}</p>
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.15em] sm:tracking-[0.2em]">Pro Tier</p>
              </div>
              <img src="https://picsum.photos/seed/user/100" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl border-2 border-white dark:border-slate-700 shadow-xl cursor-pointer" alt="Avatar" />
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout} 
                className="p-2 sm:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all" 
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 hover:text-rose-400 transition-colors" />
              </motion.button>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
           <AnimatePresence mode="wait">
             <motion.div 
               key={useLocation().pathname}
               initial={{ opacity: 0, x: 10 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -10 }}
               transition={{ duration: 0.3 }}
             >
               {children}
             </motion.div>
           </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity }}>
          <Cpu className="w-12 h-12 text-indigo-600" />
        </motion.div>
      </div>
    );
  }

  // Protected route: show login if no user
  if (!user) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <Router>
      <MainLayout user={user} onLogout={() => setUser(null)}>
        <Routes>
          <Route path="/" element={<DashboardView />} />
          <Route path="/dashboard" element={<DashboardView />} />
          <Route path="/chats" element={<UnifiedInbox />} />
          <Route path="/live" element={<LiveAssistantView />} />
          <Route path="/automations" element={<div className="p-40 text-center font-black text-slate-300 tracking-[0.6em] animate-pulse uppercase">Neural Flow Designer...</div>} />
          <Route path="/analytics" element={<DashboardView />} />
          <Route path="/customers" element={<div className="p-40 text-center font-black text-slate-300 tracking-[0.6em] animate-pulse uppercase">Persistence database...</div>} />
          <Route path="/creative" element={<div className="p-40 text-center font-black text-slate-300 tracking-[0.6em] animate-pulse uppercase">Creative Studio...</div>} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<div className="p-40 text-center font-black text-slate-300 tracking-[0.6em] animate-pulse uppercase">Security Matrix...</div>} />
        </Routes>
      </MainLayout>
    </Router>
  );
}
