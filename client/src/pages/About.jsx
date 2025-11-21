import { Link } from 'react-router-dom';
import { Code2, Heart, Zap, ArrowRight, Mail, MapPin, Send, Sparkles } from 'lucide-react';

const AboutPage = () => {

    const handleContactSubmit = (e) => {
        e.preventDefault();
        alert("¡Gracias por tu mensaje! Al estar en desarrollo, te responderé personalmente lo antes posible.");
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">

            {/* --- 1. HERO: Honestidad Radical --- */}
            <section className="relative py-20 md:py-32 bg-slate-50 overflow-hidden">
                {/* Fondo decorativo */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-100 rounded-full blur-3xl opacity-50"></div>

                <div className="container px-4 mx-auto relative z-10 text-center">
                    <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 mb-6">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Proyecto en Fase Beta
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        De un proyecto de clase <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">a tu herramienta diaria.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Sin grandes corporaciones detrás. Solo un estudiante de ingeniería resolviendo un problema real con el poder de la IA.
                    </p>
                </div>
            </section>

            {/* --- 2. STATS REALISTAS (Indie Hacker Vibe) --- */}
            <section className="py-10 bg-white border-b border-gray-100">
                <div className="container px-4 mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">v1.0</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Versión Beta</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">100%</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Pasión</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">1</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Desarrollador</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-indigo-600 mb-1">∞</div>
                            <div className="text-sm text-gray-500 font-medium uppercase tracking-wide">Posibilidades</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. LA HISTORIA (Tu Storytelling) --- */}
            <section className="py-24 bg-white">
                <div className="container px-4 mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16">
                        <div className="md:w-1/2 relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl transform -rotate-3 opacity-20"></div>
                            {/* Puedes poner una foto de un setup de código o tuya programando */}
                            <img
                                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Coding Setup"
                                className="relative rounded-2xl shadow-xl w-full object-cover h-[400px]"
                            />
                        </div>
                        <div className="md:w-1/2 space-y-6">
                            <h2 className="text-3xl font-bold text-gray-900">¿Por qué estoy construyendo esto?</h2>
                            <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                                <p>
                                    Hola, soy <span className="font-bold text-indigo-600">Ernesto</span>. Soy estudiante de ingeniería y, como muchos, intentaba gestionar mis redes sociales mientras lidiaba con exámenes y proyectos.
                                </p>
                                <p>
                                    Empecé a programar esta herramienta como un <strong>script personal</strong> para automatizar mis propios posts. Solo quería ahorrarme un par de horas a la semana.
                                </p>
                                <p>
                                    Pero al ver lo potente que era integrar la API de Claude y GPT para generar contenido, me di cuenta de que esto podía servirle a mucha más gente. Decidí pulir el código, diseñar esta interfaz y lanzarlo al mundo.
                                </p>
                                <div className="p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-lg italic text-indigo-800">
                                    "Aún está en desarrollo, pero cada línea de código está escrita pensando en hacerte la vida más fácil."
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. POR QUÉ PROBARLO AHORA (Incentivo) --- */}
            <section className="py-20 bg-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-10">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-[128px]"></div>
                </div>

                <div className="container px-4 mx-auto relative z-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Sé un pionero</h2>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
                        Al usar MCP en esta etapa temprana, tu feedback define el futuro de la plataforma.
                        Ayúdame a construir la herramienta que tú quieres usar.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <Zap className="text-yellow-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Acceso Prioritario</h3>
                            <p className="text-gray-400 text-sm">Prueba las nuevas funciones de IA antes que nadie.</p>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <Heart className="text-red-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Feedback Directo</h3>
                            <p className="text-gray-400 text-sm">Habla directamente conmigo. Si necesitas algo, lo programo.</p>
                        </div>
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                            <Code2 className="text-blue-400 mb-4" />
                            <h3 className="font-bold text-lg mb-2">Precios Especiales</h3>
                            <p className="text-gray-400 text-sm">Los primeros usuarios ("Early Adopters") tendrán beneficios de por vida.</p>
                        </div>
                    </div>

                    <div className="mt-12">
                        <Link
                            to="/register"
                            className="inline-flex h-12 items-center justify-center rounded-full bg-white px-8 text-sm font-bold text-slate-900 shadow hover:bg-gray-100 hover:scale-105 transition-all"
                        >
                            Probar la Beta Gratis
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- 5. SECCIÓN DE CONTACTO (Nuevo Formulario) --- */}
            <section className="py-24 bg-slate-50">
                <div className="container px-4 mx-auto">
                    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">
                        <div className="grid md:grid-cols-2">

                            {/* Columna Izquierda: Información */}
                            <div className="p-10 bg-indigo-600 text-white flex flex-col justify-between">
                                <div>
                                    <h2 className="text-3xl font-bold mb-4">Hablemos</h2>
                                    <p className="text-indigo-100 mb-8">
                                        ¿Tienes una idea para mejorar la app? ¿Encontraste un error? ¿O simplemente quieres saludar? Me encantaría leerte.
                                    </p>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Mail size={20} />
                                            </div>
                                            <span>contacto@mcp-social.com</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                                                <Code2 size={20} />
                                            </div>
                                            <span>Desarrollado en México 🇲🇽</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <p className="text-sm text-indigo-200">
                                        *Al ser un proyecto personal, puedo tardar un poco en responder, ¡pero leo todo!
                                    </p>
                                </div>
                            </div>

                            {/* Columna Derecha: Formulario */}
                            <div className="p-10">
                                <form onSubmit={handleContactSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                                        <input
                                            type="text"
                                            placeholder="Tu nombre"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Correo Electrónico</label>
                                        <input
                                            type="email"
                                            placeholder="tu@email.com"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                                        <textarea
                                            rows="4"
                                            placeholder="Me gustaría que la IA pudiera hacer..."
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-gray-50 resize-none"
                                            required
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gray-900 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        Enviar Mensaje
                                        <Send size={18} />
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;