import React from 'react';
import { CheckCircle, X, HelpCircle, Zap, Star, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-slate-900 text-white py-20 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute top-10 right-10 w-96 h-96 bg-indigo-500 rounded-full blur-[128px]"></div>
                    <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500 rounded-full blur-[128px]"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6">Planes que escalan contigo</h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Desde creadores individuales hasta grandes agencias. Elige el plan perfecto para tu crecimiento.
                    </p>
                </div>
            </section>

            {/* Pricing Cards */}
            <section className="py-20 -mt-20 relative z-20">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {/* Starter */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col hover:shadow-2xl transition-all duration-300">
                            <div className="mb-4"><span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Starter</span></div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Gratis</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$0<span className="text-lg text-gray-500 font-normal">/mes</span></div>
                            <p className="text-gray-500 mb-8 text-sm">Perfecto para probar la plataforma y gestionar tu marca personal.</p>
                            <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-colors mb-8">
                                Comenzar Gratis
                            </button>
                            <ul className="space-y-4 flex-1 text-gray-600 text-sm">
                                <li className="flex gap-3"><CheckCircle size={18} className="text-green-500 flex-shrink-0" /> 1 Usuario</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-green-500 flex-shrink-0" /> 3 Cuentas Sociales</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-green-500 flex-shrink-0" /> 5 Posts con IA al mes</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-green-500 flex-shrink-0" /> Programación Básica</li>
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className="bg-gray-900 text-white rounded-3xl shadow-2xl p-8 flex flex-col transform md:-translate-y-4 relative border border-indigo-500">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2">
                                <Star size={14} fill="currentColor" /> MÁS POPULAR
                            </div>
                            <h3 className="text-3xl font-bold mb-2 mt-4">Creador Pro</h3>
                            <div className="text-4xl font-bold mb-6">$29<span className="text-lg text-gray-400 font-normal">/mes</span></div>
                            <p className="text-gray-400 mb-8 text-sm">Para influencers y pequeñas empresas que van en serio.</p>
                            <button className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/50 mb-8">
                                Prueba 14 días Gratis
                            </button>
                            <ul className="space-y-4 flex-1 text-gray-300 text-sm">
                                <li className="flex gap-3"><CheckCircle size={18} className="text-indigo-400 flex-shrink-0" /> 5 Usuarios</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-indigo-400 flex-shrink-0" /> 10 Cuentas Sociales</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-indigo-400 flex-shrink-0" /> IA Ilimitada (GPT-4)</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-indigo-400 flex-shrink-0" /> Analíticas Avanzadas</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-indigo-400 flex-shrink-0" /> Soporte Prioritario</li>
                            </ul>
                        </div>

                        {/* Business */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col hover:shadow-2xl transition-all duration-300">
                            <div className="mb-4"><span className="bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Agencia</span></div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-2">Business</h3>
                            <div className="text-4xl font-bold text-gray-900 mb-6">$99<span className="text-lg text-gray-500 font-normal">/mes</span></div>
                            <p className="text-gray-500 mb-8 text-sm">Potencia máxima para agencias y equipos grandes.</p>
                            <button className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-bold hover:border-indigo-600 hover:text-indigo-600 transition-colors mb-8">
                                Contactar Ventas
                            </button>
                            <ul className="space-y-4 flex-1 text-gray-600 text-sm">
                                <li className="flex gap-3"><CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> Usuarios Ilimitados</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> Cuentas Ilimitadas</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> <strong>Claude 3.5 Sonnet</strong> API</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> Marca Blanca (Whitelabel)</li>
                                <li className="flex gap-3"><CheckCircle size={18} className="text-purple-500 flex-shrink-0" /> API Access</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Table */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Comparativa Detallada</h2>
                        <p className="text-gray-600">Analiza cada característica punto por punto.</p>
                    </div>

                    <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="p-6 text-sm font-bold text-gray-500 uppercase tracking-wider w-1/3">Características</th>
                                        <th className="p-6 text-center text-gray-900 font-bold w-1/5">Gratis</th>
                                        <th className="p-6 text-center text-indigo-600 font-bold w-1/5 bg-indigo-50/50">Pro</th>
                                        <th className="p-6 text-center text-gray-900 font-bold w-1/5">Business</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {/* Usage Limits */}
                                    <tr className="bg-gray-50/50"><td colSpan="4" className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Límites de Uso</td></tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Usuarios</td>
                                        <td className="p-6 text-center text-gray-600">1</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">5</td>
                                        <td className="p-6 text-center text-gray-900 font-bold">Ilimitados</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Cuentas Sociales</td>
                                        <td className="p-6 text-center text-gray-600">3</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">10</td>
                                        <td className="p-6 text-center text-gray-900 font-bold">Ilimitadas</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Posts Programados</td>
                                        <td className="p-6 text-center text-gray-600">10 / mes</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">Ilimitados</td>
                                        <td className="p-6 text-center text-gray-900 font-bold">Ilimitados</td>
                                    </tr>

                                    {/* AI Features */}
                                    <tr className="bg-gray-50/50"><td colSpan="4" className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Inteligencia Artificial</td></tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Generación de Texto</td>
                                        <td className="p-6 text-center text-gray-600">GPT-3.5 (Básico)</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">GPT-4 (Avanzado)</td>
                                        <td className="p-6 text-center text-purple-600 font-bold">Claude 3.5 Sonnet + GPT-4</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Generación de Imágenes</td>
                                        <td className="p-6 text-center text-gray-400"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500 bg-indigo-50/30"><CheckCircle size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500"><CheckCircle size={20} className="mx-auto" /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Tono de Voz Personalizado</td>
                                        <td className="p-6 text-center text-gray-400"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500 bg-indigo-50/30"><CheckCircle size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500"><CheckCircle size={20} className="mx-auto" /></td>
                                    </tr>

                                    {/* Advanced Features */}
                                    <tr className="bg-gray-50/50"><td colSpan="4" className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider pl-6">Funciones Avanzadas</td></tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Analíticas</td>
                                        <td className="p-6 text-center text-gray-600">Básicas (7 días)</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">Avanzadas (1 año)</td>
                                        <td className="p-6 text-center text-gray-900 font-bold">Premium (Histórico completo)</td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Marca Blanca (Tu Logo)</td>
                                        <td className="p-6 text-center text-gray-400"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-gray-400 bg-indigo-50/30"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500"><CheckCircle size={20} className="mx-auto" /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">API Access</td>
                                        <td className="p-6 text-center text-gray-400"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-gray-400 bg-indigo-50/30"><X size={20} className="mx-auto" /></td>
                                        <td className="p-6 text-center text-green-500"><CheckCircle size={20} className="mx-auto" /></td>
                                    </tr>
                                    <tr>
                                        <td className="p-6 text-gray-700 font-medium">Soporte</td>
                                        <td className="p-6 text-center text-gray-600">Comunidad</td>
                                        <td className="p-6 text-center text-gray-900 font-bold bg-indigo-50/30">Email Prioritario</td>
                                        <td className="p-6 text-center text-gray-900 font-bold">Gerente de Cuenta Dedicado</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* FAQ Mini Section */}
                    <div className="mt-20 grid md:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle size={20} className="text-indigo-500" /> ¿Puedo cancelar cuando quiera?</h4>
                            <p className="text-gray-600 text-sm">Sí, no hay contratos a largo plazo. Puedes cancelar tu suscripción en cualquier momento desde tu panel de configuración.</p>
                        </div>
                        <div className="bg-white p-8 rounded-2xl border border-gray-100">
                            <h4 className="font-bold text-lg mb-2 flex items-center gap-2"><HelpCircle size={20} className="text-indigo-500" /> ¿Qué pasa si excedo los límites?</h4>
                            <p className="text-gray-600 text-sm">Te notificaremos antes de que llegues al límite. Podrás actualizar tu plan o comprar paquetes de posts adicionales.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Pricing;
