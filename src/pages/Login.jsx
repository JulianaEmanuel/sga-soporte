import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const PRIMARY = "#243A76";
const PRIMARY_LIGHT = "#2d4a96";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError]       = useState("");
    const [loading, setLoading]   = useState(false);
    const navigate                = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError("");
        try {
            const r = await axios.post("http://localhost:8080/api/auth/login", {
                username, password,
            });
            localStorage.setItem("token",    r.data.token);
            localStorage.setItem("username", r.data.username);
            localStorage.setItem("roles",    JSON.stringify(r.data.roles));
            navigate("/soporte");
        } catch {
            setError("Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

                {/* Header */}
                <div style={{ backgroundColor: PRIMARY }} className="px-8 py-8 text-center">
                    <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    </div>
                    <h1 className="text-white font-bold text-lg">Soporte Técnico</h1>
                    <p className="text-white text-opacity-70 text-xs mt-1">
                        Sistema de Gestión Académica
                    </p>
                    <p className="text-white text-opacity-50 text-xs">
                        Escuela «Provincias Unidas»
                    </p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleLogin} className="px-8 py-6 space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-600 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                            Usuario
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="Ingresa tu usuario"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-600 block mb-1">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        style={{ backgroundColor: PRIMARY }}
                        className="w-full text-white py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition disabled:opacity-50 mt-2"
                    >
                        {loading ? "Ingresando..." : "Ingresar"}
                    </button>
                </form>

                <p className="text-center text-xs text-slate-400 pb-5">
                    Sistema de Gestión Académica © 2026
                </p>
            </div>
        </div>
    );
}