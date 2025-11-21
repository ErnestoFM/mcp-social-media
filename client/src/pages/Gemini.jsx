import { useState } from 'react';
import {
    Sparkles, Image as ImageIcon, Lightbulb, Video, Wand2,
    MessageSquare, TrendingUp, Send, Loader2, Copy, Download, Check
} from 'lucide-react';

const Gemini = () => {
    const [activeTab, setActiveTab] = useState('ideas');
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Función para llamar al backend
    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setResult(null);
        setImageLoaded(false);

        try {
            const response = await fetch('/api/gemini/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    type: activeTab,
                    prompt: prompt
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Server Error Details:", response.status, response.statusText, errorData);
                throw new Error(`Error en la generación: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // La API devuelve { type: '...', data: ... }
            // Si es 'ideas' o 'video', data.data es un array de objetos
            // Si es 'hashtags', data.data es un array de strings
            // Si es 'caption', data.data es un string

            if (data.type === 'image') {
                // Usamos Pollinations.ai para generar la imagen real basada en el prompt mejorado por Gemini
                // data.data contiene el prompt en inglés generado por Gemini
                const encodedPrompt = encodeURIComponent(data.data);
                const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}`;

                setResult({
                    type: 'image',
                    data: imageUrl
                });
            } else {
                setResult(data);
            }

        } catch (error) {
            console.error("Error generating content:", error);
            // Podrías mostrar un toast o alerta aquí
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const tabs = [
        { id: 'ideas', name: 'Lluvia de Ideas', icon: Lightbulb, color: 'yellow' },
        { id: 'caption', name: 'Generar Caption', icon: MessageSquare, color: 'blue' },
        { id: 'hashtags', name: 'Hashtags', icon: TrendingUp, color: 'purple' },
        { id: 'image', name: 'Generar Imagen', icon: ImageIcon, color: 'pink' },
        { id: 'video', name: 'Ideas de Video', icon: Video, color: 'green' }
    ];

    const getColorClasses = (color) => {
        const colors = {
            yellow: 'bg-yellow-100 text-yellow-700 border-yellow-500',
            blue: 'bg-blue-100 text-blue-700 border-blue-500',
            purple: 'bg-purple-100 text-purple-700 border-purple-500',
            pink: 'bg-pink-100 text-pink-700 border-pink-500',
            green: 'bg-green-100 text-green-700 border-green-500'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Inspírate con IA</h1>
                        <p className="text-slate-500">Crea contenido increíble con el poder de Gemini</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                setResult(null);
                                setPrompt('');
                            }}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap ${isActive
                                ? `${getColorClasses(tab.color)} border-2 shadow-md`
                                : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                        >
                            <Icon size={20} />
                            {tab.name}
                        </button>
                    );
                })}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Input Section */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Wand2 className="text-indigo-600" size={20} />
                            Describe lo que necesitas
                        </h3>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={getPlaceholder(activeTab)}
                            className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                        />

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || !prompt.trim()}
                            className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Generar con IA
                                </>
                            )}
                        </button>
                    </div>

                    {/* Tips */}
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                        <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Lightbulb className="text-indigo-600" size={18} />
                            Tips para mejores resultados
                        </h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            {getTips(activeTab).map((tip, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-indigo-600 mt-1">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Results Section */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Resultado</h3>

                    {!result && !isLoading && (
                        <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
                            <Sparkles size={48} className="mb-4 opacity-50" />
                            <p>Escribe tu prompt y haz clic en "Generar con IA"</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="h-full flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                            <p className="text-slate-600">La IA está trabajando...</p>
                        </div>
                    )}

                    {result && (
                        <div className="space-y-4">
                            {/* Ideas */}
                            {result.type === 'ideas' && (
                                <div className="space-y-3">
                                    {result.data.map((idea, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-slate-800">{idea.title}</h4>
                                                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                                    {idea.platform}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{idea.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Text (Caption) */}
                            {result.type === 'text' && (
                                <div className="relative">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 whitespace-pre-wrap text-slate-700">
                                        {result.data}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(result.data)}
                                        className="absolute top-2 right-2 p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                    >
                                        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    </button>
                                </div>
                            )}

                            {/* Hashtags */}
                            {result.type === 'hashtags' && (
                                <div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {result.data.map((tag, i) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium cursor-pointer hover:bg-indigo-200 transition-colors"
                                                onClick={() => copyToClipboard(tag)}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(result.data.join(' '))}
                                        className="w-full py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        Copiar todos
                                    </button>
                                </div>
                            )}

                            {/* Image */}
                            {result.type === 'image' && (
                                <div className="space-y-4">
                                    <div className="relative group">
                                        <img
                                            src={result.data}
                                            alt="Generated"
                                            className="w-full rounded-xl border border-slate-200 shadow-md"
                                            onLoad={() => setImageLoaded(true)}
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-xl" />
                                    </div>
                                    {imageLoaded && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await fetch(result.data);
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const link = document.createElement('a');
                                                    link.href = url;
                                                    link.download = `gemini-image-${Date.now()}.jpg`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                    window.URL.revokeObjectURL(url);
                                                } catch (e) {
                                                    console.error("Error downloading image:", e);
                                                    // Fallback for simple link download if fetch fails (CORS)
                                                    const link = document.createElement('a');
                                                    link.href = result.data;
                                                    link.target = '_blank';
                                                    link.download = `gemini-image-${Date.now()}.jpg`;
                                                    document.body.appendChild(link);
                                                    link.click();
                                                    document.body.removeChild(link);
                                                }
                                            }}
                                            className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium shadow-lg shadow-indigo-200"
                                        >
                                            <Download size={18} />
                                            Descargar Imagen
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Video Ideas */}
                            {result.type === 'video' && (
                                <div className="space-y-3">
                                    {result.data.map((idea, i) => (
                                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-bold text-slate-800">{idea.title}</h4>
                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                    {idea.platform}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-600">{idea.description}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper functions
const getPlaceholder = (tab) => {
    const placeholders = {
        ideas: 'Ej: Dame ideas de posts para una tienda de ropa deportiva enfocada en mujeres jóvenes...',
        caption: 'Ej: Escribe un caption para una foto de un café con vista al mar, estilo relajado y motivacional...',
        hashtags: 'Ej: Necesito hashtags para un post sobre fitness y vida saludable...',
        image: 'Ej: Una imagen minimalista de un escritorio de trabajo con laptop, café y plantas...',
        video: 'Ej: Ideas de videos cortos para TikTok sobre recetas saludables...'
    };
    return placeholders[tab] || 'Describe lo que necesitas...';
};

const getTips = (tab) => {
    const tips = {
        ideas: [
            'Sé específico sobre tu nicho o industria',
            'Menciona tu audiencia objetivo',
            'Indica el tono que prefieres (profesional, casual, divertido)'
        ],
        caption: [
            'Describe el contexto de la imagen o video',
            'Menciona el tono deseado (inspiracional, educativo, divertido)',
            'Indica si quieres emojis o hashtags incluidos'
        ],
        hashtags: [
            'Menciona el tema principal del post',
            'Indica tu nicho o industria',
            'Especifica si quieres hashtags populares o de nicho'
        ],
        image: [
            'Describe la escena con detalles',
            'Menciona el estilo (realista, ilustración, minimalista)',
            'Indica colores o ambiente deseado'
        ],
        video: [
            'Especifica la duración aproximada',
            'Menciona la plataforma (TikTok, Reels, YouTube)',
            'Describe el tipo de contenido (tutorial, entretenimiento, educativo)'
        ]
    };
    return tips[tab] || [];
};

export default Gemini;
