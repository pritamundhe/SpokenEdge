'use client';
import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Sentiment from 'sentiment';
import { io } from 'socket.io-client';

export default function Practice() {
    const [status, setStatus] = useState('idle'); // idle, recording, processing, speaking
    const [user, setUser] = useState(null);
    const [messages, setMessages] = useState([]);

    const [transcript, setTranscript] = useState('');
    const [error, setError] = useState('');

    // New Features State
    const [topic, setTopic] = useState('Daily Routine');
    const [sessionTime, setSessionTime] = useState(0);
    const [sentimentData, setSentimentData] = useState({ score: 0, comparative: 0 }); // Sentiment Analysis State

    const [textInput, setTextInput] = useState('');

    const mediaRecorderRef = useRef(null);
    const synthRef = useRef(null);
    const timerRef = useRef(null);
    const messagesEndRef = useRef(null);
    const sentimentRef = useRef(new Sentiment()); // Initialize Sentiment Analyzer
    const socketRef = useRef(null);
    const committedTranscriptRef = useRef('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, transcript]);

    useEffect(() => {
        // Initialize Socket
        socketRef.current = io('http://localhost:5001');

        socketRef.current.on('connect', () => {
            console.log("Connected to backend socket");
        });

        socketRef.current.on('transcription_result', ({ text, isFinal }) => {
            if (!text) return;

            if (isFinal) {
                // Determine if we need a space
                const prefix = committedTranscriptRef.current ? committedTranscriptRef.current + ' ' : '';
                committedTranscriptRef.current = prefix + text;
                setTranscript(committedTranscriptRef.current);
            } else {
                // Show committed + interim
                const prefix = committedTranscriptRef.current ? committedTranscriptRef.current + ' ' : '';
                setTranscript(prefix + text);
            }
        });

        const token = localStorage.getItem('token');
        if (token) {
            fetch('http://localhost:5001/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(data => {
                    if (data && data.user) setUser(data.user);
                })
                .catch(err => console.error("Failed to fetch profile", err));
        }

        if (typeof window !== 'undefined') {
            synthRef.current = window.speechSynthesis;
        }

        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (synthRef.current) synthRef.current.cancel();
            clearInterval(timerRef.current);
            if (socketRef.current) socketRef.current.disconnect();
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        if (status === 'recording' || status === 'speaking' || status === 'processing') {
            timerRef.current = setInterval(() => {
                setSessionTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [status]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const startRecording = async () => {
        setError('');
        setTranscript('');
        committedTranscriptRef.current = '';

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Context for Silence Detection
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            let silenceStart = Date.now();
            const silenceThreshold = 10; // Low volume threshold
            const silenceDuration = 4000; // 4 seconds

            const checkForSilence = () => {
                if (mediaRecorderRef.current?.state !== 'recording') return;

                analyser.getByteFrequencyData(dataArray);

                // Calculate average volume
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;

                if (average < silenceThreshold) {
                    if (Date.now() - silenceStart > silenceDuration) {
                        console.log("Silence detected, stopping recording...");
                        stopRecording();
                        return;
                    }
                } else {
                    silenceStart = Date.now(); // Reset timer if noise detected
                }

                requestAnimationFrame(checkForSilence);
            };

            // Send chunks every 2 seconds
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0 && socketRef.current) {
                    socketRef.current.emit('transcribe_chunk', event.data);
                }
            };

            mediaRecorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                audioContext.close();

                // Commit the transcript
                setTimeout(() => {
                    setStatus('processing');
                }, 500);
            };

            mediaRecorder.start(2000); // Smaller chunks for faster updates
            setStatus('recording');

            // Start monitoring silence
            checkForSilence();

        } catch (err) {
            console.error("Error accessing microphone:", err);
            setError("Microphone access denied or not available.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            // Status will be updated in onstop logic or via effect
            // We set it to processing to trigger the commit logic below
            setStatus('processing');
        }
    };

    // Effect to handle commit after processing state reached and transcript is ready
    useEffect(() => {
        if (status === 'processing' && transcript) {
            // Commit logic
            processMessage(transcript);
        } else if (status === 'processing' && !transcript) {
            // Maybe wait a bit or go to idle if nothing transcribed
            const timeout = setTimeout(() => setStatus('idle'), 2000);
            return () => clearTimeout(timeout);
        }
    }, [status]); // Add transcript to dep array with caution to avoid loops

    const processMessage = async (messageText) => {
        if (!messageText.trim()) {
            setStatus('idle');
            return;
        }

        const currentTime = formatTime(sessionTime);

        // Add User Message
        const userMsg = { id: Date.now(), role: 'user', content: messageText, timestamp: currentTime };
        setMessages(prev => [...prev, userMsg]);

        setTranscript('');
        committedTranscriptRef.current = '';
        setTextInput('');

        // Live Sentiment Analysis
        if (sentimentRef.current) {
            const result = sentimentRef.current.analyze(messageText);
            setSentimentData(result);
        }

        try {
            // Prepare history for backend
            const history = messages
                .filter(m => m.role === 'user' || m.role === 'assistant')
                .map(m => ({ role: m.role, content: m.content }));

            const res = await fetch('http://localhost:5001/api/deepseek/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    history: history
                })
            });

            if (res.ok) {
                const data = await res.json();
                const aiMsg = {
                    id: Date.now() + 1,
                    role: 'assistant',
                    content: data.reply,
                    timestamp: formatTime(sessionTime)
                };
                setMessages(prev => [...prev, aiMsg]);
                speakResponse(data.reply);
            } else {
                throw new Error('Failed to get response');
            }
        } catch (err) {
            setError('Error processing request.');
            setStatus('idle');
        }
    };

    const handleTextSubmit = (e) => {
        e.preventDefault();
        processMessage(textInput);
    };

    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState(null);

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            setVoices(availableVoices);

            // Try to find a "natural" or "Google" voice
            const preferredVoice = availableVoices.find(v =>
                v.name.includes('Google US English') ||
                v.name.includes('Microsoft Zira') ||
                v.name.includes('Natural')
            );

            if (preferredVoice) {
                setSelectedVoice(preferredVoice);
            } else {
                const englishVoice = availableVoices.find(v => v.lang.startsWith('en'));
                setSelectedVoice(englishVoice || availableVoices[0]);
            }
        };

        loadVoices();

        if (typeof window !== 'undefined' && window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speakResponse = (text) => {
        if (!synthRef.current) return;

        synthRef.current.cancel();

        setStatus('speaking');
        const utterance = new SpeechSynthesisUtterance(text);

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }

        utterance.onend = () => {
            setStatus('idle');
        };

        synthRef.current.speak(utterance);
    };

    // Calculate WPM
    // Simplified WPM for now as we don't have partial transcripts
    const wpm = 0;

    return (
        <div className="min-h-screen bg-[#050505] font-sans selection:bg-teal-500/30 text-white overflow-hidden">
            <Navbar />

            <div className="pt-24 pb-6 px-4 max-w-7xl mx-auto h-[calc(100vh)] flex gap-6">

                {/* --- LEFT PANEL: CHAT WINDOW --- */}
                <div className="flex-[2] bg-[#0b0e14] border border-white/5 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl">

                    {/* Header */}
                    <div className="px-6 py-4 flex justify-between items-center bg-[#0b0e14] border-b border-white/5 z-20">
                        <h2 className="text-lg font-semibold text-white tracking-wide">Daily Progress</h2>

                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.location.href = '/'}
                                className="flex items-center gap-2 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg transition-all text-sm font-medium"
                            >
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                Stop
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">

                        {messages.filter(m => m.role !== 'system').map((msg) => (
                            <div key={msg.id} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up group`}>
                                <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

                                    {/* Avatar */}
                                    <div className="flex-shrink-0 mt-auto">
                                        {msg.role === 'user' ? (
                                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden">
                                                {user?.profileImage ? (
                                                    <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">{user?.name?.charAt(0) || 'Y'}</div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#1e293b] border border-white/5 flex items-center justify-center">
                                                <span className="text-xs font-bold text-yellow-500">AI</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`relative px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed shadow-sm ${msg.role === 'user'
                                        ? 'bg-[#064e3b]/40 border border-emerald-500/50 text-emerald-100 rounded-br-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] min-w-[60px] backdrop-blur-sm'
                                        : 'bg-[#1e293b]/40 border border-white/20 text-slate-300 rounded-bl-sm shadow-[0_4px_15px_rgba(0,0,0,0.5)] min-w-[60px] backdrop-blur-sm'
                                        }`}>
                                        {msg.content}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Live Transcript Box with Avatar */}
                        {transcript && (
                            <div className="flex justify-end w-full animate-fade-in-up">
                                <div className="flex gap-4 max-w-[85%] flex-row-reverse">
                                    {/* User Avatar Next to Transcript */}
                                    <div className="flex-shrink-0 mt-auto">
                                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 overflow-hidden">
                                            {user?.profileImage ? (
                                                <img src={user.profileImage} alt="User" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-indigo-400">{user?.name?.charAt(0) || 'Y'}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Transcript Box */}
                                    <div className="bg-[#1e293b] border border-white/10 rounded-xl rounded-br-sm p-4 w-full relative overflow-hidden shadow-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Live Transcript</span>
                                        </div>
                                        <p className="text-lg text-white font-medium mb-3 leading-relaxed">
                                            {transcript}<span className="animate-pulse">|</span>
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono border-t border-white/5 pt-2">
                                            <span>{transcript.split(' ').length} words</span>
                                            <span>•</span>
                                            <span>Updating live...</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="flex justify-center animate-fade-in-up my-4">
                                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-red-400 text-sm">
                                    {error}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-[#0b0e14] border-t border-white/5">
                        <div className="flex items-center gap-3 bg-[#1e293b]/50 rounded-xl px-2 py-2 border border-white/5 focus-within:border-emerald-500/30 transition-all duration-300">

                            <button
                                onClick={status !== 'recording' ? startRecording : stopRecording}
                                disabled={status === 'processing' || status === 'speaking'}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300 ${status === 'recording'
                                    ? 'bg-red-500/10 text-red-500 animate-pulse'
                                    : 'text-zinc-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {status === 'recording' ? (
                                    <div className="w-3 h-3 bg-current rounded-full" />
                                ) : (
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                                    </svg>
                                )}
                            </button>

                            <input
                                type="text"
                                className="flex-1 bg-transparent border-none outline-none text-[15px] text-slate-200 placeholder-zinc-500 font-medium px-2"
                                placeholder={status === 'recording' ? "Listening..." : "Start speaking or type..."}
                                value={textInput}
                                onChange={(e) => {
                                    const newText = e.target.value;
                                    setTextInput(newText);
                                }}
                                onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit(e)}
                                disabled={status === 'recording'}
                            />

                            <button
                                onClick={handleTextSubmit}
                                disabled={!textInput.trim() || status === 'recording'}
                                className={`p-2 rounded-lg transition-all ${textInput.trim()
                                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                                    : 'text-zinc-600'
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT PANEL: LIVE ANALYSIS DASHBOARD --- */}
                <div className="flex-1 bg-[#0b0e14] border-l border-white/5 p-5 flex flex-col h-full overflow-hidden">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-1">Live Speech Analysis</h2>
                            <p className="text-[11px] text-zinc-500 font-medium">Real-time metrics and feedback</p>
                        </div>
                        <div className="flex items-center">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${status === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`}></div>
                                <span className={`text-[9px] font-bold tracking-widest ${status === 'recording' ? 'text-red-500' : 'text-zinc-600'}`}>
                                    {status === 'recording' ? 'RECORDING' : 'IDLE'}
                                </span>
                            </div>

                            {/* Speaking Pace in Header */}
                            <div className="flex items-center gap-2 border-l border-white/10 pl-3 ml-3">
                                <span className="text-xs font-bold text-indigo-400">
                                    {wpm > 0 ? wpm : '--'} WPM
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dashboard Grid */}
                    <div className="grid grid-cols-1 gap-3 h-full content-start">
                        {/* Tone & Sentiment Row */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#12141a] rounded-xl p-3 border border-white/5 min-h-[80px] flex flex-col justify-between hover:border-white/10 transition-colors">
                                <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Voice Tone</h3>
                                <div className="text-xs font-medium text-zinc-300">
                                    {
                                        sentimentData.score > 2 ? 'Excited' :
                                            sentimentData.score > 0 ? 'Friendly' :
                                                sentimentData.score < -2 ? 'Angry' :
                                                    sentimentData.score < 0 ? 'Concerned' : 'Neutral'
                                    }
                                </div>
                            </div>
                            <div className="bg-[#12141a] rounded-xl p-3 border border-white/5 min-h-[80px] flex flex-col justify-between hover:border-white/10 transition-colors">
                                <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Sentiment</h3>
                                <div className={`text-xs font-medium ${sentimentData.score > 0 ? 'text-emerald-400' :
                                    sentimentData.score < 0 ? 'text-red-400' : 'text-zinc-300'
                                    }`}>
                                    {sentimentData.score > 0 ? 'Positive' : sentimentData.score < 0 ? 'Negative' : 'Neutral'}
                                    <span className="opacity-50 ml-1">({sentimentData.score})</span>
                                </div>
                            </div>
                        </div>

                        {/* Audio Visualization Replacement */}
                        <div className="bg-[#12141a] rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                            <h3 className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Microphone Status</h3>
                            <div className="flex items-center justify-center p-4">
                                {status === 'recording' ? (
                                    <div className="text-red-500 text-sm animate-pulse font-medium">Capture Active</div>
                                ) : (
                                    <div className="text-zinc-600 text-sm">Standby</div>
                                )}
                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
}
