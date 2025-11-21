import React, { useState } from 'react';
import { Cookie, Info, Settings, Check, Shield, BarChart3, Megaphone, Save } from 'lucide-react';

const CookiesPage = () => {
    // Estado para las preferencias
    const [preferences, setPreferences] = useState({
        essential: true, // Siempre true
        functional: true,
        analytics: false,
        marketing: false
    });

    const [isSaved, setIsSaved] = useState(false);

    // Manejar el cambio de los switches
    const togglePreference = (key) => {
        if (key === 'essential') return; // No permitir cambios en esenciales
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    // Manejar "Aceptar Todas"
    const acceptAll = () => {
        setPreferences({
            essential: true,
            functional: true,
            analytics: true,
            marketing: true
        });
        handleSave();
    };

    // Simular guardado
    const handleSave = () => {
        // Aquí iría la lógica para guardar en localStorage o backend
        console.log("Preferencias guardadas:", preferences);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-4xl">

                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-6 shadow-sm border border-amber-200">
                        <Cookie size={40} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Centro de Privacidad</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Valoramos tu privacidad. Tú decides qué datos compartes con nosotros y cuáles prefieres mantener privados.
                    </p>
                </div>

                {/* Explicación Breve */}
                <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-10">
                    <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Info className="text-indigo-600" size={24} />
                        ¿Cómo usamos las cookies?
                    </h2>
                    <p className="text-slate-600 leading-relaxed">
                        Usamos cookies para asegurar que MCP funcione correctamente, para recordar tus ajustes y para entender cómo usas nuestra plataforma. A continuación puedes configurar qué cookies permites.
                    </p>
                </div>

                {/* Panel de Configuración */}
                <div className="space-y-6 mb-12">
                    <h3 className="text-xl font-bold text-slate-900 ml-2">Configuración de Cookies</h3>

                    {/* 1. ESENCIALES (Bloqueado) */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 opacity-75">
                        <div className="p-3 bg-green-100 text-green-700 rounded-xl h-fit w-fit">
                            <Shield size={24} />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-bold text-slate-900">Estrictamente Necesarias</h3>
                                <span className="text-xs font-bold text-green-700 bg-green-100 px-3 py-1 rounded-full uppercase tracking-wide">
                                    Siempre Activo
                                </span>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-0">
                                Estas cookies son vitales para que el sitio funcione (login, seguridad, balanceo de carga). No guardan información personal identificable y no se pueden desactivar en nuestros sistemas.
                            </p>
                        </div>
                    </div>

                    {/* 2. FUNCIONALES */}
                    <CookieOption
                        icon={<Settings size={24} />}
                        colorClass="bg-blue-100 text-blue-700"
                        title="Funcionales y Preferencias"
                        description="Permiten que el sitio recuerde tus elecciones (como tu nombre de usuario, idioma o región) para proporcionar funciones mejoradas y más personales."
                        isOn={preferences.functional}
                        onToggle={() => togglePreference('functional')}
                    />

                    {/* 3. ANALÍTICAS */}
                    <CookieOption
                        icon={<BarChart3 size={24} />}
                        colorClass="bg-purple-100 text-purple-700"
                        title="Rendimiento y Analíticas"
                        description="Nos ayudan a contar visitas y fuentes de tráfico para medir y mejorar el rendimiento de nuestro sitio. Toda la información es agregada y anónima."
                        isOn={preferences.analytics}
                        onToggle={() => togglePreference('analytics')}
                    />

                    {/* 4. MARKETING */}
                    <CookieOption
                        icon={<Megaphone size={24} />}
                        colorClass="bg-pink-100 text-pink-700"
                        title="Publicidad y Marketing"
                        description="Pueden ser establecidas por nuestros socios publicitarios para construir un perfil de tus intereses y mostrarte anuncios relevantes en otros sitios."
                        isOn={preferences.marketing}
                        onToggle={() => togglePreference('marketing')}
                    />
                </div>

                {/* Botones de Acción (Sticky Bottom en móviles o fijo al final) */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky bottom-6 z-10 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-sm text-slate-500">
                        {isSaved ? (
                            <span className="text-green-600 flex items-center gap-2 font-bold animate-pulse">
                                <Check size={18} /> Preferencias guardadas correctamente
                            </span>
                        ) : (
                            "Tus preferencias se guardarán por 12 meses."
                        )}
                    </div>

                    <div className="flex w-full md:w-auto gap-3">
                        <button
                            onClick={acceptAll}
                            className="flex-1 md:flex-none px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                        >
                            Aceptar Todas
                        </button>
                        <button
                            onClick={handleSave}
                            className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            Guardar Selección
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

// Componente auxiliar para las tarjetas con Toggle
const CookieOption = ({ icon, colorClass, title, description, isOn, onToggle }) => {
    return (
        <div className={`bg-white p-6 rounded-xl border transition-all duration-200 flex flex-col md:flex-row gap-6 ${isOn ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-slate-200 shadow-sm'}`}>
            <div className={`p-3 rounded-xl h-fit w-fit flex-shrink-0 ${colorClass}`}>
                {icon}
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start mb-2 gap-4">
                    <h3 className="text-lg font-bold text-slate-900">{title}</h3>

                    {/* Toggle Switch Personalizado */}
                    <button
                        onClick={onToggle}
                        className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${isOn ? 'bg-indigo-600' : 'bg-slate-300'}`}
                        aria-label={`Toggle ${title}`}
                    >
                        <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${isOn ? 'translate-x-7' : 'translate-x-0'}`}></div>
                    </button>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed mb-0 pr-8">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default CookiesPage;