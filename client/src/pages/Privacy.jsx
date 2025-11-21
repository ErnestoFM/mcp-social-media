import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Privacy = () => {
    return (
        <div className="min-h-screen bg-white py-20 md:py-32">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                        <Shield size={32} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Política de Privacidad</h1>
                    <p className="text-xl text-gray-600">
                        Tu privacidad es nuestra prioridad. Aquí te explicamos cómo protegemos tus datos.
                    </p>
                    <p className="text-sm text-gray-500 mt-4">Última actualización: 21 de Noviembre, 2025</p>
                </div>

                {/* Content */}
                <div className="prose prose-lg prose-indigo mx-auto text-gray-600">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Lock className="text-indigo-600" size={24} />
                            1. Introducción
                        </h2>
                        <p>
                            En MCP Social Media, nos tomamos muy en serio la privacidad de tus datos. Esta política describe cómo recopilamos, usamos y protegemos tu información personal cuando utilizas nuestra plataforma.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Eye className="text-indigo-600" size={24} />
                            2. Información que Recopilamos
                        </h2>
                        <p className="mb-4">Recopilamos la siguiente información para proporcionarte nuestros servicios:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li><strong>Información de la Cuenta:</strong> Nombre, correo electrónico y contraseña (encriptada).</li>
                            <li><strong>Datos de Redes Sociales:</strong> Tokens de acceso necesarios para publicar en tus cuentas (almacenados de forma segura).</li>
                            <li><strong>Contenido Generado:</strong> Los posts e imágenes que creas utilizando nuestra IA.</li>
                            <li><strong>Datos de Uso:</strong> Información anónima sobre cómo interactúas con la plataforma para mejorar nuestros servicios.</li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <FileText className="text-indigo-600" size={24} />
                            3. Uso de la Información
                        </h2>
                        <p className="mb-4">Utilizamos tu información exclusivamente para:</p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Proporcionar y mantener el servicio de gestión de redes sociales.</li>
                            <li>Generar contenido mediante IA según tus instrucciones.</li>
                            <li>Notificarte sobre cambios importantes en el servicio.</li>
                            <li>Mejorar la funcionalidad y seguridad de la plataforma.</li>
                        </ul>
                        <p className="mt-4 font-medium text-gray-900">
                            Nunca vendemos tus datos personales a terceros.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seguridad de los Datos</h2>
                        <p>
                            Implementamos medidas de seguridad robustas, incluyendo encriptación de datos en tránsito y en reposo, para proteger tu información contra accesos no autorizados, alteración o destrucción.
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Tus Derechos</h2>
                        <p>
                            Tienes derecho a acceder, corregir o eliminar tu información personal en cualquier momento. Puedes gestionar estos datos desde la configuración de tu cuenta o contactándonos directamente.
                        </p>
                    </section>

                    <section className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¿Tienes dudas?</h3>
                        <p className="mb-4">
                            Si tienes alguna pregunta sobre nuestra política de privacidad, no dudes en contactarnos.
                        </p>
                        <a href="mailto:privacy@mcp.com" className="text-indigo-600 font-medium hover:text-indigo-700 hover:underline">
                            privacy@mcp.com
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Privacy;
