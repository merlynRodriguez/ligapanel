import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Printer, 
  UserCheck, 
  Calendar, 
  Award, 
  CreditCard,
  RefreshCw,
  Clock,
  ArrowLeftRight,
  TrendingUp,
  MapPin,
  PenTool
} from 'lucide-react';

// --- MOCK DATA FROM ORIGINAL PROJECT ---
const initialClubes = [
  { nombre: "Avaroa", logo: "/logos/avaroa.png" },
  { nombre: "Bush Vinto", logo: "/logos/bush-vinto.png" },
  { nombre: "Peñarol", logo: "/logos/peñarol.png" },
  { nombre: "Bush Vinto Junior", logo: "/logos/bush-vinto-junior.png" },
  { nombre: "Millonarios", logo: "/logos/millonarios.png" },
  { nombre: "Amanecer", logo: "/logos/amanecer.png" },
  { nombre: "J Yana", logo: "/logos/j-yana.png" },
  { nombre: "The Strongest", logo: "/logos/the-strongest.png" },
  { nombre: "Olimpic", logo: "/logos/olimpic.png" },
  { nombre: "Deportivo Kali", logo: "/logos/deportivo-kali.png" },
  { nombre: "Sixers", logo: null } // Sixers does not have a physical logo in original public folder
];

const initialJugadores = [
  {
    id: "1111",
    nombre: "Juan Pérez",
    equipoActual: "Avaroa",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Juan",
    historial: [
      { año: 2023, equipo: "Bush Vinto" },
      { año: 2024, equipo: "Avaroa" }
    ]
  },
  {
    id: "2222",
    nombre: "Carlos Mamani",
    equipoActual: "Bush Vinto",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    historial: [
      { año: 2024, equipo: "Bush Vinto" }
    ]
  },
  {
    id: "3333",
    nombre: "Luis Fernández",
    equipoActual: "Peñarol",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luis",
    historial: [
      { año: 2022, equipo: "Amanecer" },
      { año: 2023, equipo: "Peñarol" }
    ]
  },
  {
    id: "4444",
    nombre: "Marcelo Garron Otalora",
    equipoActual: "Sixers",
    foto: "/jugadores/marcelo-garron-otalora.jpg",
    historial: [
      { año: 2024, equipo: "Amanecer" },
      { año: 2025, equipo: "Sixers" }
    ]
  },
  {
    id: "5555",
    nombre: "Brayan Vargas Zeballos",
    equipoActual: "Sixers",
    foto: "/jugadores/brayan-vargas-zeballos.jpg",
    historial: [
      { año: 2023, equipo: "The Strongest" },
      { año: 2024, equipo: "The Strongest" },
      { año: 2025, equipo: "Sixers" }
    ]
  },
  {
    id: "6666",
    nombre: "Gabriel Choque",
    equipoActual: "Amanecer",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel",
    historial: [
      { año: 2024, equipo: "Amanecer" }
    ]
  },
  {
    id: "7777",
    nombre: "Miguel Ángel",
    equipoActual: "J Yana",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel",
    historial: [
      { año: 2022, equipo: "Olimpic" },
      { año: 2024, equipo: "J Yana" }
    ]
  },
  {
    id: "8888",
    nombre: "Roberto Carlos",
    equipoActual: "The Strongest",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto",
    historial: [
      { año: 2024, equipo: "The Strongest" }
    ]
  },
  {
    id: "9999",
    nombre: "Diego Maradona",
    equipoActual: "Olimpic",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Diego",
    historial: [
      { año: 2023, equipo: "Deportivo Kali" },
      { año: 2024, equipo: "Olimpic" }
    ]
  },
  {
    id: "1010",
    nombre: "Lionel Messi",
    equipoActual: "Deportivo Kali",
    foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lionel",
    historial: [
      { año: 2024, equipo: "Deportivo Kali" }
    ]
  }
];

