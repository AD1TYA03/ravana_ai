import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);

  // Initialize speech synthesis and set up RAVANA's voice
const laughAudioRef = useRef(null); // NEW REF

useEffect(() => {
  synthRef.current = window.speechSynthesis;

  // Initialize laugh audio
  laughAudioRef.current = new Audio('/sounds/ravana_laugh.mp3');
  laughAudioRef.current.volume = 0.85;

  const initialGreeting = {
    role: 'model',
    text: 'I am RAVANA... the ten-headed demon king of Lanka. Your soul trembles before my ancient wisdom. What knowledge do you seek from the depths of darkness?'
  };
  setChatHistory([initialGreeting]);

  setTimeout(() => {
    speakMessage(initialGreeting.text);
  }, 500);

  return () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    laughAudioRef.current?.pause();
    laughAudioRef.current = null;
  };
}, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Play RAVANA's cruel laugh
const playDemonicLaugh = () => {
  if (!laughAudioRef.current) return;

  laughAudioRef.current.currentTime = 0;
  laughAudioRef.current
    .play()
    .catch((error) => console.error('Error playing demonic laugh:', error));
};


  // Enhanced demonic voice function
  const speakMessage = (text) => {
    if (!synthRef.current) return;
    
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;
    
    // Enhanced demonic voice settings - faster than before
    utterance.rate = 0.85; // Faster speech for better experience
    utterance.pitch = 0.3; // Much deeper pitch for demonic effect
    utterance.volume = 1;
    
    // Try to find the most suitable male voice
    const voices = synthRef.current.getVoices();
    const demonicVoice = voices.find(voice => 
      (voice.name.includes('Microsoft David') || 
       voice.name.includes('Google UK English Male') ||
       voice.name.includes('Alex') ||
       voice.name.includes('Daniel') ||
       voice.name.includes('Microsoft Mark') ||
       voice.gender === 'male') &&
      voice.lang.includes('en')
    ) || voices.find(voice => voice.lang.includes('en-US') || voice.lang.includes('en-GB'));
    
    if (demonicVoice) {
      utterance.voice = demonicVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthRef.current.speak(utterance);
  };

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSendMessage = async () => {
    if (prompt.trim() === '' || isSpeaking) return;

    const currentUserMessage = { role: 'user', text: prompt };
    const apiContentsForGemini = [];

    for (let i = 0; i < chatHistory.length; i++) {
      const message = chatHistory[i];
      const formattedMessage = { role: message.role, parts: [{ text: message.text }] };

      if (apiContentsForGemini.length > 0 && apiContentsForGemini[apiContentsForGemini.length - 1].role === message.role) {
        apiContentsForGemini[apiContentsForGemini.length - 1] = formattedMessage;
      } else {
        apiContentsForGemini.push(formattedMessage);
      }
    }

    const formattedCurrentUserMessage = { role: currentUserMessage.role, parts: [{ text: currentUserMessage.text }] };
    if (apiContentsForGemini.length > 0 && apiContentsForGemini[apiContentsForGemini.length - 1].role === 'user') {
      apiContentsForGemini[apiContentsForGemini.length - 1] = formattedCurrentUserMessage;
    } else {
      apiContentsForGemini.push(formattedCurrentUserMessage);
    }

    setChatHistory((prev) => [...prev, currentUserMessage]);
    setPrompt('');
    setIsLoading(true);
    
    // Play demonic laugh when RAVANA starts thinking
    setTimeout(() => {
      playDemonicLaugh();
    }, 300);

    try {
      const payload = { contents: apiContentsForGemini };
      const apiKey = process.env.REACT_APP_GOOGLE_API_KEY;
      if (!apiKey) {
  console.error("Gemini API key is missing. Check your .env file.");
}
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const botResponseText = result.candidates[0].content.parts[0].text;
        const botMessage = { role: 'model', text: botResponseText };
        setChatHistory((prev) => [...prev, botMessage]);
        speakMessage(botResponseText);
      } else {
        const errorMessage = { role: 'model', text: 'The void consumes my voice... darkness interferes with my ancient powers. Try summoning me again, mortal.' };
        setChatHistory((prev) => [...prev, errorMessage]);
        speakMessage(errorMessage.text);
      }
    } catch (error) {
      console.error('Error fetching from Gemini API:', error);
      const errorMessage = { role: 'model', text: 'The gates of Lanka are sealed... my demonic essence cannot reach through the shadows. Check your mortal connections.' };
      setChatHistory((prev) => [...prev, errorMessage]);
      speakMessage(errorMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading && !isSpeaking) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const stopSpeaking = () => {
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-gray-100 font-mono">
      {/* Minimalistic header */}
      <header className="border-b border-red-900/30 p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <h1 className="text-xl font-light tracking-widest text-red-500">
              RAVANA
            </h1>
          </div>
          {isSpeaking && (
            <button 
              onClick={stopSpeaking}
              className="text-red-400 hover:text-red-300 transition-colors text-sm"
              title="Silence"
            >
              [SILENCE]
            </button>
          )}
        </div>
      </header>

      {/* Minimalistic chat area */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {chatHistory.map((message, index) => (
            <div key={index} className="group">
              <div className={`flex items-start space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'model' && (
                  <div className="w-2 h-2 bg-red-600 rounded-full mt-2 animate-pulse"></div>
                )}
                <div
                  className={`max-w-3xl break-words ${
                    message.role === 'user'
                      ? 'text-gray-400 text-right ml-auto'
                      : 'text-red-100'
                  }`}
                >
                  <div className={`text-xs mb-2 ${message.role === 'user' ? 'text-gray-600' : 'text-red-800'}`}>
                    {message.role === 'user' ? 'MORTAL' : 'RAVANA'}
                  </div>
                  <div className="leading-relaxed whitespace-pre-wrap overflow-wrap-break-word">
                    {message.text}
                  </div>
                  {message.role === 'model' && (
                    <button 
                      onClick={() => speakMessage(message.text)}
                      className="text-xs text-red-700 hover:text-red-500 mt-3 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      [SPEAK]
                    </button>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-2 h-2 bg-gray-600 rounded-full mt-2"></div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-2 h-2 bg-red-600 rounded-full mt-2 animate-pulse"></div>
              <div className="text-red-100 max-w-3xl">
                <div className="text-xs mb-2 text-red-800">RAVANA</div>
                <div className="flex items-center space-x-2">
                  <div className="horror-typing"></div>
                  <span className="text-red-400">*cruel laughter echoes* ...summoning dark wisdom...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Minimalistic input area */}
      <footer className="border-t border-red-900/30 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start space-x-4">
            <div className="w-2 h-2 bg-gray-600 rounded-full mt-8 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <div className="text-xs mb-2 text-gray-600">MORTAL</div>
              <div className="relative">
                <textarea
                  className="w-full bg-transparent text-gray-100 focus:outline-none resize-none placeholder-gray-700 border-b border-gray-800 focus:border-red-900 pb-2 pr-20"
                  placeholder="speak to the darkness..."
                  value={prompt}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  rows={1}
                  style={{ 
                    minHeight: '24px', 
                    maxHeight: '120px',
                    lineHeight: '24px'
                  }}
                  disabled={isSpeaking}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || prompt.trim() === '' || isSpeaking}
                  className={`absolute right-0 bottom-2 text-sm transition-colors ${
                    isLoading || prompt.trim() === '' || isSpeaking
                      ? 'text-gray-800 cursor-not-allowed'
                      : 'text-red-600 hover:text-red-400'
                  }`}
                >
                  {isSpeaking ? '[SPEAKING]' : isLoading ? '[LAUGHING]' : '[SUMMON]'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Minimalistic horror styling */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500&display=swap');
        
        body {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 300;
        }
        
        .horror-typing {
          display: inline-flex;
          align-items: center;
        }
        
        .horror-typing::before {
          content: '●';
          color: #dc2626;
          animation: horrorPulse 1.5s infinite;
          margin-right: 4px;
        }
        
        .horror-typing::after {
          content: '●';
          color: #dc2626;
          animation: horrorPulse 1.5s infinite 0.5s;
          margin-left: 4px;
        }
        
        @keyframes horrorPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #7f1d1d;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #991b1b;
        }
        
        /* Enhanced text formatting and overflow handling */
        .overflow-wrap-break-word {
          overflow-wrap: break-word;
          word-wrap: break-word;
          word-break: break-word;
          hyphens: auto;
        }
        
        /* Prevent horizontal scrolling */
        * {
          box-sizing: border-box;
        }
        
        /* Auto-resize textarea */
        textarea {
          font-family: 'JetBrains Mono', monospace;
          font-weight: 300;
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        
        /* Subtle horror animations */
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse {
          animation: flicker 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default App;