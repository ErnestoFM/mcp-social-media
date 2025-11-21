import React from 'react';

const SocialLoginButtons = () => {
    const handleSocialLogin = (provider) => {
        console.log(`Login with ${provider}`);
        // Aquí iría la lógica de autenticación con el proveedor
    };

    return (
        <div className="flex flex-col gap-3 mt-6">
            <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-700 w-full absolute"></div>
                <span className="bg-slate-900 px-3 text-slate-500 text-xs uppercase tracking-wider relative z-10">
                    O continúa con
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => handleSocialLogin('google')}
                    className="flex items-center justify-center gap-2 bg-white text-slate-700 hover:bg-slate-50 font-medium py-2.5 px-4 rounded-xl border border-slate-200 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Google
                </button>

                <button
                    onClick={() => handleSocialLogin('facebook')}
                    className="flex items-center justify-center gap-2 bg-[#1877F2] hover:bg-[#166fe5] text-white font-medium py-2.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.148 0-2.971.956-2.971 3.594v.957h5.556l-.72 3.667h-4.836v7.98h-4.844z" />
                    </svg>
                    Facebook
                </button>
            </div>
        </div>
    );
};

export default SocialLoginButtons;
