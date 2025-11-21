import { Instagram, Facebook, CheckCircle, XCircle, AlertTriangle, RefreshCw, Trash2, ExternalLink } from 'lucide-react';

export default function AccountCard({ account, onVerify, onDelete }) {
    const {
        id,
        platform,
        handle,
        pageId,
        tokenExpiry,
        isValid,
        scopes,
        lastVerified,
        stats
    } = account;

    // Calcular días hasta expiración
    const daysUntilExpiry = Math.floor(
        (new Date(tokenExpiry) - new Date()) / (1000 * 60 * 60 * 24)
    );

    const isExpiringSoon = daysUntilExpiry < 7;
    const isExpired = daysUntilExpiry < 0;

    // Permisos requeridos según plataforma
    const requiredScopes = platform === 'instagram'
        ? ['instagram_basic', 'instagram_content_publish', 'pages_read_engagement']
        : ['pages_manage_posts', 'pages_read_engagement'];

    // Verificar si tiene todos los permisos necesarios
    const hasAllPermissions = requiredScopes.every(scope => scopes.includes(scope));
    const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Header */}
            <div className={`p-4 ${platform === 'instagram' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-blue-600'}`}>
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        {platform === 'instagram' ? (
                            <Instagram size={24} />
                        ) : (
                            <Facebook size={24} />
                        )}
                        <div>
                            <h3 className="font-semibold text-lg">{handle}</h3>
                            <p className="text-sm opacity-90">ID: {pageId}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => onVerify(id)}
                            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                            title="Verificar permisos"
                        >
                            <RefreshCw size={18} />
                        </button>
                        <button
                            onClick={() => onDelete(id)}
                            className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-colors"
                            title="Eliminar cuenta"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isValid && !isExpired ? (
                            <>
                                <CheckCircle className="text-green-500" size={20} />
                                <span className="text-sm font-medium text-green-700">Cuenta Activa</span>
                            </>
                        ) : isExpiringSoon ? (
                            <>
                                <AlertTriangle className="text-yellow-500" size={20} />
                                <span className="text-sm font-medium text-yellow-700">Expira Pronto</span>
                            </>
                        ) : (
                            <>
                                <XCircle className="text-red-500" size={20} />
                                <span className="text-sm font-medium text-red-700">Token Expirado</span>
                            </>
                        )}
                    </div>
                    <span className="text-xs text-gray-500">
                        {isExpired ? 'Expirado' : `${daysUntilExpiry} días restantes`}
                    </span>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-slate-800">{stats.followers.toLocaleString()}</p>
                            <p className="text-xs text-gray-600 mt-1">Seguidores</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-slate-800">{stats.posts}</p>
                            <p className="text-xs text-gray-600 mt-1">Publicaciones</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-slate-800">{stats.engagement}%</p>
                            <p className="text-xs text-gray-600 mt-1">Engagement</p>
                        </div>
                    </div>
                )}

                {/* Permissions */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-semibold text-gray-700">Permisos</h4>
                        {hasAllPermissions ? (
                            <span className="text-xs text-green-600 font-medium">✓ Completos</span>
                        ) : (
                            <span className="text-xs text-red-600 font-medium">⚠ Incompletos</span>
                        )}
                    </div>

                    <div className="space-y-1">
                        {requiredScopes.map((scope) => {
                            const hasScope = scopes.includes(scope);
                            return (
                                <div
                                    key={scope}
                                    className={`flex items-center gap-2 text-xs p-2 rounded ${hasScope ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                        }`}
                                >
                                    {hasScope ? (
                                        <CheckCircle size={14} className="text-green-500" />
                                    ) : (
                                        <XCircle size={14} className="text-red-500" />
                                    )}
                                    <span className="font-mono">{scope}</span>
                                </div>
                            );
                        })}
                    </div>

                    {missingScopes.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs text-yellow-800">
                                <strong>Permisos faltantes:</strong> Esta cuenta necesita reconectarse para obtener todos los permisos necesarios.
                            </p>
                        </div>
                    )}
                </div>

                {/* Last Verified */}
                <div className="pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                        Última verificación: {new Date(lastVerified).toLocaleString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>

                {/* Actions */}
                {(!isValid || !hasAllPermissions) && (
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                        <ExternalLink size={16} />
                        Reconectar Cuenta
                    </button>
                )}
            </div>
        </div>
    );
}
