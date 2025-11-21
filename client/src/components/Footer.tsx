import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
    Facebook, Twitter, Instagram, Github,
    Linkedin, Mail, Heart, Shield, FileText
} from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-slate-300 border-t border-slate-800">
            {/* --- Parte Superior: Enlaces y Newsletter --- */}
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">

                    {/* Columna 1: Marca y Misión */}
                    <div className="lg:col-span-2 space-y-4">
                        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
                            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">M</span>
                            </div>
                            MCP Social Media
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            La plataforma todo en uno para automatizar, crear y escalar tu presencia digital con el poder de la Inteligencia Artificial.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <SocialLink href="#" icon={<Twitter size={20} />} label="Twitter" />
                            <SocialLink href="#" icon={<Instagram size={20} />} label="Instagram" />
                            <SocialLink href="#" icon={<Linkedin size={20} />} label="LinkedIn" />
                            <SocialLink href="#" icon={<Github size={20} />} label="GitHub" />
                        </div>
                    </div>

                    {/* Columna 2: Producto */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Producto</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink to="/features">Funcionalidades</FooterLink>
                            <FooterLink to="/pricing">Precios</FooterLink>
                            <FooterLink to="/guide">
                                <span className="flex items-center gap-2">
                                    Guía de Uso <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">Nuevo</span>
                                </span>
                            </FooterLink>
                            <FooterLink to="/changelog">Novedades (Changelog)</FooterLink>
                            <FooterLink to="/api">API para Desarrolladores</FooterLink>
                        </ul>
                    </div>

                    {/* Columna 3: Compañía */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Compañía</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink to="/about">Sobre Nosotros</FooterLink>
                            <FooterLink to="/blog">Blog</FooterLink>
                            <FooterLink to="/careers">Trabaja con nosotros</FooterLink>
                            <FooterLink to="/contact">Contacto</FooterLink>
                            <a href="mailto:soporte@mcp.com" className="hover:text-white transition-colors flex items-center gap-2 mt-4">
                                <Mail size={14} /> soporte@mcp.com
                            </a>
                        </ul>
                    </div>

                    {/* Columna 4: Legal */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Legal</h3>
                        <ul className="space-y-3 text-sm">
                            <FooterLink to="/privacy">
                                <span className="flex items-center gap-2"><Shield size={14} /> Política de Privacidad</span>
                            </FooterLink>
                            <FooterLink to="/terms">
                                <span className="flex items-center gap-2"><FileText size={14} /> Términos de Servicio</span>
                            </FooterLink>
                            <FooterLink to="/cookies">Política de Cookies</FooterLink>
                            <FooterLink to="/security">Seguridad</FooterLink>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Section (Opcional) */}
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <h4 className="text-white font-semibold">Suscríbete a nuestro boletín</h4>
                            <p className="text-xs text-slate-500 mt-1">Recibe tips de marketing y actualizaciones de la IA.</p>
                        </div>
                        <div className="flex w-full md:w-auto gap-2">
                            <input
                                type="email"
                                placeholder="tu@correo.com"
                                className="bg-slate-900 border border-slate-700 text-white text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 w-full md:w-64"
                            />
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                                Suscribirse
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Parte Inferior: Copyright --- */}
            <div className="bg-slate-950 border-t border-slate-800 py-6">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                    <p>© {currentYear} MCP Social Media. Todos los derechos reservados.</p>

                    <div className="flex items-center gap-6">
                        <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacidad</Link>
                        <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookies</Link>
                        <span className="flex items-center gap-1">
                            Hecho con <Heart size={12} className="text-red-500 fill-red-500" /> por Ernesto
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Pequeños componentes auxiliares para no repetir clases
interface SocialLinkProps {
    href: string;
    icon: ReactNode;
    label: string;
}

const SocialLink = ({ href, icon, label }: SocialLinkProps) => (
    <a
        href={href}
        aria-label={label}
        className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all duration-300"
    >
        {icon}
    </a>
);

interface FooterLinkProps {
    to: string;
    children: ReactNode;
}

const FooterLink = ({ to, children }: FooterLinkProps) => (
    <li>
        <Link
            to={to}
            className="text-slate-400 hover:text-white transition-colors hover:translate-x-1 inline-block duration-200"
        >
            {children}
        </Link>
    </li>
);

export default Footer;
