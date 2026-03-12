import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await login(username, password);
            } else {
                await register(username, password);
            }
            navigate('/');
        } catch (err) {
            alert("Authentication failed.");
        }
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center relative">
            {/* Background gradient effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4FF00] opacity-[0.03] rounded-full blur-[100px] pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-8 z-10">
                <Music size={28} className="text-[#D4FF00]" />
                <h1 className="text-2xl font-bold tracking-widest text-white uppercase">SONAR</h1>
            </div>

            <div className="bg-[#0A0A0A] border border-[#1a1a1a] p-10 rounded-xl w-full max-w-md z-10 shadow-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">{isLogin ? 'Iniciar Sesion' : 'Registrarse'}</h2>
                    <p className="text-[#888888] text-sm">Accede a tu musica</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Email"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-[#141414] text-white rounded p-3 focus:outline-none border border-transparent focus:border-[#555] transition text-sm"
                    />
                    <input
                        type="password"
                        placeholder="Contrasena"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#141414] text-white rounded p-3 focus:outline-none border border-transparent focus:border-[#555] transition text-sm"
                    />

                    <button type="submit" className="w-full bg-[#D4FF00] text-black font-bold py-3 mt-2 rounded hover:bg-[#bce600] transition-colors">
                        {isLogin ? 'Entrar' : 'Registrar'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-[#555555] text-xs hover:text-white transition-colors"
                    >
                        {isLogin ? 'No tienes cuenta? Registrate' : 'Ya tienes cuenta? Iniciar Sesion'}
                    </button>
                </div>
            </div>

            {/* Made with Emergent watermark */}
            <div className="fixed bottom-[110px] right-8 flex items-center gap-2 text-white bg-black/50 px-3 py-1.5 rounded-full text-xs font-bold border border-white/10 backdrop-blur-sm z-50">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" /></svg>
                by Alberto Ortiz
            </div>
        </div>
    );
};

export default Auth;
