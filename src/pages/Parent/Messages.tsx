import React, { useState } from 'react';
import { Search, MessageSquare, Send, User, Bell } from 'lucide-react';
import { cn } from '@/utils';

interface ChatMessage {
  id: string;
  sender: 'teacher' | 'parent';
  text: string;
  time: string;
}

interface Chat {
  id: number;
  name: string;
  role: string;
  lastMsg: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

const initialChats: Chat[] = [
  {
    id: 1,
    name: 'Dr. Emily Carter',
    role: 'Mathematics Teacher',
    lastMsg: 'Emma is doing great in her recent quiz!',
    time: '10:30 AM',
    unread: true,
    messages: [
      { id: '1', sender: 'teacher', text: 'Hello Mrs. Johnson! I wanted to let you know that Emma scored 18/20 in her Mathematics quiz today. She\'s showing great improvement in Algebra.', time: '10:25 AM' },
      { id: '2', sender: 'parent', text: "That's wonderful news! Thank you for the update, Dr. Carter. She has been studying very hard at home.", time: '10:30 AM' },
      { id: '3', sender: 'teacher', text: 'Emma is doing great in her recent quiz!', time: '10:32 AM' },
    ],
  },
  {
    id: 2,
    name: 'School Admin',
    role: 'Administration',
    lastMsg: 'The new school calendar is out.',
    time: 'Yesterday',
    unread: false,
    messages: [
      { id: '1', sender: 'teacher', text: 'The new school calendar is out. Please check the parent portal for important dates.', time: 'Yesterday' },
    ],
  },
  {
    id: 3,
    name: 'Hostel Warden',
    role: 'Residential Life',
    lastMsg: 'Liam has settled in well for the term.',
    time: '2 days ago',
    unread: false,
    messages: [
      { id: '1', sender: 'teacher', text: 'Liam has settled in well for the term. He is participating in all activities.', time: '2 days ago' },
    ],
  },
];

export default function ParentMessages() {
  const [chats] = useState<Chat[]>(initialChats);
  const [selectedChatId, setSelectedChatId] = useState(1);
  const [messageText, setMessageText] = useState('');
  const [allMessages, setAllMessages] = useState<Record<number, ChatMessage[]>>(() => {
    const map: Record<number, ChatMessage[]> = {};
    initialChats.forEach((c) => { map[c.id] = c.messages; });
    return map;
  });

  const selectedChat = chats.find((c) => c.id === selectedChatId) || chats[0];
  const currentMessages = allMessages[selectedChatId] || [];

  const handleSend = () => {
    if (!messageText.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: ChatMessage = { id: Date.now().toString(), sender: 'parent', text: messageText.trim(), time: timeStr };
    setAllMessages((prev) => ({ ...prev, [selectedChatId]: [...(prev[selectedChatId] || []), newMsg] }));
    setMessageText('');
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Messages
          </h2>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {chats.map((chat) => (
            <div 
              key={chat.id} 
              onClick={() => setSelectedChatId(chat.id)}
              className={cn(
                "p-4 flex gap-3 cursor-pointer transition-colors relative group",
                chat.id === selectedChatId ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
              )}
            >
              {chat.id === selectedChatId && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}
              <div className="relative">
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name)}&background=eff6ff&color=2563eb&bold=true`} 
                  alt={chat.name} 
                  className="w-12 h-12 rounded-xl object-cover"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <p className={cn("text-sm font-bold truncate", chat.unread ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-slate-300")}>
                    {chat.name}
                  </p>
                  <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap">{chat.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-1">{chat.role}</p>
                <p className={cn("text-xs truncate", chat.unread ? "font-bold text-blue-600" : "text-slate-500")}>
                  {chat.lastMsg}
                </p>
              </div>
              {chat.unread && <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-3">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=eff6ff&color=2563eb&bold=true`} 
              alt={selectedChat.name} 
              className="w-10 h-10 rounded-xl"
            />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{selectedChat.name}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-medium text-slate-500">{selectedChat.role}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
              <User className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-center">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Conversation</span>
          </div>

          {currentMessages.map((msg) => (
            <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", msg.sender === 'parent' ? 'ml-auto flex-row-reverse' : '')}>
              {msg.sender === 'teacher' && (
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.name)}&background=eff6ff&color=2563eb&bold=true`} className="w-8 h-8 rounded-lg shrink-0 mt-auto" />
              )}
              <div className={cn("p-4 rounded-2xl", msg.sender === 'parent' ? 'bg-blue-600 rounded-br-none text-white shadow-lg shadow-blue-900/10' : 'bg-slate-100 dark:bg-slate-800 rounded-bl-none')}>
                <p className={cn("text-sm", msg.sender === 'parent' ? 'text-white' : 'text-slate-700 dark:text-slate-300')}>{msg.text}</p>
                <span className={cn("text-[10px] mt-2 block", msg.sender === 'parent' ? 'text-blue-200 text-right' : 'text-slate-400')}>{msg.time}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <form className="flex gap-3" onSubmit={(e) => { e.preventDefault(); handleSend(); }}>
            <input 
              type="text" 
              placeholder="Type your message..." 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
            <button type="submit" className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
