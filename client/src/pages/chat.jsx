"use client";
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

export default function ChatPage() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hola, soy tu asistente de MCP. ¿Qué quieres publicar o analizar hoy?' }
  ]);

  const handleSend = () => {
    if (!input.trim()) return;
    // Aquí añadirías la lógica para llamar a tu backend
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    // Simulación de respuesta
    setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', content: 'Entendido, estoy procesando tu solicitud con las herramientas MCP...' }]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-slate-50">
        <h2 className="font-bold text-lg flex items-center gap-2">
          <Bot className="text-blue-600" /> Agente Social Media (MCP)
        </h2>
        <p className="text-xs text-slate-500">Powered by Claude & Tus Herramientas</p>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
              m.role === 'user' 
                ? 'bg-blue-600 text-white rounded-br-none' 
                : 'bg-white border shadow-sm text-slate-700 rounded-bl-none'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ej: Analiza mis últimos posts y crea un hilo sobre..."
            className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}