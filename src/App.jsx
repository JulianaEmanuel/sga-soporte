import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login    from "./pages/Login";
import Soporte  from "./pages/Soporte";
import Usuarios from "./pages/Usuarios";
import Dashboard from "./pages/Dashboard";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/"          element={<Navigate to="/login" />} />
                <Route path="/login"     element={<Login />} />
                <Route path="/soporte"   element={<Soporte />} />
                <Route path="/usuarios"  element={<Usuarios />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;