// Fallback graphic for clubs without physics logo
const FallbackClubLogo = ({ name }) => (
  <div className="w-12 h-12 rounded-full bg-green-100 border border-green-300 flex items-center justify-center font-bold text-green-800 text-sm shadow-inner uppercase">
    {name.substring(0, 2)}
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('panel-usuario');
  const [jugadores, setJugadores] = useState(() => {
    const saved = localStorage.getItem('vinto_jugadores');
    return saved ? JSON.parse(saved) : initialJugadores;
  });
  
  // Persist player changes
  useEffect(() => {
    localStorage.setItem('vinto_jugadores', JSON.stringify(jugadores));
  }, [jugadores]);

  // Search States
  const [userPanelSearch, setUserPanelSearch] = useState('');
  const [selectedUserPlayer, setSelectedUserPlayer] = useState(null);
  const [userSearchError, setUserSearchError] = useState('');

  const [carnetSearch, setCarnetSearch] = useState('');
  const [selectedCarnetPlayer, setSelectedCarnetPlayer] = useState(null);
  const [carnetSearchError, setCarnetSearchError] = useState('');

  // Transfer options
  const [actionType, setActionType] = useState(null); // null | 'pase' | 'prestamo'
  const [loanPeriod, setLoanPeriod] = useState('1 año');
  const [successNotification, setSuccessNotification] = useState('');

  // Keep state clean on mount without auto-selecting players
  useEffect(() => {
    // No auto-selection on mount for clean state
  }, []);

  const handleUserSearch = (e) => {
    e.preventDefault();
    if (!userPanelSearch.trim()) return;

    const term = userPanelSearch.trim().toLowerCase();
    const found = jugadores.find(
      p => p.id === term || p.nombre.toLowerCase().includes(term)
    );

    if (found) {
      setSelectedUserPlayer(found);
      setUserSearchError('');
      setActionType(null);
    } else {
      setSelectedUserPlayer(null);
      setUserSearchError('No se encontró ningún jugador con ese nombre o código.');
    }
  };

  const handleCarnetSearch = (e) => {
    e.preventDefault();
    if (!carnetSearch.trim()) return;

    const term = carnetSearch.trim().toLowerCase();
    const found = jugadores.find(
      p => p.id === term || p.nombre.toLowerCase().includes(term)
    );

    if (found) {
      setSelectedCarnetPlayer(found);
      setCarnetSearchError('');
    } else {
      setSelectedCarnetPlayer(null);
      setCarnetSearchError('No se encontró ningún jugador con ese nombre o código.');
    }
  };

  // Perform Transfer (Pase o Préstamo)
  const handleTransfer = (targetTeam) => {
    if (!selectedUserPlayer) return;
    
    const currentYear = new Date().getFullYear();
    const updatedJugadores = jugadores.map(p => {
      if (p.id === selectedUserPlayer.id) {
        const description = actionType === 'pase' 
          ? targetTeam 
          : `${targetTeam} (${loanPeriod})`;
        
        return {
          ...p,
          equipoActual: targetTeam,
          historial: [
            ...p.historial,
            { año: currentYear, equipo: description }
          ]
        };
      }
      return p;
    });

    setJugadores(updatedJugadores);
    
    // Update active player details in UI
    const updatedPlayer = updatedJugadores.find(p => p.id === selectedUserPlayer.id);
    setSelectedUserPlayer(updatedPlayer);

    // If the same player is selected in Carnet, sync it
    if (selectedCarnetPlayer && selectedCarnetPlayer.id === selectedUserPlayer.id) {
      setSelectedCarnetPlayer(updatedPlayer);
    }

    // Trigger beautiful toast notification
    const verb = actionType === 'pase' ? 'traspasado' : 'prestado';
    setSuccessNotification(`¡Operación Exitosa! ${selectedUserPlayer.nombre} ha sido ${verb} al club ${targetTeam}.`);
    
    setTimeout(() => {
      setSuccessNotification('');
    }, 4500);
  };

  // Trigger window print
  const handlePrint = () => {
    window.print();
  };

  // Date of Issue
  const getTodayDate = () => {
    const d = new Date();
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Safe logo lookup
  const getClubLogo = (teamName) => {
    const club = initialClubes.find(c => c.nombre === teamName);
    return club ? club.logo : null;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-between">
      
      {/* 1. Nav Header */}
      <header className="bg-green-800 text-white shadow-lg sticky top-0 z-50 print:hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-0.5 shadow-md border border-green-400/30 hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo-liga.png"
                  alt="Liga Vinto"
                  className="h-14 w-14 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-1.5">
                  LIGA <span className="text-amber-400 font-extrabold">VINTO</span>
                </h1>
                <p className="text-[10px] text-green-200 tracking-wider font-semibold uppercase">Gestión de Fichajes y Carnets</p>
              </div>
            </div>

            {/* Nav Tabs */}
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={() => setActiveTab('panel-usuario')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold tracking-tight transition-all duration-200 ${
                  activeTab === 'panel-usuario'
                    ? 'bg-green-700 text-white shadow-inner border border-green-600'
                    : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                }`}
              >
                <Users size={16} />
                <span>Panel de Traspasos</span>
              </button>
              <button
                onClick={() => setActiveTab('generar-carnet')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs md:text-sm font-bold tracking-tight transition-all duration-200 ${
                  activeTab === 'generar-carnet'
                    ? 'bg-green-700 text-white shadow-inner border border-green-600'
                    : 'text-green-100 hover:bg-green-700/50 hover:text-white'
                }`}
              >
                <CreditCard size={16} />
                <span>Generar Carnet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0">
        
        {/* Success Toast */}
        {successNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-green-900 border-l-4 border-amber-400 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up max-w-md print:hidden">
            <CheckCircle className="text-amber-400 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-sm font-extrabold">{successNotification}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: PANEL DE TRASPASOS / USUARIO                           */}
        {/* ============================================================== */}
        {activeTab === 'panel-usuario' && (
          <div className="space-y-8 animate-fade-in print:hidden">
            
            {/* Header info */}
            <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)]"></div>
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Módulo de Fichajes
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Registro y Control de Pases</h2>
                <p className="text-green-100/90 text-sm sm:text-base max-w-2xl font-medium">
                  Realiza transferencias definitivas o préstamos temporales de jugadores entre clubes inscritos en la Liga de Fútbol Vinto.
                </p>
              </div>
            </div>

            {/* Grid or Centered layout depending on selected player */}
            <div className={selectedUserPlayer ? "grid lg:grid-cols-[1fr_1.8fr] gap-8 items-start animate-fade-in" : "max-w-2xl mx-auto w-full animate-fade-in"}>
              
              {/* Left Column: Search & Quick Info */}
              <div className="space-y-6">
                
                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Search className="text-green-700 w-5 h-5" />
                    Buscador de Jugadores
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Ingresa el nombre o el código/C.I. del jugador. Para pruebas, busca con <strong className="text-green-700 font-bold">4444</strong> o <strong className="text-green-700 font-bold">5555</strong>.
                  </p>
                  
                  <form onSubmit={handleUserSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ej: 4444, Marcelo, 5555"
                        value={userPanelSearch}
                        onChange={(e) => setUserPanelSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm font-semibold shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-800 hover:bg-green-700 active:scale-95 text-white px-5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      Buscar
                    </button>
                  </form>

                  {userSearchError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg animate-fade-in">
                      {userSearchError}
                    </div>
                  )}

                  {/* Quick tags */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Búsquedas sugeridas:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setUserPanelSearch("4444"); const found = jugadores.find(p=>p.id==="4444"); if (found) { setSelectedUserPlayer(found); setActionType(null); } }}
                        className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 font-extrabold text-xs rounded-full transition-colors"
                      >
                        4444 (Marcelo)
                      </button>
                      <button
                        onClick={() => { setUserPanelSearch("5555"); const found = jugadores.find(p=>p.id==="5555"); if (found) { setSelectedUserPlayer(found); setActionType(null); } }}
                        className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 font-extrabold text-xs rounded-full transition-colors"
                      >
                        5555 (Brayan)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Selected Player profile card (Static Info) */}
                {selectedUserPlayer && (
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-slide-up">
                    <div className="bg-green-800/10 p-5 border-b border-slate-100 flex items-center gap-4">
                      <div className="relative">
                        <img
                          src={selectedUserPlayer.foto}
                          alt={selectedUserPlayer.nombre}
                          className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-white object-cover"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUserPlayer.nombre}`;
                          }}
                        />
                        <span className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 border border-white">
                          <UserCheck size={12} />
                        </span>
                      </div>
                      <div>
                        <span className="bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                          Registro Activo
                        </span>
                        <h3 className="font-extrabold text-slate-900 text-lg mt-0.5 leading-tight">{selectedUserPlayer.nombre}</h3>
                        <p className="text-xs text-slate-500 font-bold">Código/C.I.: {selectedUserPlayer.id}</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Technical Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Club de Fichaje</span>
                          <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 mt-0.5">
                            {(() => {
                              const logo = getClubLogo(selectedUserPlayer.equipoActual);
                              return logo ? (
                                <img src={logo} alt={selectedUserPlayer.equipoActual} className="w-5 h-5 object-contain" />
                              ) : (
                                <Shield className="w-4 h-4 text-green-700" />
                              );
                            })()}
                            {selectedUserPlayer.equipoActual}
                          </span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <span className="text-[10px] font-bold text-slate-400 block uppercase">Categoría</span>
                          <span className="font-extrabold text-green-800 text-sm flex items-center gap-1 mt-0.5">
                            <Award className="w-4 h-4" />
                            Primera Honor
                          </span>
                        </div>
                      </div>

                      {/* Timeline / Historial */}
                      <div>
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Trayectoria Registrada
                        </h4>
                        <div className="relative border-l-2 border-slate-100 pl-4 space-y-4 ml-2">
                          {[...selectedUserPlayer.historial].sort((a,b) => b.año - a.año).map((hist, idx) => (
                            <div key={idx} className="relative">
                              <span className="absolute -left-[21px] top-1 bg-white border-2 border-green-800 rounded-full w-2.5 h-2.5"></span>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded">
                                  {hist.año}
                                </span>
                                <span className="font-bold text-xs text-slate-700">
                                  {hist.equipo}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Transfer Form / Club list */}
              {selectedUserPlayer && (
                <div className="space-y-6 animate-slide-up">
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden p-6 sm:p-8 space-y-6">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-5 gap-4">
                      <div>
                        <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                          <ArrowLeftRight className="text-green-700 w-5 h-5" />
                          Gestionar Traspaso de Jugador
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                          Modifica la afiliación de <strong className="text-slate-800">{selectedUserPlayer.nombre}</strong>.
                        </p>
                      </div>
                      
                      {/* Segmented Control */}
                      <div className="bg-slate-100 p-1 rounded-xl flex">
                        <button
                          onClick={() => setActionType('pase')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            actionType === 'pase'
                              ? 'bg-white text-green-800 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Pase Definitivo
                        </button>
                        <button
                          onClick={() => setActionType('prestamo')}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                            actionType === 'prestamo'
                              ? 'bg-white text-green-800 shadow-sm'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Préstamo
                        </button>
                      </div>
                    </div>

                    {/* Mode selection empty state */}
                    {actionType === null ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-3">
                        <div className="bg-white p-3 rounded-full text-slate-400 shadow-sm border border-slate-100">
                          <ArrowLeftRight className="text-green-600 w-8 h-8" />
                        </div>
                        <div className="max-w-xs space-y-1">
                          <h4 className="font-extrabold text-slate-800 text-base">Selecciona una Modalidad</h4>
                          <p className="text-xs text-slate-550 font-medium">
                            Elige entre <strong className="text-green-700">Pase Definitivo</strong> o <strong className="text-green-700">Préstamo</strong> arriba para desplegar los clubes de destino habilitados.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Fixed Loan 1 Year Display Banner */}
                        {actionType === 'prestamo' && (
                          <div className="bg-green-50 border border-green-200/50 rounded-xl p-4 space-y-2 animate-slide-up">
                            <span className="bg-green-100 text-green-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block">
                              Modalidad de Préstamo
                            </span>
                            <h4 className="text-xs font-black text-green-950 uppercase tracking-wide">
                              Duración del Préstamo
                            </h4>
                            <p className="text-sm font-extrabold text-green-800">
                              1 Año <span className="text-xs font-medium text-slate-500">(Única opción permitida por reglamento)</span>
                            </p>
                          </div>
                        )}

                        {/* Club List grid */}
                        <div className="space-y-4 animate-fade-in">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                            {actionType === 'pase' ? 'Selecciona el Club de Destino (Pase Definitivo)' : 'Selecciona el Club de Destino (Préstamo 1 Año)'}
                          </h4>
                          <p className="text-xs text-slate-500 italic">
                            * Excluye su club actual: <strong className="text-green-800 font-bold">{selectedUserPlayer.equipoActual}</strong>.
                          </p>
                          
                          <div className="grid sm:grid-cols-2 gap-3 max-h-[360px] overflow-y-auto pr-2">
                            {initialClubes
                              .filter(club => club.nombre !== selectedUserPlayer.equipoActual)
                              .map((club, idx) => (
                                <div 
                                  key={idx}
                                  className="border border-slate-200/80 rounded-xl p-3.5 hover:border-green-600 hover:bg-slate-50/50 flex items-center justify-between group transition-all duration-200 shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    {club.logo ? (
                                      <img
                                        src={club.logo}
                                        alt={club.nombre}
                                        className="w-10 h-10 object-contain"
                                      />
                                    ) : (
                                      <FallbackClubLogo name={club.nombre} />
                                    )}
                                    <div>
                                      <h5 className="font-extrabold text-slate-800 text-sm leading-snug">{club.nombre}</h5>
                                      <p className="text-[10px] text-slate-400">Liga de Vinto</p>
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => handleTransfer(club.nombre)}
                                    className="bg-green-100 group-hover:bg-green-800 group-hover:text-white text-green-800 p-2 rounded-lg transition-all duration-300 shadow-sm hover:shadow active:scale-90 flex items-center justify-center gap-1"
                                    title={actionType === 'pase' ? "Asignar Pase" : "Asignar Préstamo"}
                                  >
                                    <span className="text-[10px] font-black px-1 group-hover:inline hidden uppercase tracking-wider">
                                      Confirmar
                                    </span>
                                    <ArrowRight size={14} className="flex-shrink-0" />
                                  </button>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      </>
                    )}

                  </div>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GENERAR CARNET                                         */}
        {/* ============================================================== */}
        {activeTab === 'generar-carnet' && (
          <div className="space-y-8 animate-fade-in print:p-0 print:m-0">
            
            {/* Header info - hidden on print */}
            <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_60%)]"></div>
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Módulo de Acreditación
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Generador de Carnets Digitales</h2>
                <p className="text-green-100/90 text-sm sm:text-base max-w-2xl font-medium">
                  Crea credenciales oficiales para los jugadores habilitados con un formato listo para imprimir.
                </p>
              </div>
            </div>

            {/* Grid - hidden on print except the preview element */}
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start print:block print:p-0 print:m-0">
              
              {/* Left Column: Search - hidden on print */}
              <div className="space-y-6 print:hidden">
                
                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
                  <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                    <Search className="text-green-700 w-5 h-5" />
                    Buscador de Jugadores
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Busca al jugador para renderizar su credencial oficial en tiempo real. Prueba con el código <strong className="text-green-700">5555</strong> o <strong className="text-green-700">4444</strong>.
                  </p>
                  
                  <form onSubmit={handleCarnetSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Ej: 5555, Brayan, 4444"
                        value={carnetSearch}
                        onChange={(e) => setCarnetSearch(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm font-semibold shadow-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-green-800 hover:bg-green-700 active:scale-95 text-white px-5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
                    >
                      Buscar
                    </button>
                  </form>

                  {carnetSearchError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg animate-fade-in">
                      {carnetSearchError}
                    </div>
                  )}

                  {/* Suggestion tags */}
                  <div className="pt-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Búsquedas sugeridas:</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setCarnetSearch("5555"); const found = jugadores.find(p=>p.id==="5555"); if (found) setSelectedCarnetPlayer(found); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 font-extrabold text-xs rounded-full transition-colors"
                      >
                        5555 (Brayan)
                      </button>
                      <button
                        onClick={() => { setCarnetSearch("4444"); const found = jugadores.find(p=>p.id==="4444"); if (found) setSelectedCarnetPlayer(found); }}
                        className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-600 font-extrabold text-xs rounded-full transition-colors"
                      >
                        4444 (Marcelo)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Standard print size explanation card */}
                <div className="bg-slate-800 rounded-2xl p-6 text-white space-y-4 shadow-lg border border-slate-700">
                  <h4 className="font-extrabold text-sm uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
                    <Printer className="w-4 h-4" />
                    Instrucciones de Impresión
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-200 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="bg-green-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">1</span>
                      <span>El carnet utiliza el tamaño estándar de tarjeta de crédito (<strong>CR-80: 85.6mm x 54mm</strong>).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">2</span>
                      <span>Al presionar <strong>Imprimir</strong>, el sistema activará automáticamente el diseño optimizado.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="bg-green-700 rounded-full px-1.5 py-0.5 text-[10px] font-bold">3</span>
                      <span>Asegúrate de marcar la opción <strong>"Gráficos de fondo"</strong> (Background graphics) en el menú de impresión de tu navegador para ver los colores correctamente.</span>
                    </li>
                  </ul>
                </div>

              </div>

              {/* Right Column: Card Preview & Print Action */}
              <div className="space-y-8 flex flex-col items-center print:block print:p-0 print:m-0">
                {selectedCarnetPlayer ? (
                  <>
                    {/* Visual Card (Stunning 3D preview on screen, exact dimensions when printed) */}
                    <div className="w-full max-w-xl space-y-6 print:w-auto print:max-w-none print:m-0 print:p-0">
                      
                      <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider text-center print:hidden">
                        Vista Previa de la Credencial
                      </h4>

                      {/* THE PHYSICAL CARNET TO PRINT */}
                      {/* We wrap it in a custom container that print styles will target */}
                      <div className="flex justify-center print:block print:p-0 print:m-0">
                        <div 
                          id="print-area"
                          className="w-[350px] sm:w-[480px] h-[220px] sm:h-[300px] bg-gradient-to-br from-green-900 to-green-950 rounded-2xl shadow-2xl relative overflow-hidden border-2 border-amber-400/50 flex flex-col justify-between p-3 sm:p-5 select-none print:shadow-none print:border-green-600 print-card-bg"
                        >
                          {/* Hologram aesthetic watermark background */}
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2),transparent_70%)] pointer-events-none"></div>
                          
                          {/* Inner glow lines */}
                          <div className="absolute inset-2 border border-green-400/10 rounded-xl pointer-events-none"></div>

                          {/* 1. Card Header */}
                          <div className="relative z-10 flex items-center justify-between border-b border-green-700/60 pb-1.5 sm:pb-2.5 print:border-green-500/30">
                            <div className="flex items-center gap-2">
                              <img 
                                src="/logo-liga.png" 
                                alt="Liga Logo" 
                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover bg-white p-0.5 border border-green-400/20"
                              />
                              <div>
                                <h5 className="text-[10px] sm:text-xs font-black tracking-tight text-white print-text-white leading-tight">
                                  LIGA DE FÚTBOL VINTO
                                </h5>
                                <p className="text-[7px] sm:text-[9px] text-amber-400 font-black uppercase tracking-widest leading-none">
                                  Credencial de Habilitación
                                </p>
                              </div>
                            </div>
                            <span className="bg-green-800 text-green-200 border border-green-600 rounded-full text-[6px] sm:text-[9px] font-black px-1.5 sm:px-2.5 py-0.5 sm:py-1 uppercase tracking-wider print-card-header print-text-white">
                              TEMPORADA 2026
                            </span>
                          </div>

                          {/* 2. Card Body */}
                          <div className="relative z-10 grid grid-cols-[auto_1fr_auto] gap-2.5 sm:gap-4 items-center my-auto">
                            
                            {/* Left: Player Picture */}
                            <div className="relative">
                              <img
                                src={selectedCarnetPlayer.foto}
                                alt={selectedCarnetPlayer.nombre}
                                className="w-16 sm:w-24 h-16 sm:h-24 object-cover rounded-lg border-2 border-amber-400 bg-white/10 shadow-lg"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedCarnetPlayer.nombre}`;
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-0.5 border border-white text-[7px] sm:text-[9px] font-black flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
                                OK
                              </div>
                            </div>

                            {/* Middle: Player Details */}
                            <div className="text-white space-y-0.5 sm:space-y-1.5 print-text-white">
                              <div>
                                <span className="text-[6px] sm:text-[8px] text-green-200 font-bold block uppercase leading-none">
                                  Nombre Completo
                                </span>
                                <h4 className="text-xs sm:text-lg font-black tracking-tight uppercase leading-tight text-white print-text-white">
                                  {selectedCarnetPlayer.nombre}
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                <div>
                                  <span className="text-[6px] sm:text-[8px] text-green-200 font-bold block uppercase leading-none">
                                    C.I. / Código
                                  </span>
                                  <span className="text-[8px] sm:text-xs font-extrabold text-amber-400">
                                    {selectedCarnetPlayer.id}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[6px] sm:text-[8px] text-green-200 font-bold block uppercase leading-none">
                                    Equipo
                                  </span>
                                  <span className="text-[8px] sm:text-xs font-extrabold text-white print-text-white truncate block">
                                    {selectedCarnetPlayer.equipoActual}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                <div>
                                  <span className="text-[6px] sm:text-[8px] text-green-200 font-bold block uppercase leading-none">
                                    Categoría
                                  </span>
                                  <span className="text-[7px] sm:text-[10px] font-bold text-slate-300">
                                    Honor
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[6px] sm:text-[8px] text-green-200 font-bold block uppercase leading-none">
                                    Habilitación
                                  </span>
                                  <span className="text-[7px] sm:text-[10px] font-black text-green-400">
                                    OFICIAL
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: QR Code */}
                            <div className="flex flex-col items-center justify-center bg-white p-1 rounded-lg border border-green-400/20 shadow-lg shrink-0">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80&data=LIGAVINTO-PLAYER-${selectedCarnetPlayer.id}-${selectedCarnetPlayer.nombre.replace(/\s+/g, '')}`}
                                alt="QR"
                                className="w-10 sm:w-16 h-10 sm:h-16 object-contain"
                              />
                              <span className="text-[4px] sm:text-[6px] text-slate-500 font-black tracking-wider uppercase mt-0.5">
                                CÓD: {selectedCarnetPlayer.id}
                              </span>
                            </div>

                          </div>

                          {/* 3. Card Footer */}
                          <div className="relative z-10 border-t border-green-700/60 pt-1.5 sm:pt-2 flex items-center justify-between print:border-green-500/30">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2 sm:w-3.5 h-2 sm:h-3.5 text-amber-400" />
                              <span className="text-[6px] sm:text-[9px] text-slate-200 font-bold">
                                Emisión: <strong className="text-white print-text-white">{getTodayDate()}</strong>
                              </span>
                            </div>
                            
                            {/* President Signature Graphic representation */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-[4px] sm:text-[6px] text-green-200 font-bold block uppercase leading-none">
                                  Firma Autorizada
                                </span>
                                <span className="text-[6px] sm:text-[8px] text-amber-300 font-black italic block font-serif tracking-tight mt-0.5">
                                  Enrique Uribe
                                </span>
                              </div>
                              <div className="h-4 sm:h-7 border-l border-green-700/60 print:border-green-500/30"></div>
                              <div className="flex flex-col items-center">
                                <PenTool className="w-3 sm:w-5 h-3 sm:h-5 text-amber-400/80 rotate-[-12deg]" />
                                <span className="text-[4px] sm:text-[5px] text-slate-400 font-black tracking-widest -mt-0.5">PRESIDENTE</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Control panel and print triggers - hidden on print */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2 print:hidden">
                        <button
                          onClick={handlePrint}
                          className="w-full sm:w-auto bg-green-800 hover:bg-green-700 active:scale-95 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Printer className="w-5 h-5" />
                          Imprimir Carnet Digital
                        </button>
                      </div>

                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-16 text-center flex flex-col items-center justify-center space-y-4 w-full print:hidden">
                    <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                      <CreditCard size={48} className="animate-pulse" />
                    </div>
                    <div className="max-w-xs space-y-1">
                      <h4 className="font-bold text-slate-700">Ningún jugador seleccionado</h4>
                      <p className="text-xs text-slate-400">
                        Busca un jugador en la columna izquierda usando su código para previsualizar y generar su credencial de acreditación oficial.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* 3. Footer - Hidden on print */}
      <footer className="bg-slate-900 text-slate-400 py-8 border-t border-slate-800 print:hidden transition-all duration-300">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 text-center sm:flex sm:items-center sm:justify-between space-y-2 sm:space-y-0">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            © 2026 Liga de Fútbol Vinto. Todos los derechos reservados.
          </p>
          <div className="flex justify-center space-x-6 text-xs font-black uppercase tracking-widest text-slate-400">
            <span>Módulo de Control</span>
            <span>•</span>
            <span>Versión 2.0</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default App;
