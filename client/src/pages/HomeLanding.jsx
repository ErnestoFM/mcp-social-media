import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';
import { useState } from 'react';
import {
    ArrowRight, CheckCircle, Zap, BarChart3,
    Users, Globe, Shield, Star, Box,
    Calendar, Sparkles, TrendingUp, Copy
} from 'lucide-react';

const HomeLanding = () => {
    // Estado para el Playground de IA (Pequeña demo interactiva)
    const [topic, setTopic] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        if (!topic) return;
        setIsGenerating(true);
        // Simulación de respuesta de IA
        setTimeout(() => {
            setAiResult(`🚀 ¡Increíble avance en #${topic}! \n\nDescubre cómo esto está cambiando el juego para siempre. La clave está en la consistencia y la innovación. ¿Tú qué opinas? 👇\n\n#${topic.replace(/\s/g, '')} #Innovación #Futuro`);
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white overflow-x-hidden">

            {/* --- HERO SECTION CON 3D --- */}
            <section className="relative w-full pt-12 pb-20 lg:pt-32 lg:pb-44 overflow-hidden bg-white">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="flex flex-col space-y-6 z-10">
                            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 w-fit text-xs font-semibold transition-colors bg-indigo-100 text-indigo-700">
                                ✨ Nuevo: Motor de IA v2.0 Disponible
                            </div>
                            <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl xl:text-7xl text-gray-900 leading-tight">
                                Tu Agencia de Marketing en <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Piloto Automático</span>
                            </h1>
                            <p className="max-w-[600px] text-gray-500 md:text-xl leading-relaxed">
                                Deja de pelear con el algoritmo. Nuestra IA analiza, crea y publica contenido viral mientras tú duermes.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link
                                    to="/register"
                                    className="inline-flex h-14 items-center justify-center rounded-xl bg-indigo-600 px-8 text-lg font-medium text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:-translate-y-1"
                                >
                                    Empezar Gratis
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    to="/demo"
                                    className="inline-flex h-14 items-center justify-center rounded-xl border-2 border-gray-200 bg-white px-8 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                                >
                                    Ver Demo
                                </Link>
                            </div>
                        </div>

                        {/* Modelo 3D */}
                        <div className="relative h-[400px] lg:h-[600px] w-full hidden md:block">
                            <Spline scene="https://prod.spline.design/2weraFjrEtEX36Jj/scene.splinecode" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- NUEVA SECCIÓN DE FEATURES (Tu Código Adaptado) --- */}
            <section className="w-full py-24 bg-slate-50">
                <div className="container px-4 md:px-6 mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                            Todo lo que necesitas en un solo lugar
                        </h2>
                        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                            Potentes herramientas diseñadas para escalar tu presencia digital sin esfuerzo.
                        </p>
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-indigo-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Calendar className="h-8 w-8 text-indigo-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Publicación Automática</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Programa tu contenido con semanas de anticipación. Nuestro sistema inteligente lo publica en los mejores horarios.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-purple-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="h-8 w-8 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">IA Generativa</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Crea captions virales, hashtags estratégicos y respuestas a comentarios impulsado por GPT-4.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-red-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-pink-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <BarChart3 className="h-8 w-8 text-pink-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Analíticas Avanzadas</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Dashboards en tiempo real. Descubre qué funciona y optimiza tu estrategia con datos claros.
                                </p>
                            </div>
                        </div>

                        {/* Feature 4 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-blue-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Users className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Multi-cuenta</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Gestiona ilimitadas cuentas de Instagram, Facebook y más desde un solo dashboard centralizado.
                                </p>
                            </div>
                        </div>

                        {/* Feature 5 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-green-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <Shield className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Moderación Inteligente</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Detecta spam y comentarios tóxicos automáticamente. Mantén tu comunidad sana y segura.
                                </p>
                            </div>
                        </div>

                        {/* Feature 6 */}
                        <div className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-2xl transition-all hover:-translate-y-2 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-amber-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="relative z-10">
                                <div className="p-3 bg-orange-100 rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
                                    <TrendingUp className="h-8 w-8 text-orange-600" />
                                </div>
                                <h3 className="text-2xl font-bold mb-3 text-gray-900">Análisis de Hashtags</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Descubre hashtags de alto rendimiento en tu nicho. Compara tu performance con las tendencias.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PLAYGROUND INTERACTIVO (Demo Rápida) --- */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container px-4 mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-8">Pruébalo ahora mismo</h2>
                    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-2 md:p-4 text-left">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-4">
                            <div className="flex gap-2 items-center mb-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="Escribe un tema (ej: Café de especialidad, Zapatillas running...)"
                                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-700"
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={!topic || isGenerating}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {isGenerating ? 'Generando...' : 'Generar Post'}
                                </button>
                            </div>
                        </div>

                        <div className="min-h-[120px] p-4 text-gray-600 text-sm whitespace-pre-wrap font-mono bg-white">
                            {aiResult ? aiResult : <span className="text-gray-400 italic">Aquí aparecerá tu post generado con IA...</span>}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- CASOS DE USO --- */}
            <section className="py-20 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col lg:flex-row gap-12 items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="text-3xl font-bold leading-tight text-gray-900">Diseñado para creadores ambiciosos</h2>

                            <div className="space-y-6">
                                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-colors">
                                    <div className="mt-1"><div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center"><CheckCircle size={20} /></div></div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">Influencers y Marcas Personales</h4>
                                        <p className="text-gray-500">Mantén tus redes activas 24/7 sin estar pegado al celular.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-colors">
                                    <div className="mt-1"><div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center"><CheckCircle size={20} /></div></div>
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">Agencias de Marketing</h4>
                                        <p className="text-gray-500">Gestiona 50 clientes con el equipo de 2. Automatiza reportes.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">SR</div>
                                    <div>
                                        <p className="text-xl font-bold">"Duplicó mi tráfico en un mes"</p>
                                        <p className="text-indigo-200">Sofia R. - Dueña de Joyería</p>
                                    </div>
                                </div>
                                <p className="text-lg opacity-90 italic">
                                    "Antes tardaba 3 horas en planear la semana. Con la IA de MCP, lo hago en 15 minutos y los posts tienen más alcance que nunca."
                                </p>
                                <div className="flex gap-1 text-yellow-400">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} fill="currentColor" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PRECIOS --- */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500 rounded-full blur-[128px]"></div>
                </div>

                <div className="container px-4 mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Precios transparentes</h2>
                        <p className="text-gray-400">Empieza gratis, escala cuando lo necesites.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 flex flex-col hover:border-gray-500 transition-colors">
                            <div className="mb-4"><span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Starter</span></div>
                            <h3 className="text-3xl font-bold mb-2">Gratis</h3>
                            <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-500 font-normal">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> 1 Usuario</li>
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> 3 Post con IA al mes</li>
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> Analíticas Básicas</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-gray-600 font-semibold hover:bg-gray-700 transition-colors">Comenzar Gratis</button>
                        </div>

                        {/* Pro */}
                        <div className="bg-gradient-to-b from-indigo-600 to-purple-700 rounded-3xl p-8 flex flex-col transform md:-translate-y-4 shadow-2xl relative border border-indigo-500">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">MÁS POPULAR</div>
                            <h3 className="text-3xl font-bold mb-2">Creador Pro</h3>
                            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-indigo-200 font-normal">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-white text-sm">
                                <li className="flex gap-3"><CheckCircle size={16} /> Usuarios Ilimitados</li>
                                <li className="flex gap-3"><CheckCircle size={16} /> IA Ilimitada (GPT-4)</li>
                                <li className="flex gap-3"><CheckCircle size={16} /> 10 Cuentas Sociales</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl bg-white text-indigo-700 font-bold hover:bg-gray-50 transition-colors">Prueba 14 días Gratis</button>
                        </div>

                        {/* Agency */}
                        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 flex flex-col hover:border-gray-500 transition-colors">
                            <div className="mb-4"><span className="bg-gray-700 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Agencia</span></div>
                            <h3 className="text-3xl font-bold mb-2">Business</h3>
                            <div className="text-4xl font-bold mb-6">$99<span className="text-lg text-gray-500 font-normal">/mes</span></div>
                            <ul className="space-y-4 mb-8 flex-1 text-gray-300 text-sm">
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> Todo lo de Pro</li>
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> API Access & Whitelabel</li>
                                <li className="flex gap-3"><CheckCircle size={16} className="text-indigo-400" /> Soporte 24/7</li>
                            </ul>
                            <button className="w-full py-3 rounded-xl border border-gray-600 font-semibold hover:bg-gray-700 transition-colors">Contactar Ventas</button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomeLanding;