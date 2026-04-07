import React, { useState, useRef, useEffect } from "react";
import API from "../api/axios";

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "👋 Bonjour ! Je suis votre assistant IA Server Room.\n\nJe connais vos données en temps réel — posez-moi n'importe quelle question !\n\nExemple : *\"Combien de salles j'ai ?\"* ou *\"Quel est mon site ?\"*" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Voice recognition setup
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR) {
      const r = new SR();
      r.lang = "fr-FR";
      r.continuous = false;
      r.interimResults = false;
      r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
      r.onerror = () => setIsListening(false);
      r.onend = () => setIsListening(false);
      recognitionRef.current = r;
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const speak = (text) => {
    const clean = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/`(.*?)`/g, '$1');
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = "fr-FR";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const formatMessage = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code style="background:rgba(14,165,233,0.15);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px;color:#7dd3fc">$1</code>')
      .split('\n').join('<br/>');
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      // Historique pour le contexte (sans le premier message de bienvenue)
      const history = newMessages.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await API.post('/chatbot/message', {
        message: msg,
        history
      });

      setIsTyping(false);
      const reply = res.data.reply;
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      speak(reply);

    } catch (err) {
      setIsTyping(false);
      const errMsg = "❌ Erreur de connexion. Vérifiez que le serveur tourne.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    "Combien de salles j'ai ?",
    "Quel est mon site ?",
    "Qui est autorisé dans mes salles ?",
    "Comment créer un utilisateur ?",
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        .cb-wrap * { box-sizing: border-box; margin: 0; padding: 0; }
        .cb-toggle { position:fixed; bottom:28px; right:28px; z-index:9999; width:58px; height:58px; border-radius:50%; border:none; cursor:pointer; background:linear-gradient(135deg,#0f172a,#0ea5e9); box-shadow:0 0 0 3px rgba(14,165,233,0.2),0 8px 28px rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); }
        .cb-toggle:hover { transform:scale(1.1); }
        .cb-ring { position:absolute; inset:-4px; border-radius:50%; border:2px solid rgba(14,165,233,0.35); animation:cbRing 2s ease-out infinite; }
        @keyframes cbRing { 0%{transform:scale(1);opacity:.7} 100%{transform:scale(1.45);opacity:0} }
        .cb-panel { position:fixed; bottom:96px; right:28px; width:370px; height:545px; background:#070f1c; border:1px solid rgba(14,165,233,0.16); border-radius:18px; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 24px 70px rgba(0,0,0,0.6); z-index:9998; animation:cbIn 0.28s cubic-bezier(0.34,1.56,0.64,1); font-family:'Syne',sans-serif; }
        @keyframes cbIn { from{transform:translateY(14px) scale(0.96);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        .cb-head { background:linear-gradient(135deg,#0f172a,#19324f); padding:13px 15px; border-bottom:1px solid rgba(14,165,233,0.13); display:flex; align-items:center; gap:10px; }
        .cb-av { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#0ea5e9,#38bdf8); display:flex; align-items:center; justify-content:center; font-size:16px; box-shadow:0 0 12px rgba(14,165,233,0.4); flex-shrink:0; }
        .cb-hinfo { flex:1; }
        .cb-name { font-size:13px; font-weight:700; color:#e2e8f0; }
        .cb-status { font-size:10.5px; color:#38bdf8; display:flex; align-items:center; gap:4px; margin-top:2px; font-family:'JetBrains Mono',monospace; }
        .cb-sdot { width:5px; height:5px; background:#22c55e; border-radius:50%; animation:cbBlink 1.5s ease-in-out infinite; }
        @keyframes cbBlink { 0%,100%{opacity:1} 50%{opacity:.3} }
        .cb-x { background:rgba(255,255,255,0.06); border:none; color:#94a3b8; width:26px; height:26px; border-radius:7px; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all 0.18s; }
        .cb-x:hover { background:rgba(255,255,255,0.12); color:#e2e8f0; }
        .cb-body { flex:1; overflow-y:auto; padding:13px; display:flex; flex-direction:column; gap:10px; scrollbar-width:thin; scrollbar-color:rgba(14,165,233,0.2) transparent; }
        .cb-body::-webkit-scrollbar { width:3px; }
        .cb-body::-webkit-scrollbar-thumb { background:rgba(14,165,233,0.2); border-radius:3px; }
        .cb-row { display:flex; flex-direction:column; animation:cbFade 0.22s ease; }
        @keyframes cbFade { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        .cb-row.user { align-items:flex-end; }
        .cb-row.assistant { align-items:flex-start; }
        .cb-bub { max-width:87%; padding:9px 13px; border-radius:13px; font-size:12.5px; line-height:1.65; }
        .cb-bub.user { background:linear-gradient(135deg,#0ea5e9,#0284c7); color:#fff; border-bottom-right-radius:3px; }
        .cb-bub.assistant { background:rgba(14,165,233,0.07); border:1px solid rgba(14,165,233,0.13); color:#cbd5e1; border-bottom-left-radius:3px; }
        .cb-typing { display:flex; align-items:center; gap:4px; padding:10px 14px; background:rgba(14,165,233,0.07); border:1px solid rgba(14,165,233,0.13); border-radius:13px; border-bottom-left-radius:3px; width:fit-content; }
        .cb-td { width:5px; height:5px; background:#0ea5e9; border-radius:50%; animation:cbBounce 1.1s ease-in-out infinite; }
        .cb-td:nth-child(2){animation-delay:.18s} .cb-td:nth-child(3){animation-delay:.36s}
        @keyframes cbBounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
        .cb-qs { padding:8px 13px; display:flex; gap:5px; overflow-x:auto; border-top:1px solid rgba(14,165,233,0.09); scrollbar-width:none; }
        .cb-qs::-webkit-scrollbar { display:none; }
        .cb-q { background:rgba(14,165,233,0.06); border:1px solid rgba(14,165,233,0.16); color:#7dd3fc; padding:4px 9px; border-radius:14px; font-size:10.5px; cursor:pointer; white-space:nowrap; transition:all 0.15s; font-family:'Syne',sans-serif; }
        .cb-q:hover { background:rgba(14,165,233,0.14); color:#e0f2fe; }
        .cb-foot { padding:9px 13px; border-top:1px solid rgba(14,165,233,0.1); background:rgba(5,12,22,0.9); display:flex; gap:6px; align-items:center; }
        .cb-inp { flex:1; background:rgba(14,165,233,0.05); border:1px solid rgba(14,165,233,0.16); border-radius:9px; padding:8px 11px; color:#e2e8f0; font-size:12.5px; font-family:'Syne',sans-serif; outline:none; transition:border-color 0.18s; }
        .cb-inp:focus { border-color:rgba(14,165,233,0.4); }
        .cb-inp::placeholder { color:#334155; }
        .cb-ibtn { width:34px; height:34px; border-radius:8px; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.15s; flex-shrink:0; font-size:14px; }
        .cb-mic { background:rgba(14,165,233,0.07); border:1px solid rgba(14,165,233,0.16); }
        .cb-mic:hover { background:rgba(14,165,233,0.14); }
        .cb-mic.on { background:rgba(239,68,68,0.1); border-color:rgba(239,68,68,0.3); animation:cbMic 1s ease-in-out infinite; }
        @keyframes cbMic { 0%,100%{box-shadow:0 0 0 0 rgba(239,68,68,0.2)} 50%{box-shadow:0 0 0 5px rgba(239,68,68,0)} }
        .cb-send { background:linear-gradient(135deg,#0ea5e9,#0284c7); color:white; }
        .cb-send:hover { transform:scale(1.06); }
        .cb-send:disabled { opacity:0.3; cursor:not-allowed; transform:none; }
        .cb-ai-badge { font-size:10px; background:rgba(14,165,233,0.12); border:1px solid rgba(14,165,233,0.2); color:#38bdf8; padding:2px 7px; border-radius:10px; font-family:'JetBrains Mono',monospace; }
      `}</style>

      <div className="cb-wrap">
        {/* Bouton flottant */}
        <button className="cb-toggle" onClick={() => setIsOpen(o => !o)}>
          <div className="cb-ring"/>
          {isOpen
            ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            : <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><circle cx="9" cy="10" r="1" fill="white"/><circle cx="12" cy="10" r="1" fill="white"/><circle cx="15" cy="10" r="1" fill="white"/></svg>
          }
        </button>

        {isOpen && (
          <div className="cb-panel">
            {/* Header */}
            <div className="cb-head">
              <div className="cb-av">🤖</div>
              <div className="cb-hinfo">
                <div className="cb-name">Assistant IA Server Room</div>
                <div className="cb-status">
                  <div className="cb-sdot"/>
                  <span>En ligne</span>
                  <span className="cb-ai-badge">IA</span>
                </div>
              </div>
              <button className="cb-x" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* Messages */}
            <div className="cb-body">
              {messages.map((m, i) => (
                <div key={i} className={`cb-row ${m.role}`}>
                  <div
                    className={`cb-bub ${m.role}`}
                    dangerouslySetInnerHTML={{ __html: m.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/`(.*?)`/g, '<code style="background:rgba(14,165,233,0.15);padding:1px 5px;border-radius:3px;font-family:monospace;font-size:11px;color:#7dd3fc">$1</code>')
                      .split('\n').join('<br/>')
                    }}
                  />
                </div>
              ))}
              {isTyping && (
                <div className="cb-row assistant">
                  <div className="cb-typing">
                    <div className="cb-td"/><div className="cb-td"/><div className="cb-td"/>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef}/>
            </div>

            {/* Questions rapides */}
            <div className="cb-qs">
              {quickActions.map((q, i) => (
                <button key={i} className="cb-q" onClick={() => sendMessage(q)} disabled={loading}>{q}</button>
              ))}
            </div>

            {/* Input */}
            <div className="cb-foot">
              <input
                className="cb-inp"
                placeholder="Posez votre question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
                disabled={loading}
              />
              <button
                className={`cb-ibtn cb-mic ${isListening ? 'on' : ''}`}
                onClick={toggleVoice}
                title="Commande vocale"
              >🎤</button>
              <button
                className="cb-ibtn cb-send"
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
              >
                {loading
                  ? <div style={{width:12,height:12,border:'2px solid rgba(255,255,255,0.3)',borderTop:'2px solid white',borderRadius:'50%',animation:'cbRing 0.6s linear infinite'}}/>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                }
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatbotWidget;
