import { useState, useEffect } from 'react';
import {
    Instagram, Facebook, Image as ImageIcon, Calendar,
    Send, Zap, Layers, Clock, X, Plus, Film, MapPin, Hash, MessageSquare, Users, ChevronDown, ChevronUp
} from 'lucide-react';

const RedesSociales = () => {
    // Estados principales
    const [postType, setPostType] = useState('post'); // post, carousel, reel
    const [isScheduled, setIsScheduled] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState({ instagram: true, facebook: false });
    const [selectedAccount, setSelectedAccount] = useState('');
    const [caption, setCaption] = useState('');
    const [mediaFiles, setMediaFiles] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);

    // Estados para opciones avanzadas
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [hashtags, setHashtags] = useState('');
    const [location, setLocation] = useState('');
    const [altText, setAltText] = useState('');
    const [firstComment, setFirstComment] = useState('');
    const [userTags, setUserTags] = useState('');

    // Mock de cuentas (simulando lo que vendría del backend)
    const [accounts, setAccounts] = useState([
        { id: '1', platform: 'instagram', handle: '@mi_marca_ig', name: 'Mi Marca IG' },
        { id: '2', platform: 'facebook', handle: 'Mi Página FB', name: 'Mi Página FB' },
        { id: '3', platform: 'instagram', handle: '@tienda_oficial', name: 'Tienda Oficial' }
    ]);

    // Filtrar cuentas según plataformas seleccionadas
    const filteredAccounts = accounts.filter(acc => selectedPlatforms[acc.platform]);

    const handlePlatformToggle = (platform) => {
        setSelectedPlatforms(prev => ({
            ...prev,
            [platform]: !prev[platform]
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // En un caso real, aquí subiríamos a S3 o crearíamos previews
        const newFiles = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            type: file.type.startsWith('video') ? 'video' : 'image'
        }));
        setMediaFiles(prev => [...prev, ...newFiles]);
    };

    const removeFile = (index) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleInspireMe = async () => {
        setIsGenerating(true);
        // Simulación de llamada a IA
        setTimeout(() => {
            setCaption(prev => prev + (prev ? '\n\n' : '') + "✨ ¡Descubre la nueva colección que transformará tu estilo! 🚀 #Moda #Tendencias #NuevoLanzamiento");
            setIsGenerating(false);
        }, 1500);
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Crear Publicación</h1>
                <p className="text-slate-500">Diseña, programa y publica contenido en tus redes.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Columna Izquierda: Editor */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Selección de Tipo de Post */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                        <label className="block text-sm font-medium text-slate-700 mb-3">Tipo de Publicación</label>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setPostType('post')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${postType === 'post' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <ImageIcon size={20} />
                                <span className="font-medium">Imagen</span>
                            </button>
                            <button
                                onClick={() => setPostType('carousel')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${postType === 'carousel' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Layers size={20} />
                                <span className="font-medium">Carrusel</span>
                            </button>
                            <button
                                onClick={() => setPostType('reel')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${postType === 'reel' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Film size={20} />
                                <span className="font-medium">Reel</span>
                            </button>
                            <button
                                onClick={() => setPostType('story')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${postType === 'reel' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                <Film size={20} />
                                <span className="font-medium">Story</span>
                            </button>
                        </div>
                    </div>

                    {/* 2. Dónde publicar */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Destinos</h3>

                        <div className="flex gap-4 mb-6">
                            <button
                                onClick={() => handlePlatformToggle('instagram')}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${selectedPlatforms.instagram ? 'bg-pink-50 border-pink-500 text-pink-700' : 'border-slate-200 text-slate-500 grayscale'}`}
                            >
                                <Instagram size={20} />
                                <span className="font-medium">Instagram</span>
                            </button>
                            <button
                                onClick={() => handlePlatformToggle('facebook')}
                                className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${selectedPlatforms.facebook ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-500 grayscale'}`}
                            >
                                <Facebook size={20} />
                                <span className="font-medium">Facebook</span>
                            </button>
                        </div>

                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">Seleccionar Cuenta</label>
                            <select
                                value={selectedAccount}
                                onChange={(e) => setSelectedAccount(e.target.value)}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                <option value="">-- Elige una cuenta --</option>
                                {filteredAccounts.map(acc => (
                                    <option key={acc.id} value={acc.id}>
                                        {acc.platform === 'instagram' ? '📸' : '📘'} {acc.name} ({acc.handle})
                                    </option>
                                ))}
                            </select>
                            {filteredAccounts.length === 0 && (
                                <p className="text-sm text-amber-600 flex items-center gap-2">
                                    <Zap size={14} /> Selecciona una plataforma para ver las cuentas disponibles.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 3. Contenido Multimedia */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Multimedia</h3>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {mediaFiles.map((file, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                    {file.type === 'video' ? (
                                        <video src={file.preview} className="w-full h-full object-cover" />
                                    ) : (
                                        <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                                    )}
                                    <button
                                        onClick={() => removeFile(index)}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-indigo-500 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center cursor-pointer text-slate-400 hover:text-indigo-600">
                                <Plus size={32} className="mb-2" />
                                <span className="text-xs font-bold uppercase">Agregar</span>
                                <input
                                    type="file"
                                    multiple={postType === 'carousel'}
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-400">
                            {postType === 'carousel' ? 'Sube hasta 10 imágenes o videos.' : 'Sube una imagen o video.'}
                        </p>
                    </div>

                    {/* 4. Caption con IA */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Descripción (Caption)</h3>

                        <div className="relative">
                            <textarea
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Escribe algo increíble..."
                                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                            ></textarea>

                            {/* Botón Inspírame dentro del input */}
                            <button
                                onClick={handleInspireMe}
                                disabled={isGenerating}
                                className="absolute bottom-3 right-3 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Zap size={16} className={isGenerating ? "animate-pulse" : ""} />
                                {isGenerating ? 'Pensando...' : 'Inspírame'}
                            </button>
                        </div>
                    </div>

                    {/* 5. Opciones Avanzadas */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            className="w-full flex items-center justify-between text-lg font-bold text-slate-800 mb-4 hover:text-indigo-600 transition-colors"
                        >
                            <span>Opciones Avanzadas</span>
                            {showAdvanced ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {showAdvanced && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                {/* Hashtags */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <Hash size={16} className="text-indigo-600" />
                                        Hashtags
                                    </label>
                                    <input
                                        type="text"
                                        value={hashtags}
                                        onChange={(e) => setHashtags(e.target.value)}
                                        placeholder="Ej: #moda #tendencias #estilo"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Se agregarán al final de la descripción</p>
                                </div>

                                {/* Ubicación */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <MapPin size={16} className="text-indigo-600" />
                                        Ubicación
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        placeholder="Ej: Ciudad de México, México"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                    />
                                </div>

                                {/* Alt Text - Solo visible si hay imágenes */}
                                {mediaFiles.length > 0 && mediaFiles.some(f => f.type === 'image') && (
                                    <div>
                                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                            <ImageIcon size={16} className="text-indigo-600" />
                                            Texto Alternativo (Alt Text)
                                        </label>
                                        <textarea
                                            value={altText}
                                            onChange={(e) => setAltText(e.target.value)}
                                            placeholder="Describe la imagen para accesibilidad..."
                                            className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Ayuda a personas con discapacidad visual</p>
                                    </div>
                                )}

                                {/* Primer Comentario */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <MessageSquare size={16} className="text-indigo-600" />
                                        Primer Comentario
                                    </label>
                                    <textarea
                                        value={firstComment}
                                        onChange={(e) => setFirstComment(e.target.value)}
                                        placeholder="Agrega un comentario automáticamente después de publicar..."
                                        className="w-full h-20 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-700"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Útil para agregar hashtags adicionales o información extra</p>
                                </div>

                                {/* Etiquetas de Usuarios */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                                        <Users size={16} className="text-indigo-600" />
                                        Etiquetas de Usuarios
                                    </label>
                                    <input
                                        type="text"
                                        value={userTags}
                                        onChange={(e) => setUserTags(e.target.value)}
                                        placeholder="Ej: @usuario1, @usuario2"
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">Separa los usuarios con comas</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Columna Derecha: Configuración y Preview */}
                <div className="space-y-6">

                    {/* Programación */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={20} /> Publicación
                        </h3>

                        <div className="flex items-center gap-3 mb-6 bg-slate-50 p-1 rounded-lg">
                            <button
                                onClick={() => setIsScheduled(false)}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!isScheduled ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Publicar Ahora
                            </button>
                            <button
                                onClick={() => setIsScheduled(true)}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${isScheduled ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Programar
                            </button>
                        </div>

                        {isScheduled && (
                            <div className="mb-6 animate-in fade-in slide-in-from-top-2">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Fecha y Hora</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="datetime-local"
                                        value={scheduledDate}
                                        onChange={(e) => setScheduledDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2">
                            <Send size={20} />
                            {isScheduled ? 'Programar Publicación' : 'Publicar Ahora'}
                        </button>
                    </div>

                    {/* Preview Simple */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm opacity-80 pointer-events-none select-none">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Vista Previa (Instagram)</h4>
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                            <div className="flex items-center gap-2 p-3 border-b border-slate-50">
                                <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                                <div className="h-3 w-24 bg-slate-200 rounded"></div>
                            </div>
                            <div className="aspect-square bg-slate-100 flex items-center justify-center text-slate-300">
                                {mediaFiles.length > 0 ? (
                                    <img src={mediaFiles[0].preview} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={48} />
                                )}
                            </div>
                            <div className="p-3 space-y-2">
                                <div className="flex gap-3 text-slate-300">
                                    <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                                    <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                                    <div className="w-5 h-5 bg-slate-200 rounded-full"></div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs text-slate-600 line-clamp-2">
                                        <span className="font-bold text-slate-800 mr-1">usuario</span>
                                        {caption || 'Tu descripción aparecerá aquí...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default RedesSociales;
