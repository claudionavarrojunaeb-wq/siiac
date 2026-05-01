import { BrowserRouter, Routes, Route } from "react-router-dom";
import InicioForm from "./features/inicio/InicioForm";
import EstudianteForm from "./features/estudiante/EstudianteForm";
import PadreForm from "./features/padre/PadreForm";
import RedForm from "./features/red/RedForm";
import OtroForm from "./features/otro/OtroForm";
import VerLog from "./pages/VerLog";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<InicioForm />} />
        <Route path="/EstudianteForm" element={<EstudianteForm />} />
        <Route path="/PadreForm" element={<PadreForm />} />
        <Route path="/RedForm" element={<RedForm />} />
        <Route path="/OtroForm" element={<OtroForm />} />
        <Route path="/verlog" element={<VerLog />} />
      </Routes>
    </BrowserRouter>
  );
}

