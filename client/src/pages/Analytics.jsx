import React, { useState } from 'react';
import axios from 'axios';
import { BarChart2, TrendingUp, Users, Search, ArrowRight, Activity, Hash } from 'lucide-react';

const API_URL = 'http://localhost:3000/api/tool-call';

export default function Analytics() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [hashtag, setHashtag] = useState('');
    const [activeTab, setActiveTab] = useState('overview');

    const callMcpTool = async (toolName, args = {}) => {
        setLoading(true);
        setResult(null);
        try {
            const response = await axios.post(API_URL, {
                name: toolName,
                args: args
            });

            if (response.data && response.data.content && response.data.content[0]) {
                setResult({
                    type: 'success',
                    message: response.data.content[0].text
                });
            } else {
                setResult({ type: 'error', message: 'Respuesta inesperada del servidor' });
            }
        } catch (error) {
            console.error('Error calling MCP tool:', error);
            setResult({
                type: 'error',
                message: error.response?.data?.error || error.message || 'Error al conectar con el servidor'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeHashtag = (e) => {
        e.preventDefault();
        if (!hashtag) return;
        callMcpTool('analyze_hashtag_performance', { hashtag_name: hashtag });
    };

    const handleCompareHashtag = () => {
        if (!hashtag) return;
        callMcpTool('compare_my_stats_to_hashtag', { hashtag_name: hashtag });
    };

    const handleListCollaborations = (platform) => {
        callMcpTool('list_collaborations', { platform });
    };

    return (
        <div className="p-8 min-h-screen bg-slate-50/50">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                    <BarChart2 className="w-8 h-8 text-blue-600" />
                    Analytics Dashboard
                </h1>
                <p className="text-slate-500 mt-2">Gestiona y analiza el rendimiento de tus redes sociales.</p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Controls */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Hashtag Analysis Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Hash className="w-5 h-5 text-purple-500" />
                            Análisis de Hashtags
                        </h2>
                        <form onSubmit={handleAnalyzeHashtag} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Hashtag</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={hashtag}
                                        onChange={(e) => setHashtag(e.target.value)}
                                        placeholder="ej. marketing"
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                    />
                                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="submit"
                                    disabled={loading || !hashtag}
                                    className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Analizar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCompareHashtag}
                                    disabled={loading || !hashtag}
                                    className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Comparar
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Collaborations Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Users className="w-5 h-5 text-green-500" />
                            Colaboraciones
                        </h2>
                        <div className="space-y-3">
                            <button
                                onClick={() => handleListCollaborations('instagram')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all group"
                            >
                                <span className="font-medium text-slate-700">Reporte Instagram</span>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                            <button
                                onClick={() => handleListCollaborations('facebook')}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-all group"
                            >
                                <span className="font-medium text-slate-700">Reporte Facebook</span>
                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                            </button>
                        </div>
                    </div>

                </div>

                {/* Right Column: Results Display */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-full min-h-[500px] flex flex-col">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
                            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-slate-500" />
                                Consola de Resultados
                            </h3>
                            {loading && (
                                <span className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
                                    Procesando...
                                </span>
                            )}
                        </div>

                        <div className="flex-1 p-6 overflow-auto font-mono text-sm">
                            {result ? (
                                <div className={`whitespace-pre-wrap ${result.type === 'error' ? 'text-red-600' : 'text-slate-700'}`}>
                                    {result.message}
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                                    <BarChart2 className="w-16 h-16 opacity-20" />
                                    <p>Selecciona una herramienta para ver los resultados aquí</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
