'use client';
import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function Chat() {
    // State
    const [messages, setMessages] = useState([
        {
            id: 1,
            role: 'system',
            content: 'Hello! I am your AI language coach. How can I help you practice today?',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeChat, setActiveChat] = useState('DeepSeek AI');

    const messagesEndRef = useRef(null);

    // Mock Contacts
    const contacts = [
        { id: 1, name: 'DeepSeek AI', lastMsg: 'Hello! I am your AI language coach...', time: '12:00 PM', unread: 0, avatar: '🤖', online: true },
        { id: 2, name: 'Grammar Bot', lastMsg: 'Great job! No errors found.', time: 'Yesterday', unread: 2, avatar: '📚', online: false },
        { id: 3, name: 'Vocab Trainer', lastMsg: 'Word of the day: Serendipity', time: 'Monday', unread: 0, avatar: '🧠', online: false },
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const userMessage = { id: Date.now(), role: 'user', content: input, timestamp: currentTime };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('http://localhost:5001/api/deepseek/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage.content })
            });

            if (res.ok) {
                const data = await res.json();
                const botMessage = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                console.error("Failed to fetch response");
                const errorMessage = {
                    id: Date.now() + 1,
                    role: 'error',
                    content: "⚠️ I couldn't reach the server. Please check your connection.",
                    timestamp: currentTime
                };
                setMessages(prev => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                role: 'error',
                content: "⚠️ Network error. Is the backend running?",
                timestamp: currentTime
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen bg-[#d1d7db] dark:bg-[#0b141a] flex flex-col font-sans overflow-hidden">
            <Navbar />

            {/* Main App Container */}
            <div className="flex-1 flex pt-20 pb-4 px-4 max-w-[1700px] mx-auto w-full gap-4 h-[calc(100vh-20px)]">

                {/* 1. LEFT SIDEBAR (Contacts) */}
                <div className="w-[30%] min-w-[350px] bg-white dark:bg-[#111b21] rounded-lg shadow-sm flex flex-col border-r border-gray-200 dark:border-gray-800">

                    {/* Sidebar Header */}
                    <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700 rounded-tl-lg">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden cursor-pointer">
                            {/* User Avatar Placeholder */}
                            <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold">U</div>
                        </div>
                        <div className="flex gap-4 text-gray-500 dark:text-gray-400">
                            <span className="cursor-pointer hover:text-gray-700">⭕</span>
                            <span className="cursor-pointer hover:text-gray-700">💬</span>
                            <span className="cursor-pointer hover:text-gray-700">⋮</span>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="p-3 bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-gray-800">
                        <div className="bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg flex items-center px-4 py-2">
                            <span className="text-gray-500 mr-4">🔍</span>
                            <input type="text" placeholder="Search or start new chat" className="bg-transparent flex-1 outline-none text-sm text-gray-700 dark:text-white" />
                        </div>
                    </div>

                    {/* Contact List */}
                    <div className="flex-1 overflow-y-auto">
                        {contacts.map(contact => (
                            <div
                                key={contact.id}
                                onClick={() => setActiveChat(contact.name)}
                                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#f5f6f6] dark:hover:bg-[#202c33] transition-colors ${activeChat === contact.name ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : ''}`}
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-2xl relative">
                                    {contact.avatar}
                                    {contact.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
                                </div>
                                <div className="flex-1 min-w-0 border-b border-gray-100 dark:border-gray-800 pb-3">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{contact.name}</h3>
                                        <span className={`text-xs ${contact.unread > 0 ? 'text-[#00a884] font-bold' : 'text-gray-500'}`}>{contact.time}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-[80%]">{contact.lastMsg}</p>
                                        {contact.unread > 0 && (
                                            <span className="bg-[#00a884] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">{contact.unread}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>


                {/* 2. RIGHT PANEL (Chat Window) */}
                <div className="flex-1 flex flex-col bg-[#efeae2] dark:bg-[#0b141a] rounded-lg shadow-sm relative overflow-hidden">
                    {/* Wallpaper Pattern */}
                    <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                        style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}>
                    </div>

                    {/* Chat Header */}
                    <div className="h-[60px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center justify-between px-4 py-2 border-b border-gray-300 dark:border-gray-700 z-10">
                        <div className="flex items-center gap-4 cursor-pointer">
                            <div className="w-10 h-10 rounded-full bg-[#00a884] flex items-center justify-center text-white text-xl">
                                🤖
                            </div>
                            <div>
                                <h2 className="font-bold text-gray-900 dark:text-white">{activeChat}</h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">online</p>
                            </div>
                        </div>
                        <div className="flex gap-5 text-gray-500 dark:text-gray-400">
                            <span className="cursor-pointer hover:text-gray-700">🔍</span>
                            <span className="cursor-pointer hover:text-gray-700">⋮</span>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-8 space-y-2 z-10">
                        {activeChat === 'DeepSeek AI' ? (
                            <>
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`relative max-w-[60%] rounded-lg px-3 py-2 shadow-sm text-sm ${msg.role === 'user'
                                                ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-gray-900 dark:text-gray-100 rounded-tr-none'
                                                : msg.role === 'error'
                                                    ? 'bg-red-100 dark:bg-red-900 text-red-800'
                                                    : 'bg-white dark:bg-[#202c33] text-gray-900 dark:text-gray-100 rounded-tl-none'
                                            }`}>
                                            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                            <span className={`text-[10px] block text-right mt-1 opacity-60 ${msg.role === 'user' ? 'text-gray-600' : 'text-gray-500'}`}>
                                                {msg.timestamp}
                                                {msg.role === 'user' && <span className="ml-1 text-blue-400">✓✓</span>}
                                            </span>

                                            {/* Caret */}
                                            {msg.role === 'user' ? (
                                                <span className="absolute -right-2 top-0 text-[#d9fdd3] dark:text-[#005c4b]">
                                                    <svg viewBox="0 0 8 13" height="13" width="8"><path opacity=".13" fill="#00000000" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path><path fill="currentColor" d="M1.533 3.568L8 12.193V1H2.812C1.042 1 .474 2.156 1.533 3.568z"></path></svg>
                                                </span>
                                            ) : (
                                                <span className="absolute -left-2 top-0 text-white dark:text-[#202c33]">
                                                    <svg viewBox="0 0 8 13" height="13" width="8"><path opacity=".13" fill="#00000000" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path><path fill="currentColor" d="M5.188 1H0v11.193l6.467-8.625C7.526 2.156 6.958 1 5.188 1z"></path></svg>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {loading && (
                                    <div className="flex justify-start">
                                        <div className="bg-white dark:bg-[#202c33] rounded-lg px-4 py-3 shadow-sm flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <span className="text-6xl mb-4">🚧</span>
                                <p>This feature is in development.</p>
                                <p>Chat safely with DeepSeek AI for now.</p>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input Area */}
                    <div className="min-h-[62px] bg-[#f0f2f5] dark:bg-[#202c33] flex items-center gap-2 px-4 py-2 z-10">
                        <span className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 text-xl">😊</span>
                        <span className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 text-xl">📎</span>

                        <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-lg flex items-center px-4 py-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) handleSend(e);
                                }}
                                placeholder="Type a message"
                                className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500"
                                disabled={loading}
                            />
                        </div>

                        {input.trim() ? (
                            <button onClick={handleSend} disabled={loading} className="p-3 text-[#00a884] hover:bg-gray-200 rounded-full">
                                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" version="1.1" x="0px" y="0px" enableBackground="new 0 0 24 24"><path fill="currentColor" d="M1.101,21.757L23.8,12.028L1.101,2.3l0.011,7.912l13.623,1.816L1.112,13.845 L1.101,21.757z"></path></svg>
                            </button>
                        ) : (
                            <button className="p-3 text-gray-500 hover:text-gray-700">
                                <span className="text-xl">🎙️</span>
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
