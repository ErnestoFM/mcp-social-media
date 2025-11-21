import { useState, useEffect } from 'react';
import { Instagram, Facebook, CheckCircle, XCircle, AlertCircle, RefreshCw, Plus, Trash2, ExternalLink, HelpCircle } from 'lucide-react';
import AccountCard from '../components/AccountCard';

export default function Cuentas() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);

    // Estados del formulario
    const [formData, setFormData] = useState({
        platform: 'instagram',
        apiKey: '',
        userId: '',
        handle: ''
    });
    const [formError, setFormError] = useState('');

    // Estados de verificación
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const [showPermissions, setShowPermissions] = useState(false);

    // Cargar cuentas al montar el componente
    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            setError(null);

            // TODO: Reemplazar con tu endpoint real
            // const response = await fetch('/api/accounts', {
            //   headers: {
            //     'Authorization': `Bearer ${localStorage.getItem('token')}`
            //   }
            // });

            // Datos de ejemplo mientras implementas el backend
            const mockAccounts = [
                {
                    id: '1',
                    platform: 'instagram',
                    handle: '@mi_cuenta_ig',
                    pageId: '123456789',
                    accessToken: 'EAABwz...', // Truncado por seguridad
                    tokenExpiry: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 días
                    isValid: true,
                    scopes: ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement'],
                    lastVerified: new Date().toISOString(),
                    stats: {
                        followers: 12500,
                        posts: 342,
                        engagement: 4.2
                    }
                },
                {
                    id: '2',
                    platform: 'facebook',
                    handle: 'Mi Página de Facebook',
                    pageId: '987654321',
                    accessToken: 'EAABwz...',
                    tokenExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
                    isValid: true,
                    scopes: ['pages_manage_posts', 'pages_read_engagement'],
                    lastVerified: new Date().toISOString(),
                    stats: {
                        followers: 8900,
                        posts: 156,
                        engagement: 3.8
                    }
                }
            ];

            setAccounts(mockAccounts);
        } catch (err) {
            setError('Error al cargar las cuentas. Por favor, intenta de nuevo.');
            console.error('Error fetching accounts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAccount = async (accountId) => {
        try {
            // TODO: Implementar verificación de token
            console.log('Verificando cuenta:', accountId);

            // Actualizar el estado de la cuenta
            setAccounts(accounts.map(acc =>
                acc.id === accountId
                    ? { ...acc, lastVerified: new Date().toISOString() }
                    : acc
            ));
        } catch (err) {
            console.error('Error verificando cuenta:', err);
        }
    };

    const handleDeleteAccount = async (accountId) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta cuenta?')) {
            return;
        }

        try {
            // TODO: Implementar eliminación en el backend
            console.log('Eliminando cuenta:', accountId);

            setAccounts(accounts.filter(acc => acc.id !== accountId));
        } catch (err) {
            console.error('Error eliminando cuenta:', err);
        }
    };

    const handleAddAccount = async (e) => {
        e.preventDefault();
        setFormError('');

        // Validaciones
        if (!formData.apiKey.trim()) {
            setFormError('El API Key es requerido');
            return;
        }
        if (!formData.userId.trim()) {
            setFormError('El User ID es requerido');
            return;
        }

        try {
            // TODO: Implementar llamada al backend
            const token = localStorage.getItem('token');

            const response = await fetch('/api/auth/link-meta', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    platform: formData.platform,
                    accessToken: formData.apiKey,
                    pageId: formData.userId,
                    handle: formData.handle || `@${formData.platform}_user`
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar cuenta');
            }

            const data = await response.json();
            console.log('Cuenta agregada:', data);

            // Recargar cuentas
            await fetchAccounts();

            // Cerrar modal y limpiar formulario
            setShowAddModal(false);
            setFormData({
                platform: 'instagram',
                apiKey: '',
                userId: '',
                handle: ''
            });
        } catch (err) {
            console.error('Error agregando cuenta:', err);
            setFormError(err.message || 'Error al agregar la cuenta. Verifica tus credenciales.');
        }
    };

    const handleVerifyToken = async () => {
        setFormError('');
        setIsVerifying(true);
        setVerificationResult(null);
        setShowPermissions(false);

        // Validaciones básicas
        if (!formData.apiKey.trim()) {
            setFormError('El API Key es requerido para verificar');
            setIsVerifying(false);
            return;
        }

        try {
            // Llamar al endpoint de verificación (usando debugAndVerifyMetaToken)
            const response = await fetch('/api/auth/verify-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accessToken: formData.apiKey,
                    platform: formData.platform
                })
            });

            // Intentar parsear la respuesta
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Si no es JSON, leer como texto para debugging
                const text = await response.text();
                console.error('Respuesta no-JSON del servidor:', text);
                throw new Error('El servidor no devolvió una respuesta JSON válida');
            }

            if (!response.ok) {
                throw new Error(data.error || data.details || 'Error al verificar el token');
            }

            setVerificationResult(data);
            setShowPermissions(true);
        } catch (err) {
            console.error('Error verificando token:', err);

            // Mensajes de error más específicos
            if (err.name === 'TypeError' && err.message.includes('fetch')) {
                setFormError('No se pudo conectar con el servidor. Verifica que esté corriendo.');
            } else if (err.message.includes('JSON')) {
                setFormError('Error de comunicación con el servidor. Por favor, intenta de nuevo.');
            } else {
                setFormError(err.message || 'No se pudo verificar el token. Verifica que sea válido.');
            }
        } finally {
            setIsVerifying(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormError(''); // Limpiar error al escribir

        // Si cambia el API Key o la plataforma, limpiar verificación
        if (name === 'apiKey' || name === 'platform') {
            setVerificationResult(null);
            setShowPermissions(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                    <p className="text-gray-600">Cargando cuentas...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cuentas Vinculadas</h1>
                    <p className="text-gray-600 mt-1">Gestiona tus cuentas de redes sociales y verifica sus permisos</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={20} />
                    Agregar Cuenta
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="text-red-500" size={20} />
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Total Cuentas</p>
                            <p className="text-3xl font-bold mt-1">{accounts.length}</p>
                        </div>
                        <Instagram size={40} className="opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Cuentas Activas</p>
                            <p className="text-3xl font-bold mt-1">
                                {accounts.filter(acc => acc.isValid).length}
                            </p>
                        </div>
                        <CheckCircle size={40} className="opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Total Seguidores</p>
                            <p className="text-3xl font-bold mt-1">
                                {accounts.reduce((sum, acc) => sum + (acc.stats?.followers || 0), 0).toLocaleString()}
                            </p>
                        </div>
                        <Facebook size={40} className="opacity-50" />
                    </div>
                </div>
            </div>

            {/* Accounts Grid */}
            {accounts.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                    <Instagram size={64} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay cuentas vinculadas</h3>
                    <p className="text-gray-500 mb-6">Comienza agregando tu primera cuenta de Instagram o Facebook</p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
                    >
                        Agregar Primera Cuenta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {accounts.map((account) => (
                        <AccountCard
                            key={account.id}
                            account={account}
                            onVerify={handleVerifyAccount}
                            onDelete={handleDeleteAccount}
                        />
                    ))}
                </div>
            )}

            {/* Add Account Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Agregar Nueva Cuenta</h2>
                            <button
                                onClick={() => {
                                    setShowAddModal(false);
                                    setFormError('');
                                }}
                                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAddAccount} className="space-y-4">
                            {/* Platform Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plataforma *
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, platform: 'instagram' }))}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.platform === 'instagram'
                                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Instagram size={20} />
                                        <span className="font-medium">Instagram</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, platform: 'facebook' }))}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-lg border-2 transition-all ${formData.platform === 'facebook'
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        <Facebook size={20} />
                                        <span className="font-medium">Facebook</span>
                                    </button>
                                </div>
                            </div>

                            {/* API Key */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.platform === 'instagram' ? 'Instagram API Key' : 'Facebook API Key'} *
                                </label>
                                <input
                                    type="text"
                                    name="apiKey"
                                    value={formData.apiKey}
                                    onChange={handleInputChange}
                                    placeholder="Ej: EAABwzLixnjYBO..."
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">
                                        También conocido como Access Token
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleVerifyToken}
                                        disabled={!formData.apiKey.trim() || isVerifying}
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                                    >
                                        {isVerifying ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                Verificando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={14} />
                                                Verificar Permisos
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Permissions Display */}
                            {showPermissions && verificationResult && (
                                <div className={`border-2 rounded-lg p-4 ${verificationResult.is_valid
                                    ? 'border-green-200 bg-green-50'
                                    : 'border-red-200 bg-red-50'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-3">
                                        {verificationResult.is_valid ? (
                                            <>
                                                <CheckCircle className="text-green-600" size={20} />
                                                <span className="font-semibold text-green-800">Token Válido</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="text-red-600" size={20} />
                                                <span className="font-semibold text-red-800">Token Inválido</span>
                                            </>
                                        )}
                                    </div>

                                    {verificationResult.is_valid && (
                                        <>
                                            {/* Expiration Info */}
                                            {verificationResult.expires_at && (
                                                <div className="mb-3 text-sm">
                                                    <span className="text-gray-700">Expira: </span>
                                                    <span className="font-medium text-gray-900">
                                                        {new Date(verificationResult.expires_at * 1000).toLocaleDateString('es-ES', {
                                                            day: '2-digit',
                                                            month: 'long',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Scopes/Permissions */}
                                            <div>
                                                <p className="text-sm font-medium text-gray-700 mb-2">
                                                    Permisos detectados ({verificationResult.scopes?.length || 0}):
                                                </p>
                                                <div className="space-y-1 max-h-32 overflow-y-auto">
                                                    {verificationResult.scopes && verificationResult.scopes.length > 0 ? (
                                                        verificationResult.scopes.map((scope, index) => (
                                                            <div
                                                                key={index}
                                                                className="flex items-center gap-2 text-xs bg-white px-2 py-1 rounded"
                                                            >
                                                                <CheckCircle size={12} className="text-green-500" />
                                                                <span className="font-mono text-gray-700">{scope}</span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-gray-500 italic">No se detectaron permisos específicos</p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Required Scopes Check */}
                                            {verificationResult.scopes && (
                                                <div className="mt-3 pt-3 border-t border-green-200">
                                                    {(() => {
                                                        const requiredScopes = formData.platform === 'instagram'
                                                            ? ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
                                                            : ['pages_manage_posts', 'pages_read_engagement'];
                                                        const missingScopes = requiredScopes.filter(s => !verificationResult.scopes.includes(s));

                                                        if (missingScopes.length === 0) {
                                                            return (
                                                                <div className="flex items-center gap-2 text-sm text-green-700">
                                                                    <CheckCircle size={16} />
                                                                    <span className="font-medium">Todos los permisos requeridos están presentes</span>
                                                                </div>
                                                            );
                                                        } else {
                                                            return (
                                                                <div className="text-sm">
                                                                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                                                                        <AlertCircle size={16} />
                                                                        <span className="font-medium">Permisos faltantes:</span>
                                                                    </div>
                                                                    <ul className="list-disc list-inside text-xs text-yellow-600 space-y-1">
                                                                        {missingScopes.map((scope, idx) => (
                                                                            <li key={idx} className="font-mono">{scope}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            );
                                                        }
                                                    })()}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            )}

                            {/* User ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {formData.platform === 'instagram' ? 'Instagram User ID' : 'Facebook Page ID'} *
                                </label>
                                <input
                                    type="text"
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    placeholder={formData.platform === 'instagram' ? 'Ej: 17841405793187218' : 'Ej: 123456789012345'}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {formData.platform === 'instagram'
                                        ? 'ID numérico de tu cuenta de Instagram Business'
                                        : 'ID numérico de tu página de Facebook'}
                                </p>
                            </div>

                            {/* Handle (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de usuario (Opcional)
                                </label>
                                <input
                                    type="text"
                                    name="handle"
                                    value={formData.handle}
                                    onChange={handleInputChange}
                                    placeholder={formData.platform === 'instagram' ? '@mi_cuenta' : 'Mi Página'}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Error Message */}
                            {formError && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                                    <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
                                    <p className="text-sm text-red-700">{formError}</p>
                                </div>
                            )}

                            {/* Help Link */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <HelpCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                            ¿No sabes cómo obtenerlo?
                                        </p>
                                        <a
                                            href="https://developers.facebook.com/docs/instagram-basic-display-api/getting-started"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                                        >
                                            Ver guía de Facebook Developers
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormError('');
                                    }}
                                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                                >
                                    Agregar Cuenta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
