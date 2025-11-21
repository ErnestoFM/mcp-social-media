import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    BookOpen, Zap, Layout, Share2, BarChart3,
    ArrowRight, Play, Youtube, HelpCircle, Mail, MessageCircle,
    Key, PenTool, Bot, Code, Terminal, Menu, ChevronRight,
    CheckCircle, AlertTriangle, Info, Calendar
} from 'lucide-react';

const GuidePage = () => {
    const [activeSection, setActiveSection] = useState('inicio');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // --- SCROLL SPY LOGIC ---
    useEffect(() => {
        const handleScroll = () => {
            const sections = document.querySelectorAll('section[id]');
            const scrollPosition = window.scrollY + 150;

            sections.forEach(section => {
                const top = section.offsetTop;
                const height = section.offsetHeight;
                const id = section.getAttribute('id');

                if (scrollPosition >= top && scrollPosition < top + height) {
                    setActiveSection(id);
                }
            });
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id) => {
        const element = document.getElementById(id);
        if (element) {
            const y = element.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
            setActiveSection(id);
            setIsMobileMenuOpen(false);
        }
    };

    const navItems = [
        { id: 'inicio', label: 'Inicio Rápido', icon: Zap },
        { id: 'video', label: 'Video Tutorial', icon: Youtube },
        { id: 'credenciales', label: 'Configuración', icon: Key },
        { id: 'herramientas', label: 'Herramientas', icon: PenTool },
        { id: 'ia', label: 'Uso con IA', icon: Bot },
        { id: 'manual', label: 'Manual / JSON', icon: Code },
        { id: 'ejemplos', label: 'Casos de Uso', icon: Layout },
        { id: 'dudas', label: '¿Dudas?', icon: HelpCircle },
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">

            {/* --- HEADER --- */}
            <header className="bg-white border-b border-slate-200 py-16 mb-8">
                <div className="container mx-auto px-4 text-center max-w-4xl">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-6 shadow-xl shadow-indigo-200 rotate-3 transition-transform hover:rotate-0">
                        <BookOpen size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Centro de <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Aprendizaje</span>
                    </h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Domina MCP Social Media. Desde la automatización visual hasta el control técnico avanzado.
                    </p>
                </div>
            </header>

            <div className="container mx-auto px-4 max-w-7xl flex flex-col lg:flex-row gap-12">

                {/* --- SIDEBAR STICKY --- */}
                <aside className="lg:w-72 flex-shrink-0">
                    <div className="sticky top-6 z-30">
                        {/* Mobile Toggle */}
                        <button
                            className="lg:hidden w-full bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center shadow-sm mb-4"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            <span className="font-bold text-slate-700">Índice de Contenidos</span>
                            <Menu className="text-slate-500" />
                        </button>

                        <nav className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-3 overflow-hidden`}>
                            <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Navegación</div>
                            <ul className="space-y-1">
                                {navItems.map((item) => (
                                    <li key={item.id}>
                                        <button
                                            onClick={() => scrollTo(item.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${activeSection === item.id
                                                    ? 'bg-indigo-600 text-white shadow-md transform translate-x-1'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-indigo-600'
                                                }`}
                                        >
                                            <item.icon size={18} />
                                            {item.label}
                                            {activeSection === item.id && <ChevronRight size={16} className="ml-auto" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-indigo-100 text-center">
                                <p className="text-xs text-indigo-800 font-semibold mb-2">¿Listo para probar?</p>
                                <Link to="/" className="block w-full py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors">
                                    Ir al Dashboard
                                </Link>
                            </div>
                        </nav>
                    </div>
                </aside>

                {/* --- CONTENIDO PRINCIPAL --- */}
                <main className="flex-1 space-y-16">

                    {/* SECCIÓN 1: INICIO RÁPIDO (DISEÑO VISUAL ALTERNADO) */}
                    <section id="inicio" className="scroll-mt-32 space-y-12">
                        <div className="mb-8 border-b border-slate-200 pb-4">
                            <h2 className="text-3xl font-bold text-slate-900">Cómo funciona</h2>
                            <p className="text-slate-500">Tu flujo de trabajo optimizado en 4 pasos.</p>
                        </div>

                        {/* Step 1: Conectar */}
                        <div className="flex flex-col xl:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full xl:w-1/2 space-y-4 order-2 xl:order-1">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg shadow-indigo-200">1</div>
                                <h3 className="text-2xl font-bold text-slate-900">Conecta tus Cuentas</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    El primer paso es vincular tus perfiles sociales. Ve a la sección de "Cuentas" y añade tus perfiles de Instagram y Facebook de forma segura vía API.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-500">
                                    <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Token encriptado</li>
                                    <li className="flex items-center gap-2"><Zap size={16} className="text-yellow-500" /> Soporte multi-cuenta</li>
                                </ul>
                            </div>
                            <div className="w-full xl:w-1/2 order-1 xl:order-2">
                                <MockupWindow color="bg-indigo-100">
                                    <div className="flex items-center justify-center h-full text-indigo-400 font-medium flex-col">
                                        <div className="w-16 h-16 bg-white rounded-2xl mb-2 shadow-sm flex items-center justify-center text-2xl">🔗</div>
                                        <span>Panel de Conexión</span>
                                    </div>
                                </MockupWindow>
                            </div>
                        </div>

                        {/* Step 2: IA */}
                        <div className="flex flex-col xl:flex-row-reverse items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full xl:w-1/2 space-y-4 order-2 xl:order-1">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-purple-600 text-white font-bold text-lg shadow-lg shadow-purple-200">2</div>
                                <h3 className="text-2xl font-bold text-slate-900">Crea con IA</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Usa nuestro asistente inteligente para generar posts virales. Solo describe tu idea y deja que la IA redacte el copy perfecto y sugiera imágenes.
                                </p>
                                <ul className="space-y-2 text-sm text-slate-500">
                                    <li className="flex items-center gap-2"><Layout size={16} className="text-purple-500" /> Generación de copy</li>
                                    <li className="flex items-center gap-2"><Layout size={16} className="text-purple-500" /> Análisis de hashtags</li>
                                </ul>
                            </div>
                            <div className="w-full xl:w-1/2 order-1 xl:order-2">
                                <MockupWindow color="bg-purple-100">
                                    <div className="p-6 space-y-3">
                                        <div className="w-3/4 h-3 bg-white rounded-full opacity-60"></div>
                                        <div className="w-1/2 h-3 bg-white rounded-full opacity-60"></div>
                                        <div className="w-full h-24 bg-white rounded-xl shadow-sm flex items-center justify-center text-xs text-purple-300">Generando...</div>
                                    </div>
                                </MockupWindow>
                            </div>
                        </div>

                        {/* Step 3: Programar */}
                        <div className="flex flex-col xl:flex-row items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full xl:w-1/2 space-y-4 order-2 xl:order-1">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-pink-600 text-white font-bold text-lg shadow-lg shadow-pink-200">3</div>
                                <h3 className="text-2xl font-bold text-slate-900">Programa y Publica</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Organiza tu calendario de contenidos. Programa tus publicaciones para las mejores horas y mantén tu presencia activa 24/7.
                                </p>
                            </div>
                            <div className="w-full xl:w-1/2 order-1 xl:order-2">
                                <MockupWindow color="bg-pink-100">
                                    <div className="grid grid-cols-7 gap-1 h-full p-2">
                                        {[...Array(7)].map((_, i) => (
                                            <div key={i} className="bg-white/50 rounded-md h-full relative">
                                                {i === 3 && <div className="absolute top-2 left-1 right-1 h-8 bg-white rounded shadow-sm"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </MockupWindow>
                            </div>
                        </div>

                        {/* Step 4: Analizar */}
                        <div className="flex flex-col xl:flex-row-reverse items-center gap-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-full xl:w-1/2 space-y-4 order-2 xl:order-1">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white font-bold text-lg shadow-lg shadow-green-200">4</div>
                                <h3 className="text-2xl font-bold text-slate-900">Analiza y Mejora</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Revisa las métricas de rendimiento en tiempo real. Entiende qué contenido funciona mejor y ajusta tu estrategia con datos.
                                </p>
                            </div>
                            <div className="w-full xl:w-1/2 order-1 xl:order-2">
                                <MockupWindow color="bg-green-100">
                                    <div className="flex items-end justify-center gap-2 h-full pb-4 px-8">
                                        <div className="w-8 h-12 bg-white/50 rounded-t"></div>
                                        <div className="w-8 h-20 bg-white/50 rounded-t"></div>
                                        <div className="w-8 h-32 bg-white rounded-t shadow-sm"></div>
                                        <div className="w-8 h-16 bg-white/50 rounded-t"></div>
                                    </div>
                                </MockupWindow>
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 2: VIDEO TUTORIAL */}
                    <Section id="video" title="Video Tutorial">
                        <p className="text-slate-600 mb-6">Mira cómo configurar tu cuenta desde cero en menos de 5 minutos.</p>

                        <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border-4 border-slate-800">
                            {/* Placeholder del video */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Play className="ml-1 text-indigo-600 fill-indigo-600" size={32} />
                                    </div>
                                </div>
                            </div>
                            {/* Texto overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 to-transparent text-white">
                                <h3 className="font-bold text-xl mb-1">Getting Started with MCP</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs font-bold">HD</span>
                                    <span>Duración: 4:32 min</span>
                                </div>
                            </div>
                        </div>
                    </Section>

                    {/* SECCIÓN 3: CREDENCIALES (DETALLADO) */}
                    <Section id="credenciales" title="Configuración Técnica (Detallada)">
                        <Alert type="warning" title="Requerido para Desarrolladores">
                            Estos pasos son necesarios si estás desplegando tu propia instancia del servidor MCP.
                        </Alert>

                        <div className="space-y-6 mt-6">
                            <Step
                                number="1"
                                title="Instagram Business API"
                                desc={
                                    <>
                                        Ve a <code className="bg-slate-100 px-1 rounded">developers.facebook.com</code>, crea una app tipo "Business" y agrega el producto <strong>Instagram Graph API</strong>. Necesitas los permisos:
                                        <span className="block mt-2 font-mono text-xs bg-slate-800 text-green-400 p-2 rounded">instagram_basic, instagram_content_publish, instagram_manage_comments</span>
                                    </>
                                }
                            />
                            <Step
                                number="2"
                                title="Facebook Page API"
                                desc="Para publicar en Facebook, obtén el Page Access Token con permisos: pages_show_list, pages_read_engagement, pages_manage_posts."
                            />
                            <Step
                                number="3"
                                title="AWS S3 (Almacenamiento)"
                                desc="Crea un bucket público en S3. Las imágenes deben subirse aquí primero para generar una URL pública que la API de Instagram pueda leer."
                            />
                        </div>
                    </Section>

                    {/* SECCIÓN 4: HERRAMIENTAS (CATÁLOGO COMPLETO) */}
                    <Section id="herramientas" title="Catálogo de Herramientas">
                        <p className="text-slate-600 mb-6">Lista completa de funciones disponibles en el sistema.</p>

                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8"><PenTool size={20} /> Publicación</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ToolCard name="upload_and_publish_photo" type="manual" desc="Sube y publica una foto." params={['image_path', 'caption']} />
                            <ToolCard name="upload_and_publish_reel" type="manual" desc="Publica un video como Reel." params={['video_path', 'caption']} />
                            <ToolCard name="upload_and_publish_carousel" type="manual" desc="Publica hasta 10 fotos." params={['image_paths', 'caption']} />
                            <ToolCard name="schedule_post" type="manual" desc="Programa un post futuro." params={['media_path', 'date', 'platforms']} />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8"><Bot size={20} /> Inteligencia Artificial</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ToolCard name="generate_creative_caption" type="ai" desc="Crea textos virales basados en descripción visual." />
                            <ToolCard name="ai_moderate_comment" type="ai" desc="Detecta spam y toxicidad en comentarios." />
                            <ToolCard name="ai_analyze_content_strategy" type="ai" desc="Analiza tu feed y da consejos estratégicos." />
                        </div>

                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 mt-8"><BarChart3 size={20} /> Analíticas</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <ToolCard name="get_profile_insights" type="manual" desc="Métricas de alcance y perfil." params={['period']} />
                            <ToolCard name="analyze_hashtag_performance" type="manual" desc="Analiza engagement de un hashtag." params={['hashtag']} />
                        </div>
                    </Section>

                    {/* SECCIÓN 5: IA (CHAT EXAMPLES) */}
                    <Section id="ia" title="Uso con IA (Lenguaje Natural)">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                            <h4 className="font-bold text-slate-800 mb-4">Ejemplos de Comandos</h4>
                            <div className="space-y-4">
                                <ChatExample
                                    role="user"
                                    text="Publica esta foto en Instagram con un caption sobre motivación y prográmalo para mañana a las 6pm."
                                />
                                <ChatExample
                                    role="ai"
                                    text="✅ Entendido. He generado el caption, subido la foto y programado el post para el 22 Nov a las 18:00."
                                />
                                <div className="border-t border-slate-200 my-4"></div>
                                <ChatExample
                                    role="user"
                                    text="Analiza si el hashtag #fitness funciona bien para mi cuenta."
                                />
                                <ChatExample
                                    role="ai"
                                    text="📊 Analizando... El hashtag #fitness tiene mucha competencia. Te sugiero usar #fitnessmotivation que tiene mejor ratio de engagement para tu perfil."
                                />
                            </div>
                        </div>
                    </Section>

                    {/* SECCIÓN 6: MANUAL / JSON */}
                    <Section id="manual" title="Para Desarrolladores (JSON)">
                        <p className="text-slate-600 mb-4">Si integras MCP en tu propio script, usa este formato:</p>

                        <CodeBlock title="Ejemplo: Publicar Reel" code={`{
  "tool": "upload_and_publish_reel",
  "parameters": {
    "video_path": "/assets/videos/promo_v1.mp4",
    "caption": "Nuevo lanzamiento 🔥 #promo",
    "share_to_feed": true
  }
}`} />
                        <CodeBlock title="Ejemplo: Moderación" code={`// 1. Obtener comentarios
const comments = await get_comments({ media_id: "123" });

// 2. Analizar con IA
const analysis = await ai_moderate_comment({ 
  comment_text: comments[0].text 
});

// 3. Acción
if (analysis.is_spam) {
  await delete_comment({ comment_id: comments[0].id });
}`} />
                    </Section>

                    {/* SECCIÓN 7: CASOS DE USO */}
                    <Section id="ejemplos" title="Casos de Uso Reales">
                        <div className="grid md:grid-cols-2 gap-6">
                            <UseCaseCard
                                title="Gym & Fitness"
                                icon={<div className="bg-orange-100 p-2 rounded-lg text-orange-600">💪</div>}
                                steps={[
                                    "Dame 5 ideas para rutinas de pierna",
                                    "Publica este video como Reel a las 6pm",
                                    "Analiza qué hashtag fitness funciona mejor"
                                ]}
                            />
                            <UseCaseCard
                                title="Tienda E-commerce"
                                icon={<div className="bg-blue-100 p-2 rounded-lg text-blue-600">🛍️</div>}
                                steps={[
                                    "Publica carrusel con estos 5 productos",
                                    "Responde dudas de precio en comentarios",
                                    "Envíame reporte de ventas semanal por email"
                                ]}
                            />
                        </div>
                    </Section>

                    {/* SECCIÓN 8: DUDAS (CTA) */}
                    <Section id="dudas" title="¿Todavía tienes dudas?">
                        <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
                            {/* Decoración */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full blur-3xl -ml-10 -mb-10"></div>

                            <div className="relative z-10">
                                <h3 className="text-3xl font-bold mb-4">Estamos aquí para ayudarte</h3>
                                <p className="text-indigo-100 mb-10 max-w-xl mx-auto text-lg">
                                    No te quedes atascado. Nuestro equipo de soporte y la comunidad de Discord responden rápido a cualquier problema técnico.
                                </p>

                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    <a href="mailto:soporte@mcp.com" className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors shadow-lg">
                                        <Mail className="mr-2" size={20} />
                                        Contactar Soporte
                                    </a>
                                    <a href="#" className="inline-flex items-center justify-center px-8 py-4 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors border border-indigo-500 shadow-lg">
                                        <MessageCircle className="mr-2" size={20} />
                                        Unirse a Discord
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Section>

                </main>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTES PARA MANTENER EL CÓDIGO LIMPIO ---

const Section = ({ id, title, children }) => (
    <section id={id} className="scroll-mt-32 bg-white rounded-3xl border border-slate-200/60 p-6 md:p-10 shadow-sm">
        <h2 className="text-3xl font-bold text-slate-900 mb-8 pb-4 border-b border-slate-100 flex items-center gap-3">
            {title}
        </h2>
        {children}
    </section>
);

const Step = ({ number, title, desc }) => (
    <div className="flex gap-4 mb-6 last:mb-0">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">
            {number}
        </div>
        <div>
            <h4 className="font-bold text-slate-900 text-lg mb-1">{title}</h4>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">{desc}</p>
        </div>
    </div>
);

const Alert = ({ type, title, children }) => {
    const styles = {
        warning: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-800", icon: <AlertTriangle size={20} className="text-amber-600" /> },
        success: { bg: "bg-emerald-50", border: "border-emerald-500", text: "text-emerald-800", icon: <CheckCircle size={20} className="text-emerald-600" /> },
        info: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-800", icon: <Info size={20} className="text-blue-600" /> },
    };
    const s = styles[type] || styles.info;

    return (
        <div className={`border-l-4 p-4 rounded-r-lg flex gap-3 my-4 ${s.bg} ${s.border} ${s.text}`}>
            <div className="mt-0.5">{s.icon}</div>
            <div>
                <h5 className="font-bold mb-1">{title}</h5>
                <div className="text-sm opacity-90">{children}</div>
            </div>
        </div>
    );
};

const ToolCard = ({ name, type, desc, params }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all group">
        <div className="flex justify-between items-start mb-2">
            <code className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-mono group-hover:bg-indigo-100 transition-colors break-all">
                {name}
            </code>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full flex-shrink-0 ml-2 ${type === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'}`}>
                {type === 'ai' ? 'IA' : 'Manual'}
            </span>
        </div>
        <p className="text-slate-600 text-sm mb-3">{desc}</p>
        {params && (
            <div className="text-xs text-slate-400 font-mono">
                Params: {params.join(', ')}
            </div>
        )}
    </div>
);

const CodeBlock = ({ title, code }) => (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
        {title && <div className="bg-slate-800 px-4 py-2 text-xs text-slate-400 font-mono border-b border-slate-700 flex items-center gap-2"><Terminal size={12} /> {title}</div>}
        <pre className="p-4 overflow-x-auto text-sm font-mono text-emerald-400 leading-relaxed">
            {code}
        </pre>
    </div>
);

const ChatExample = ({ role, text }) => (
    <div className={`flex ${role === 'user' ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] rounded-2xl p-4 text-sm ${role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none'
                : 'bg-white text-slate-700 rounded-bl-none border border-slate-200 shadow-sm'
            }`}>
            {text}
        </div>
    </div>
);

const UseCaseCard = ({ title, icon, steps }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 mb-4">
            {icon}
            <h3 className="font-bold text-slate-900">{title}</h3>
        </div>
        <ol className="space-y-3">
            {steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-slate-600">
                    <span className="text-indigo-400 font-bold">{i + 1}.</span>
                    {step}
                </li>
            ))}
        </ol>
    </div>
);

const MockupWindow = ({ children, color }) => (
    <div className={`aspect-video ${color} rounded-2xl p-2 shadow-lg border border-slate-200/50`}>
        <div className="h-full w-full bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 flex flex-col">
            <div className="h-8 border-b border-slate-200/50 flex items-center px-3 gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 overflow-hidden relative">
                {children}
            </div>
        </div>
    </div>
);

export default GuidePage;