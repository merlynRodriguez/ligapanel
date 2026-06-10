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
  Clock,
  ArrowLeftRight,
  PenTool
} from 'lucide-react';

// Fallback logo helper for clubs without logos in the public directory
const FallbackClubLogo = ({ name }) => (
  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-100 border border-green-300 flex items-center justify-center font-black text-green-800 text-xs shadow-inner uppercase tracking-wider">
    {name.substring(0, 2)}
  </div>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('panel-usuario');
  
  // Login Session States
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Dynamic Clubs state fetched from API
  const [clubes, setClubes] = useState([]);
  
  // Local cache of all player records
  const [jugadoresLocales, setJugadoresLocales] = useState([]);
  const [loadingJugadores, setLoadingJugadores] = useState(true);
  
  // Search States
  const [userPanelSearch, setUserPanelSearch] = useState('');
  const [selectedUserPlayer, setSelectedUserPlayer] = useState(null);
  const [userSearchError, setUserSearchError] = useState('');

  const [carnetSearch, setCarnetSearch] = useState('');
  const [selectedCarnetPlayer, setSelectedCarnetPlayer] = useState(null);
  const [carnetSearchError, setCarnetSearchError] = useState('');

  // Transfer options
  const [selectedTargetClub, setSelectedTargetClub] = useState(null);
  const [actionType, setActionType] = useState(null); // null | 'pase' | 'prestamo'
  const [loanPeriod] = useState('1 año');
  const [successNotification, setSuccessNotification] = useState('');

  // Login handler (Bypassed client-side mock login)
  const handleLogin = (e) => {
    if (e) e.preventDefault();
    const mockUser = {
      id: 1,
      email: loginEmail || 'admin@ligadefutbolvinto.com',
      rol: 'ADMIN',
      id_equipo: null
    };
    setUser(mockUser);
    sessionStorage.setItem('user', JSON.stringify(mockUser));
  };

  // Logout handler
  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    setLoginEmail('');
    setLoginPassword('');
  };

  // Fetch all clubs and players on mount for local caching
  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const resClubes = await fetch('/api/equipos');
        const dataClubes = await resClubes.json();
        setClubes(dataClubes);

        const resJugadores = await fetch('/api/jugadores/todos');
        const dataJugadores = await resJugadores.json();
        setJugadoresLocales(dataJugadores);
        setLoadingJugadores(false);
      } catch (err) {
        console.error('Error fetching initial data from API:', err);
        setLoadingJugadores(false);
      }
    };
    fetchDatos();
  }, []);

  const handleUserSearch = (e) => {
    if (e) e.preventDefault();
    const query = userPanelSearch.trim().toUpperCase();
    if (!query) return;

    // Search locally in cached jugadoresLocales
    const found = jugadoresLocales.find(j => j.id === query);
    if (found) {
      // Photo is loaded/downloaded only when player is searched/selected
      setSelectedUserPlayer({
        ...found,
        foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/${found.id}`
      });
      setUserSearchError('');
      setActionType(null);
      setSelectedTargetClub(null);
    } else {
      // Fuzzy match name or surname
      const matches = jugadoresLocales.filter(j => 
        j.id.includes(query) || 
        j.nombre.toUpperCase().includes(query)
      );

      if (matches.length > 0) {
        setSelectedUserPlayer({
          ...matches[0],
          foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/${matches[0].id}`
        });
        setUserSearchError('');
        setActionType(null);
        setSelectedTargetClub(null);
      } else {
        setSelectedUserPlayer(null);
        setUserSearchError('No se encontró ningún jugador con ese nombre o código.');
      }
    }
  };

  const handleCarnetSearch = (e) => {
    if (e) e.preventDefault();
    const query = carnetSearch.trim().toUpperCase();
    if (!query) return;

    // Search locally in cached jugadoresLocales
    const found = jugadoresLocales.find(j => j.id === query);
    if (found) {
      setSelectedCarnetPlayer({
        ...found,
        foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/${found.id}`
      });
      setCarnetSearchError('');
    } else {
      // Fuzzy match name or surname
      const matches = jugadoresLocales.filter(j => 
        j.id.includes(query) || 
        j.nombre.toUpperCase().includes(query)
      );

      if (matches.length > 0) {
        setSelectedCarnetPlayer({
          ...matches[0],
          foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/${matches[0].id}`
        });
        setCarnetSearchError('');
      } else {
        setSelectedCarnetPlayer(null);
        setCarnetSearchError('No se encontró ningún jugador con ese nombre o código.');
      }
    }
  };

  // Perform Transfer (Pase o Préstamo) via API
  const handleTransfer = async (targetTeam) => {
    if (!selectedUserPlayer) return;
    
    try {
      const res = await fetch('/api/traspaso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: selectedUserPlayer.id,
          targetTeamName: targetTeam,
          actionType,
          loanPeriod
        })
      });
      const data = await res.json();
      
      if (data.success) {
        // Refetch all players to update the local cache
        const resJugadores = await fetch('/api/jugadores/todos');
        const dataJugadores = await resJugadores.json();
        setJugadoresLocales(dataJugadores);

        // Find the updated player record from the new list
        const updatedPlayer = dataJugadores.find(j => j.id === selectedUserPlayer.id);
        if (updatedPlayer) {
          const playerWithFoto = {
            ...updatedPlayer,
            foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/${updatedPlayer.id}`
          };
          setSelectedUserPlayer(playerWithFoto);
          
          // Sync with carnet tab if same player is selected
          if (selectedCarnetPlayer && selectedCarnetPlayer.id === selectedUserPlayer.id) {
            setSelectedCarnetPlayer(playerWithFoto);
          }
        }
        
        // Trigger toast notification
        const verb = actionType === 'pase' ? 'traspasado' : 'prestado';
        setSuccessNotification(`¡Operación Exitosa! ${selectedUserPlayer.nombre} ha sido ${verb} al club ${targetTeam}.`);
        
        // Reset selection states
        setSelectedTargetClub(null);
        setActionType(null);
        
        setTimeout(() => {
          setSuccessNotification('');
        }, 4500);
      } else {
        alert('Error al realizar el traspaso en el servidor.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al servidor.');
    }
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
    const club = clubes.find(c => c.nombre === teamName);
    return club ? club.logo : null;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-green-900 to-green-950 flex items-center justify-center p-4 relative overflow-hidden select-none">
        {/* Decorative backgrounds */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Tilted decorative backgrounds */}
        <div className="absolute w-[420px] h-[340px] bg-green-800/20 rounded-3xl -rotate-6 transform translate-x-4 translate-y-4 blur-[2px] pointer-events-none"></div>
        <div className="absolute w-[420px] h-[340px] bg-amber-400/10 rounded-3xl rotate-3 transform -translate-x-4 -translate-y-4 blur-[2px] pointer-events-none"></div>

        <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-6">
          <div className="flex flex-col items-center space-y-3">
            <div className="bg-white rounded-full p-1 border-2 border-amber-400 shadow-xl shadow-amber-400/20">
              <img
                src="/logo-liga.png"
                alt="Liga Vinto"
                className="h-20 w-20 rounded-full object-cover"
              />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">
                LIGA <span className="text-amber-400">VINTO</span>
              </h2>
              <p className="text-[10px] text-green-300 font-extrabold uppercase tracking-wider">
                Panel de Control y Acreditaciones
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-green-200 uppercase tracking-wider block">ID / Correo Electrónico (Opcional)</label>
              <input
                type="text"
                placeholder="admin@ligadefutbolvinto.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-white text-sm font-semibold transition-all shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-green-200 uppercase tracking-wider block">Contraseña (Opcional)</label>
              <input
                type="password"
                placeholder="Cualquier contraseña"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/15 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 text-white text-sm font-semibold transition-all shadow-inner"
              />
            </div>

            {loginError && (
              <div className="p-3.5 bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold rounded-xl text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-green-950 font-black text-sm py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
            >
              <UserCheck size={18} />
              <span>Ingresar al Panel</span>
            </button>
          </form>

          <div className="pt-2 border-t border-white/10 text-center">
            <span className="text-[10px] text-green-200/60 font-semibold block font-sans">
              Usa tus credenciales oficiales de administrador de la Liga
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      
      {/* 1. Nav Header */}
      <header className="bg-green-900 text-white shadow-lg sticky top-0 z-50 print:hidden transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-1 shadow-lg border-2 border-green-400 hover:scale-105 transition-transform duration-300">
                <img
                  src="/logo-liga.png"
                  alt="Liga Vinto"
                  className="h-16 w-16 sm:h-18 sm:w-18 rounded-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-none flex items-center gap-1">
                  LIGA <span className="text-amber-400 font-extrabold">VINTO</span>
                </h1>
                <p className="text-[10px] text-green-200 tracking-wider font-bold uppercase mt-1">
                  Panel de Control y Acreditaciones
                </p>
              </div>
            </div>

            {/* Nav Tabs and logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex space-x-1 sm:space-x-3">
                <button
                  onClick={() => setActiveTab('panel-usuario')}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-tight transition-all duration-300 ${
                    activeTab === 'panel-usuario'
                      ? 'bg-green-750 text-white shadow-md border border-green-600/40 translate-y-[-1px]'
                      : 'text-green-100 hover:bg-green-800/60 hover:text-white'
                  }`}
                >
                  <Users size={16} />
                  <span className="hidden sm:inline">Panel de Traspasos</span>
                  <span className="sm:hidden">Traspasos</span>
                </button>
                <button
                  onClick={() => setActiveTab('generar-carnet')}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold tracking-tight transition-all duration-300 ${
                    activeTab === 'generar-carnet'
                      ? 'bg-green-750 text-white shadow-md border border-green-600/40 translate-y-[-1px]'
                      : 'text-green-100 hover:bg-green-800/60 hover:text-white'
                  }`}
                >
                  <CreditCard size={16} />
                  <span className="hidden sm:inline">Generar Carnet</span>
                  <span className="sm:hidden">Carnet</span>
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="bg-rose-700/20 hover:bg-rose-700/45 border border-rose-500/25 hover:border-rose-500/45 text-rose-200 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 flex items-center justify-center gap-1 shadow-sm active:scale-95"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0">
        
        {/* Success Toast */}
        {successNotification && (
          <div className="fixed bottom-6 right-6 z-50 bg-green-950 border-l-4 border-amber-400 text-white p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-up max-w-md print:hidden border border-green-900">
            <CheckCircle className="text-amber-400 w-6 h-6 flex-shrink-0" />
            <div>
              <p className="text-sm font-extrabold">{successNotification}</p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 1: PANEL DE TRASPASOS                                     */}
        {/* ============================================================== */}
        {activeTab === 'panel-usuario' && (
          <div className="space-y-8 animate-fade-in print:hidden">
            
            {/* Header info */}
            <div className="bg-gradient-to-r from-green-800 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_60%)]"></div>
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Módulo de Fichajes
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Registro y Control de Pases</h2>
                <p className="text-green-100/90 text-sm sm:text-base max-w-2xl font-medium">
                  Realiza transferencias definitivas o préstamos temporales de jugadores entre clubes inscritos en la Liga de Fútbol Vinto.
                </p>
              </div>
            </div>

            {/* Wide Search Card at the top */}
            <div className="relative group w-full">
              <div className="absolute -inset-1 bg-green-200 rounded-2xl rotate-[0.3deg] group-hover:rotate-[0.6deg] transition-transform duration-300"></div>
              
              <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <Search className="text-green-700 w-5 h-5" />
                  Buscador de Jugadores
                </h3>
                
                <form onSubmit={handleUserSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Ingresa el nombre, apellido o código/C.I. del jugador..."
                      value={userPanelSearch}
                      onChange={(e) => setUserPanelSearch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm font-semibold shadow-inner"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 active:scale-95 text-white px-8 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    Buscar
                  </button>
                </form>

                {userSearchError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-lg animate-fade-in">
                    {userSearchError}
                  </div>
                )}

                {/* Database Search Suggestions */}
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Búsquedas sugeridas (Base de Datos):</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => { 
                        setUserPanelSearch("9435234");
                        const found = jugadoresLocales.find(j => j.id === "9435234");
                        if (found) {
                          setSelectedUserPlayer({
                            ...found,
                            foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/9435234`
                          });
                          setActionType(null);
                          setSelectedTargetClub(null);
                          setUserSearchError('');
                        }
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-650 font-extrabold text-xs rounded-full transition-colors"
                    >
                      9435234 (Luis Siles)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserPanelSearch("9390622");
                        const found = jugadoresLocales.find(j => j.id === "9390622");
                        if (found) {
                          setSelectedUserPlayer({
                            ...found,
                            foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/9390622`
                          });
                          setActionType(null);
                          setSelectedTargetClub(null);
                          setUserSearchError('');
                        }
                      }}
                      className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-655 font-extrabold text-xs rounded-full transition-colors"
                    >
                      9390622 (Jhenry Arancibia)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Layout below the search card */}
            {selectedUserPlayer ? (
              <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-stretch animate-fade-in">
                
                {/* Left Column: Expanded Selected Player Profile Card */}
                <div className="relative group h-full">
                  <div className="absolute -inset-1.5 bg-yellow-200 rounded-2xl -rotate-[0.5deg] group-hover:-rotate-[1deg] transition-transform duration-300"></div>
                  
                  <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden h-full flex flex-col justify-between">
                    <div>
                      <div className="bg-gradient-to-r from-green-850/5 to-green-850/10 p-6 border-b border-slate-100 flex items-center gap-4">
                        <div className="relative">
                          <img
                            src={selectedUserPlayer.foto}
                            alt={selectedUserPlayer.nombre}
                            className="w-20 h-20 rounded-full border-2 border-white shadow-md bg-white object-cover"
                            onError={(e) => {
                              e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedUserPlayer.nombre}`;
                            }}
                          />
                          <span className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-1 border border-white">
                            <UserCheck size={14} />
                          </span>
                        </div>
                        <div>
                          <span className="bg-green-100 text-green-855 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                            Registro Activo
                          </span>
                          <h3 className="font-extrabold text-slate-900 text-xl mt-1 leading-tight">{selectedUserPlayer.nombre}</h3>
                          <p className="text-xs text-slate-550 font-bold">Código/C.I.: {selectedUserPlayer.id}</p>
                        </div>
                      </div>

                      <div className="p-6 space-y-6">
                        {/* Technical Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50/40 p-4 rounded-xl border border-green-100">
                            <span className="text-[10px] font-bold text-green-850 block uppercase tracking-wider">Club Actual</span>
                            <span className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 mt-1">
                              {(() => {
                                const logo = getClubLogo(selectedUserPlayer.equipoActual);
                                return logo ? (
                                  <img src={logo} alt={selectedUserPlayer.equipoActual} className="w-6 h-6 object-contain" />
                                ) : (
                                  <Shield className="w-5 h-5 text-green-700" />
                                );
                              })()}
                              {selectedUserPlayer.equipoActual}
                            </span>
                          </div>
                          <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100">
                            <span className="text-[10px] font-bold text-amber-800 block uppercase tracking-wider">Categoría</span>
                            <span className="font-extrabold text-green-855 text-sm flex items-center gap-1 mt-1">
                              <Award className="w-5 h-5 text-amber-500" />
                              Primera Honor
                            </span>
                          </div>
                        </div>

                        {/* Timeline / Historial */}
                        <div>
                          <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-slate-400" />
                            Trayectoria Registrada
                          </h4>
                          <div className="relative border-l-2 border-green-100 pl-4 space-y-4 ml-2">
                            {selectedUserPlayer.historial && selectedUserPlayer.historial.length > 0 ? (
                              selectedUserPlayer.historial.map((hist, idx) => (
                                <div key={idx} className="relative">
                                  <span className="absolute -left-[21px] top-1 bg-white border-2 border-green-700 rounded-full w-2.5 h-2.5"></span>
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-[10px] text-green-800 bg-green-100/60 px-2 py-0.5 rounded">
                                      {hist.año}
                                    </span>
                                    <span className="font-semibold text-xs text-slate-700">
                                      {hist.equipo}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-xs text-slate-400 italic">Sin registros de inscripción previos.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Transfer/Club Panel (Box content dynamically swaps) */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 flex flex-col justify-between h-full min-h-[400px]">
                  {selectedTargetClub ? (
                    /* Show ONLY details and option buttons for selected target club in this box space */
                    <div className="space-y-6 animate-fade-in flex flex-col justify-between h-full">
                      <div className="space-y-6">
                        {/* Header details with enlarged back button */}
                        <div className="flex items-center justify-between border-b pb-4">
                          <div className="flex items-center gap-3">
                            {(() => {
                              const logo = getClubLogo(selectedTargetClub);
                              return logo ? (
                                <img src={logo} alt={selectedTargetClub} className="w-12 h-12 object-contain" />
                              ) : (
                                <FallbackClubLogo name={selectedTargetClub} />
                              );
                            })()}
                            <div className="text-left">
                              <span className="text-[9px] bg-green-100 text-green-855 px-2 py-0.5 rounded-full uppercase font-black">
                                Club de Destino
                              </span>
                              <h3 className="font-black text-slate-800 text-xl leading-none mt-1">
                                {selectedTargetClub}
                              </h3>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTargetClub(null);
                              setActionType(null);
                            }}
                            className="text-sm text-slate-600 hover:text-green-855 hover:bg-slate-200 font-extrabold flex items-center gap-1 bg-slate-100 px-4 py-2.5 rounded-xl transition-all shadow-sm"
                          >
                            ← Volver
                          </button>
                        </div>

                        {/* Centered Options Section */}
                        <div className="space-y-5 flex flex-col items-center text-center">
                          <div>
                            <h4 className="font-extrabold text-slate-850 text-sm">
                              Tipo de Traspaso para <span className="text-green-850 font-black">{selectedTargetClub}</span>
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                              Define las condiciones de afiliación de {selectedUserPlayer.nombre} para continuar.
                            </p>
                          </div>

                          {/* Option Selector (Enlarged buttons, Centered) */}
                          <div className="bg-slate-100 p-1.5 rounded-2xl flex w-full max-w-md border border-slate-200/50 mx-auto">
                            <button
                              type="button"
                              onClick={() => setActionType('pase')}
                              className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all text-center ${
                                actionType === 'pase'
                                  ? 'bg-white text-green-900 shadow-md border border-slate-200/50'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Pase Definitivo
                            </button>
                            <button
                              type="button"
                              onClick={() => setActionType('prestamo')}
                              className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all text-center ${
                                actionType === 'prestamo'
                                  ? 'bg-white text-green-900 shadow-md border border-slate-200/50'
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              Préstamo
                            </button>
                          </div>

                          {actionType === 'prestamo' && (
                            <div className="bg-green-50 border border-green-200/50 rounded-xl p-3.5 text-xs space-y-1 animate-slide-up w-full max-w-md mx-auto text-left">
                              <p className="font-bold text-green-855">
                                Duración del Préstamo: 1 Año
                              </p>
                              <p className="text-[10px] text-slate-555">
                                Plazo reglamentario estándar establecido por la Liga de Fútbol Vinto.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Confirm Action Button */}
                      <div className="pt-6 border-t border-slate-100 mt-6">
                        <button
                          type="button"
                          onClick={() => handleTransfer(selectedTargetClub)}
                          disabled={!actionType}
                          className="w-full bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-sm py-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                          <CheckCircle size={18} />
                          {actionType === 'pase' 
                            ? `Confirmar Pase a ${selectedTargetClub}` 
                            : actionType === 'prestamo' 
                              ? `Confirmar Préstamo a ${selectedTargetClub}` 
                              : `Selecciona una Modalidad`
                          }
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Show sorted clubs list inside the box */
                    <div className="space-y-6 animate-fade-in flex flex-col justify-between h-full">
                      <div className="space-y-6">
                        <div>
                          <h3 className="font-black text-slate-800 text-xl flex items-center gap-2">
                            <ArrowLeftRight className="text-green-700 w-5 h-5" />
                            Selecciona el Club de Destino
                          </h3>
                          <p className="text-xs text-slate-550 mt-1 font-medium text-left">
                            Haz clic en uno de los clubes disponibles en orden alfabético para gestionar el traspaso de <strong className="text-slate-800">{selectedUserPlayer.nombre}</strong>.
                          </p>
                        </div>

                        {/* Alphabetically Sorted Club list */}
                        <div className="grid sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2">
                          {clubes
                            .filter(club => club.nombre !== selectedUserPlayer.equipoActual)
                            .sort((a, b) => a.nombre.localeCompare(b.nombre))
                            .map((club, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => {
                                  setSelectedTargetClub(club.nombre);
                                  setActionType(null);
                                }}
                                className="border text-left rounded-xl p-3.5 flex items-center gap-3 border-slate-200/80 hover:border-green-600 hover:bg-green-50/10 transition-all duration-200 shadow-sm w-full"
                              >
                                {club.logo ? (
                                  <img
                                    src={club.logo}
                                    alt={club.nombre}
                                    className="w-10 h-10 object-contain hover:scale-105 transition-transform duration-200"
                                  />
                                ) : (
                                  <FallbackClubLogo name={club.nombre} />
                                )}
                                <div>
                                  <h5 className="font-extrabold text-slate-800 text-sm leading-snug">{club.nombre}</h5>
                                  <p className="text-[10px] text-slate-400">Liga de Vinto</p>
                                </div>
                              </button>
                            ))
                          }
                        </div>
                      </div>
                      
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-450 text-xs font-semibold mt-4">
                        Selecciona un equipo de la lista de arriba para desplegar las opciones de traspaso.
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              /* Empty State */
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16 text-center flex flex-col items-center justify-center space-y-4 max-w-2xl mx-auto w-full">
                <div className="bg-slate-50 p-4 rounded-full text-slate-400">
                  <Users size={48} className="animate-pulse" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="font-bold text-slate-700">Ningún jugador seleccionado</h4>
                  <p className="text-xs text-slate-400">
                    Utiliza el buscador en la parte superior para localizar la ficha de un jugador y comenzar el proceso de transferencia.
                  </p>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: GENERAR CARNET                                         */}
        {/* ============================================================== */}
        {activeTab === 'generar-carnet' && (
          <div className="space-y-8 animate-fade-in print:p-0 print:m-0">
            
            {/* Header info */}
            <div className="bg-gradient-to-r from-green-800 to-green-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden print:hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.1),transparent_60%)]"></div>
              <div className="relative z-10 space-y-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-black px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Módulo de Acreditación
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Generador de Carnets Digitales</h2>
                <p className="text-green-100/90 text-sm sm:text-base max-w-2xl font-medium">
                  Crea credenciales oficiales para los jugadores habilitados con un formato listo para imprimir.
                </p>
              </div>
            </div>

            {/* Grid */}
            <div className="grid lg:grid-cols-[1fr_1.5fr] gap-8 items-start print:block print:p-0 print:m-0">
              
              {/* Left Column: Search */}
              <div className="space-y-6 print:hidden">
                
                {/* Search Card */}
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-green-200 rounded-2xl rotate-1 group-hover:rotate-2 transition-transform duration-300"></div>
                  
                  <div className="relative bg-white rounded-2xl shadow-lg border border-slate-100 p-6 space-y-4">
                    <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
                      <Search className="text-green-700 w-5 h-5" />
                      Buscador de Jugadores
                    </h3>
                    <p className="text-xs text-slate-550 font-medium">
                      Busca al jugador para renderizar su credencial oficial en tiempo real. Prueba con el código <strong className="text-green-700">9435234</strong> o <strong className="text-green-700">9390622</strong>.
                    </p>
                    
                    <form onSubmit={handleCarnetSearch} className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Ej: 9435234, Luis Siles, 9390622"
                          value={carnetSearch}
                          onChange={(e) => setCarnetSearch(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm font-semibold shadow-inner"
                        />
                      </div>
                      <button
                        type="submit"
                        className="bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 active:scale-95 text-white px-5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-1.5"
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
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Búsquedas sugeridas:</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setCarnetSearch("9435234");
                            const found = jugadoresLocales.find(j => j.id === "9435234");
                            if (found) {
                              setSelectedCarnetPlayer({
                                ...found,
                                foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/9435234`
                              });
                              setCarnetSearchError('');
                            }
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-800 text-slate-650 font-extrabold text-xs rounded-full transition-colors"
                        >
                          9435234 (Luis Siles)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCarnetSearch("9390622");
                            const found = jugadoresLocales.find(j => j.id === "9390622");
                            if (found) {
                              setSelectedCarnetPlayer({
                                ...found,
                                foto: `https://res.cloudinary.com/dp4r9jmos/image/upload/v1781042307/9390622`
                              });
                              setCarnetSearchError('');
                            }
                          }}
                          className="px-3 py-1 bg-slate-100 hover:bg-green-100 hover:text-green-850 text-slate-655 font-extrabold text-xs rounded-full transition-colors"
                        >
                          9390622 (Jhenry)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Instructions card */}
                <div className="relative group">
                  <div className="absolute -inset-1.5 bg-yellow-100 rounded-2xl -rotate-1 group-hover:-rotate-2 transition-transform duration-300"></div>
                  
                  <div className="relative bg-slate-900 rounded-2xl p-6 text-white space-y-4 shadow-xl border border-slate-800">
                    <h4 className="font-extrabold text-sm uppercase tracking-wide text-amber-400 flex items-center gap-1.5">
                      <Printer className="w-4 h-4" />
                      Instrucciones de Impresión
                    </h4>
                    <ul className="space-y-3.5 text-xs text-slate-300 font-medium">
                      <li className="flex items-start gap-2.5">
                        <span className="bg-green-800 border border-green-700/50 rounded-full px-2 py-0.5 text-[10px] font-black">1</span>
                        <span>El carnet utiliza el tamaño estándar de tarjeta de crédito (<strong>CR-80: 85.6mm x 54mm</strong>).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="bg-green-800 border border-green-700/50 rounded-full px-2 py-0.5 text-[10px] font-black">2</span>
                        <span>Al presionar <strong>Imprimir</strong>, el sistema activará automáticamente el diseño optimizado.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="bg-green-800 border border-green-700/50 rounded-full px-2 py-0.5 text-[10px] font-black">3</span>
                        <span>Asegúrate de marcar la opción <strong>"Gráficos de fondo"</strong> (Background graphics) en el menú de impresión de tu navegador para ver los colores correctamente.</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>

              {/* Right Column: Card Preview & Print Action */}
              <div className="space-y-8 flex flex-col items-center print:block print:p-0 print:m-0">
                {selectedCarnetPlayer ? (
                  <>
                    {/* Visual Card */}
                    <div className="w-full max-w-xl space-y-6 print:w-auto print:max-w-none print:m-0 print:p-0">
                      
                      <h4 className="text-slate-800 font-extrabold text-sm uppercase tracking-wider text-center print:hidden">
                        Vista Previa de la Credencial
                      </h4>

                      {/* THE PHYSICAL CARNET TO PRINT */}
                      <div className="flex justify-center print:block print:p-0 print:m-0">
                        <div 
                          id="print-area"
                          className="w-[350px] sm:w-[480px] h-[220px] sm:h-[300px] bg-gradient-to-br from-green-900 to-green-950 rounded-2xl shadow-2xl relative overflow-hidden border-2 border-amber-400/50 flex flex-col justify-between p-3.5 sm:p-5 select-none print:shadow-none print:border-green-600 print-card-bg"
                        >
                          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.2),transparent_70%)] pointer-events-none"></div>
                          <div className="absolute inset-2 border border-green-400/15 rounded-xl pointer-events-none"></div>

                          {/* 1. Card Header */}
                          <div className="relative z-10 flex items-center justify-between border-b border-green-700/50 pb-2 print:border-green-500/30">
                            <div className="flex items-center gap-2">
                              <img 
                                src="/logo-liga.png" 
                                alt="Liga Logo" 
                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover bg-white p-0.5 border border-green-400/20"
                              />
                              <div>
                                <h5 className="text-[9px] sm:text-xs font-black tracking-tight text-white print-text-white leading-tight">
                                  LIGA DE FÚTBOL VINTO
                                </h5>
                                <p className="text-[6px] sm:text-[8px] text-amber-400 font-black uppercase tracking-widest leading-none">
                                  Credencial de Habilitación
                                </p>
                              </div>
                            </div>
                            <span className="bg-green-800 text-green-200 border border-green-600/50 rounded-full text-[6px] sm:text-[9px] font-black px-2 py-0.5 sm:py-1 uppercase tracking-wider print-card-header print-text-white">
                              TEMPORADA 2023
                            </span>
                          </div>

                          {/* 2. Card Body */}
                          <div className="relative z-10 grid grid-cols-[auto_1fr_auto] gap-2.5 sm:gap-4 items-center my-auto">
                            
                            {/* Left: Player Picture */}
                            <div className="relative">
                              <img
                                src={selectedCarnetPlayer.foto}
                                alt={selectedCarnetPlayer.nombre}
                                className="w-16 sm:w-24 h-16 sm:h-24 object-cover rounded-lg border border-amber-400/70 bg-white/10 shadow-lg"
                                onError={(e) => {
                                  e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${selectedCarnetPlayer.nombre}`;
                                }}
                              />
                              <div className="absolute -bottom-1 -right-1 bg-green-600 text-white rounded-full p-0.5 border border-white text-[6px] sm:text-[8px] font-black flex items-center justify-center w-4.5 h-4.5 sm:w-5 sm:h-5 shadow-sm">
                                OK
                              </div>
                            </div>

                            {/* Middle: Player Details */}
                            <div className="text-white space-y-0.5 sm:space-y-1.5 print-text-white">
                              <div>
                                <span className="text-[5px] sm:text-[7px] text-green-300 font-bold block uppercase leading-none tracking-wider">
                                  Nombre Completo
                                </span>
                                <h4 className="text-xs sm:text-lg font-black tracking-tight uppercase leading-tight text-white print-text-white">
                                  {selectedCarnetPlayer.nombre}
                                </h4>
                              </div>

                              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                <div>
                                  <span className="text-[5px] sm:text-[7px] text-green-300 font-bold block uppercase leading-none tracking-wider">
                                    C.I. / Código
                                  </span>
                                  <span className="text-[8px] sm:text-xs font-black text-amber-400 leading-none">
                                    {selectedCarnetPlayer.id}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[5px] sm:text-[7px] text-green-300 font-bold block uppercase leading-none tracking-wider">
                                    Equipo
                                  </span>
                                  <span className="text-[8px] sm:text-xs font-black text-white print-text-white truncate block leading-none text-left">
                                    {selectedCarnetPlayer.equipoActual}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-1 sm:gap-2">
                                <div>
                                  <span className="text-[5px] sm:text-[7px] text-green-300 font-bold block uppercase leading-none tracking-wider">
                                    Categoría
                                  </span>
                                  <span className="text-[7px] sm:text-[10px] font-black text-slate-300 leading-none">
                                    Honor
                                  </span>
                                </div>
                                <div>
                                  <span className="text-[5px] sm:text-[7px] text-green-300 font-bold block uppercase leading-none tracking-wider">
                                    Habilitación
                                  </span>
                                  <span className="text-[7px] sm:text-[10px] font-black text-green-400 leading-none">
                                    OFICIAL
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: QR Code */}
                            <div className="flex flex-col items-center justify-center bg-white p-1 rounded-lg border border-green-500/20 shadow-lg shrink-0">
                              <img
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=80&data=LIGAVINTO-PLAYER-${selectedCarnetPlayer.id}-${selectedCarnetPlayer.nombre.replace(/\s+/g, '')}`}
                                alt="QR"
                                className="w-10 sm:w-16 h-10 sm:h-16 object-contain"
                              />
                              <span className="text-[4px] sm:text-[5px] text-slate-400 font-bold tracking-wider uppercase mt-0.5">
                                CÓD: {selectedCarnetPlayer.id}
                              </span>
                            </div>

                          </div>

                          {/* 3. Card Footer */}
                          <div className="relative z-10 border-t border-green-700/50 pt-2 flex items-center justify-between print:border-green-500/30">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5 text-amber-400" />
                              <span className="text-[6px] sm:text-[8px] text-slate-300 font-bold">
                                Emisión: <strong className="text-white print-text-white">{getTodayDate()}</strong>
                              </span>
                            </div>
                            
                            {/* President Signature */}
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <span className="text-[4px] sm:text-[5px] text-green-300 font-bold block uppercase leading-none">
                                  Firma Autorizada
                                </span>
                                <span className="text-[6px] sm:text-[8px] text-amber-300 font-black italic block font-serif tracking-tight mt-0.5 leading-none">
                                  Enrique Uribe
                                </span>
                              </div>
                              <div className="h-5 sm:h-7 border-l border-green-700/50 print:border-green-500/30"></div>
                              <div className="flex flex-col items-center">
                                <PenTool className="w-3 sm:w-4.5 h-3 sm:h-4.5 text-amber-400/80 rotate-[-12deg]" />
                                <span className="text-[4px] sm:text-[5px] text-slate-400 font-black tracking-widest -mt-0.5">PRESIDENTE</span>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>

                      {/* Control panel and print triggers */}
                      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-2 print:hidden">
                        <button
                          type="button"
                          onClick={handlePrint}
                          className="w-full sm:w-auto bg-gradient-to-r from-green-800 to-green-700 hover:from-green-700 hover:to-green-600 active:scale-95 text-white font-extrabold text-sm px-8 py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                        >
                          <Printer className="w-5 h-5" />
                          Imprimir Carnet Digital
                        </button>
                      </div>

                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-16 text-center flex flex-col items-center justify-center space-y-4 w-full print:hidden">
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

      {/* 3. Footer */}
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
