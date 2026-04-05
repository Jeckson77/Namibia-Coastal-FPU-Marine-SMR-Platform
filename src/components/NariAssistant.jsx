import React, { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Mic, MicOff, Send, Square, Volume2, VolumeX, X } from 'lucide-react';
import { buildNariKnowledgeBase, getGeneralNariReply, getNariReply, NARI_SUGGESTED_PROMPTS } from '../utils/nariKnowledge';

const WELCOME_MESSAGE = {
  id: 'nari-welcome',
  role: 'assistant',
  text: 'I am Nari, your site copilot. Ask me about reactor performance, geology, hazard zones, live monitoring, repairs, nuclear waste, or the final recommendation. I answer from the information already loaded on this website.',
  references: [],
};

const NariAssistant = ({ siteData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const voicesRef = useRef([]);
  const knowledgeBase = buildNariKnowledgeBase(siteData);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    setSpeechSupported(typeof window.speechSynthesis !== 'undefined');

    if (window.speechSynthesis) {
      const loadVoices = () => {
        voicesRef.current = window.speechSynthesis.getVoices();
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setRecognitionSupported(false);
      return undefined;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      if (transcript) {
        setInputValue(transcript);
        submitQuestion(transcript);
      }
    };

    recognitionRef.current = recognition;
    setRecognitionSupported(true);

    return () => {
      recognition.stop();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const pickProfessionalVoice = () => {
    const preferredNames = ['aria', 'jenny', 'guy', 'sara', 'davis', 'mark', 'andrew', 'libby', 'samantha', 'alloy'];
    const englishVoices = voicesRef.current.filter((voice) => voice.lang?.toLowerCase().startsWith('en'));

    return (
      englishVoices.find((voice) => preferredNames.some((name) => voice.name.toLowerCase().includes(name))) ||
      englishVoices[0] ||
      null
    );
  };

  const stopAllAudio = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    utteranceRef.current = null;
    setIsSpeaking(false);
  };

  const speak = (text) => {
    if (!voiceEnabled || !speechSupported || typeof window === 'undefined') {
      return;
    }

    stopAllAudio();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, ' '));
    const voice = pickProfessionalVoice();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'en-US';
    }
    utterance.rate = 0.95;
    utterance.pitch = 0.95;
    utterance.lang = 'en-US';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const submitQuestion = async (question) => {
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedQuestion,
    };

    const websiteReply = getNariReply({ question: trimmedQuestion, knowledgeBase });
    const hasWebsiteMatch = websiteReply.references.length > 0;
    const reply = hasWebsiteMatch ? websiteReply : await getGeneralNariReply(trimmedQuestion);
    const assistantMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: 'assistant',
      text: reply.text,
      references: reply.references,
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setInputValue('');
    speak(reply.text);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    void submitQuestion(inputValue);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      return;
    }

    stopAllAudio();
    recognitionRef.current.start();
  };

  return (
    <>
      {isOpen && (
        <div className="fixed bottom-24 right-4 z-[120] w-[min(92vw,24rem)] rounded-2xl border border-primary/20 bg-surface-highest/95 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
          <div className="flex items-start justify-between gap-3 border-b border-surface-high px-4 py-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                <Bot size={20} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-lg text-primary">Nari</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-secondary/60">Site copilot · voice active · GPT-style Q&amp;A</div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                stopAllAudio();
                setIsOpen(false);
              }}
              className="rounded-full p-2 text-secondary/70 transition-colors hover:bg-surface-high hover:text-primary"
              aria-label="Close Nari"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-[24rem] space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              {NARI_SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => void submitQuestion(prompt)}
                  className="rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-[11px] text-secondary/85 transition-colors hover:border-primary/30 hover:text-primary"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {messages.map((message) => (
              <div key={message.id} className={`rounded-2xl border px-3 py-3 text-sm ${message.role === 'assistant' ? 'border-primary/15 bg-surface-high text-secondary' : 'border-primary/20 bg-primary/10 text-primary'}`}>
                <div className="whitespace-pre-line leading-relaxed">{message.text}</div>
                {message.references?.length ? (
                  <div className="mt-2 border-t border-surface-high pt-2 text-[10px] uppercase tracking-[0.14em] text-secondary/55">
                    Sources: {message.references.join(' · ')}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <div className="border-t border-surface-high px-4 py-4">
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                rows={3}
                placeholder="Ask Nari anything about the platform, hazards, monitoring, repairs, or recommendation."
                className="w-full resize-none rounded-xl border border-surface-high bg-surface-lowest px-3 py-3 text-sm text-white outline-none transition-colors placeholder:text-secondary/35 focus:border-primary/35"
              />

              <div className="text-[10px] uppercase tracking-[0.14em] text-secondary/50">
                Nari can answer site questions directly and also handle general date, time, arithmetic, and topic-summary questions.
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleListening}
                    disabled={!recognitionSupported}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${recognitionSupported ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10' : 'border-surface-high text-secondary/40'} ${isListening ? 'bg-red-500/10 border-red-500/30 text-red-300' : ''}`}
                  >
                    {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                    {isListening ? 'Listening' : 'Mic'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setVoiceEnabled((current) => !current)}
                    disabled={!speechSupported}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${speechSupported ? 'border-primary/20 bg-primary/5 text-primary hover:bg-primary/10' : 'border-surface-high text-secondary/40'}`}
                  >
                    {voiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                    Voice
                  </button>
                  <button
                    type="button"
                    onClick={stopAllAudio}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors ${isListening || isSpeaking ? 'border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15' : 'border-surface-high text-secondary/45'}`}
                  >
                    <Square size={14} />
                    Stop
                  </button>
                </div>

                <button type="submit" className="btn-primary inline-flex items-center gap-2 px-4 py-2 text-xs">
                  <Send size={14} />
                  Ask Nari
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (isOpen) {
            stopAllAudio();
          }
          setIsOpen((current) => !current);
        }}
        className="fixed bottom-6 right-4 z-[120] inline-flex items-center gap-3 rounded-full border border-primary/20 bg-primary px-5 py-3 text-sm font-semibold text-background shadow-[0_12px_40px_rgba(195,245,255,0.18)] transition-transform hover:scale-[1.01]"
      >
        <MessageSquare size={18} />
        Nari Copilot
      </button>
    </>
  );
};

export default NariAssistant;