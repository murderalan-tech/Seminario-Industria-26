/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDoc, doc, getDocs, writeBatch, limit } from 'firebase/firestore';
import { Calendar, LogOut, MapPin, Plus, List, Camera, Save, Loader2, User as UserIcon, Building2, Briefcase, Hash, ExternalLink, Search, X, ShieldCheck, Download, Upload, FileText, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Papa from 'papaparse';
import LandingPage from './components/LandingPage';

interface Visit {
  id: string;
  salesAdvisor: string;
  customerNumber: string;
  company: string;
  businessName: string;
  latitude: number;
  longitude: number;
  photoBase64: string;
  createdAt: any;
  userId: string;
}

interface Client {
  customerNumber: string;
  businessName: string;
  company: string;
  userId: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'landing' | 'list' | 'form' | 'admin'>('landing');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [dateFilter, setDateFilter] = useState('');

  const filteredVisits = visits.filter(visit => {
    if (!dateFilter) return true;
    const visitDate = new Date(visit.createdAt?.seconds * 1000).toISOString().split('T')[0];
    return visitDate === dateFilter;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u) {
        // Check admin status
        const adminDoc = await getDoc(doc(db, 'admins', u.uid));
        // Also allow the specific user from the request
        const isSystemAdmin = u.email === 'alan.olivares@alchisa.com';
        setIsAdmin(adminDoc.exists() || isSystemAdmin);
      } else {
        setIsAdmin(false);
      }
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setVisits([]);
      return;
    }

    // Admins see all, users see theirs
    const baseQuery = collection(db, 'visits');
    const q = isAdmin && view === 'admin'
      ? query(baseQuery, orderBy('createdAt', 'desc'))
      : query(baseQuery, where('userId', '==', user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Visit[];
      setVisits(docs);
    });

    return unsubscribe;
  }, [user, isAdmin, view]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const handleLogout = () => {
    signOut(auth);
    setView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <LandingPage
        onNavigateToTracker={async () => {
          if (!user) {
            try {
              await handleLogin();
              setView('list');
            } catch (err) {
              console.error(err);
            }
          } else {
            setView('list');
          }
        }}
      />
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <MapPin className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-display font-bold text-gray-900">GeoVisit Tracker</h1>
          <p className="text-gray-500">Registra tus visitas comerciales con ubicación precisa y fotos.</p>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleLogin}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              Iniciar sesión con Google
            </button>
            <button
              onClick={() => setView('landing')}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              Volver a la Landing Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('list')}
          >
            <MapPin className="w-6 h-6 text-blue-600" />
            <span className="font-display font-bold text-xl tracking-tight">GeoVisit</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setView('landing')}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-1.5"
              title="Volver a la Landing Page"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-semibold">Landing Page</span>
            </button>
            {isAdmin && (
              <button
                onClick={() => setView(view === 'admin' ? 'list' : 'admin')}
                className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${
                  view === 'admin' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-blue-600 hover:bg-gray-50'
                }`}
                title="Panel de Administrador"
              >
                <ShieldCheck className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-semibold">Admin</span>
              </button>
            )}
            <div className="h-6 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm font-medium text-gray-600 hidden sm:block">{user.displayName}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 pb-32">
        <AnimatePresence mode="wait">
          {view === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <h2 className="text-xl font-display font-semibold">Mis Visitas</h2>
                  <p className="text-sm text-gray-500">{filteredVisits.length} registros encontrados</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all w-full sm:w-auto"
                    />
                    {dateFilter && (
                      <button 
                        onClick={() => setDateFilter('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {filteredVisits.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center text-gray-500">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="font-medium">No se encontraron visitas.</p>
                  <p className="text-sm">Intenta ajustar el filtro o registra una nueva visita.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredVisits.map((visit) => (
                    <VisitCard key={visit.id} visit={visit} />
                  ))}
                </div>
              )}
            </motion.div>
          ) : view === 'admin' ? (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <AdminPanel visits={visits} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <VisitForm onSave={() => setView('list')} onCancel={() => setView('list')} user={user} isAdmin={isAdmin} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view !== 'admin' && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50">
          <button
            onClick={() => setView(view === 'list' ? 'form' : 'list')}
            className={`h-14 px-8 rounded-full shadow-2xl flex items-center gap-3 font-bold transition-all active:scale-95 ${
              view === 'list' 
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/25' 
                : 'bg-white text-gray-900 hover:bg-gray-100 border border-gray-200 shadow-xl'
            }`}
          >
            {view === 'list' ? (
              <>
                <Plus className="w-6 h-6" />
                <span>Nueva Visita</span>
              </>
            ) : (
              <>
                <List className="w-6 h-6" />
                <span>Ver Mis Visitas</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function VisitCard({ visit }: { visit: Visit }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center gap-4 group">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {visit.photoBase64 ? (
          <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
            <img 
              src={visit.photoBase64} 
              alt={visit.company} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-12 h-12 shrink-0 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300">
            <Camera className="w-5 h-5" />
          </div>
        )}
        <div className="min-w-0 flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4">
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Num. Cliente</div>
            <div className="font-bold text-blue-600 truncate">#{visit.customerNumber}</div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Empresa</div>
            <div className="font-semibold text-gray-900 truncate">{visit.company}</div>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Razón Social</div>
            <div className="text-sm text-gray-500 truncate">{visit.businessName}</div>
          </div>
          <div className="min-w-0 hidden md:block">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Coordenadas</div>
            <div className="text-[11px] font-mono text-gray-400 truncate">
              {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-gray-50">
        <div className="sm:hidden text-[11px] font-mono text-gray-400">
          {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">
            {new Date(visit.createdAt?.seconds * 1000).toLocaleDateString()}
          </span>
          <a 
            href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Ver en Google Maps"
          >
            <MapPin className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function VisitForm({ onSave, onCancel, user, isAdmin }: { onSave: () => void; onCancel: () => void; user: User; isAdmin: boolean }) {
  const [formData, setFormData] = useState({
    salesAdvisor: '',
    customerNumber: '',
    company: '',
    businessName: '',
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isCapturingLocation, setIsCapturingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    if (!user.email) return;
    const fetchClients = async () => {
      setLoadingClients(true);
      try {
        const q = isAdmin
          ? query(collection(db, 'clients'), orderBy('company', 'asc'))
          : query(collection(db, 'clients'), where('userId', '==', user.email), orderBy('company', 'asc'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => doc.data() as Client);
        setClients(list);
      } catch (err) {
        console.error("Error loading clients:", err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, [user.email, isAdmin]);

  const captureLocation = () => {
    setIsCapturingLocation(true);
    setError(null);
    if (!navigator.geolocation) {
      setError("La geolocalización no es soportada por tu navegador.");
      setIsCapturingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsCapturingLocation(false);
      },
      (err) => {
        console.error(err);
        setError("No se pudo obtener la ubicación. Asegúrate de dar permisos.");
        setIsCapturingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setError("La foto es muy grande. El límite es de 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      setError("Debes registrar las coordenadas primero.");
      return;
    }
    
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'visits'), {
        ...formData,
        latitude: location.lat,
        longitude: location.lng,
        photoBase64: photo || '',
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      onSave();
    } catch (err) {
      console.error(err);
      setError("Error al guardar la visita. Inténtalo de nuevo.");
    } finally {
      setIsSaving(false);
    }
  };

  const isManual = selectedClientId === 'manual';

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 max-w-2xl mx-auto">
      <h2 className="text-2xl font-display font-bold mb-6 text-gray-900 border-l-4 border-blue-600 pl-4">Nueva Visita</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-blue-500" />
                Asesor de Venta
              </label>
              <input
                required
                type="text"
                value={formData.salesAdvisor}
                onChange={e => setFormData({ ...formData, salesAdvisor: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                placeholder="Tu nombre"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Empresa a Visitar
              </label>
              {loadingClients ? (
                <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-gray-500 text-sm font-medium">Cargando tus empresas...</span>
                </div>
              ) : (
                <select
                  required
                  value={selectedClientId}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedClientId(val);
                    if (val === 'manual') {
                      setFormData(prev => ({
                        ...prev,
                        customerNumber: '',
                        company: '',
                        businessName: ''
                      }));
                    } else if (val) {
                      const client = clients.find(c => c.customerNumber === val);
                      if (client) {
                        setFormData(prev => ({
                          ...prev,
                          customerNumber: client.customerNumber,
                          company: client.company,
                          businessName: client.businessName
                        }));
                      }
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        customerNumber: '',
                        company: '',
                        businessName: ''
                      }));
                    }
                  }}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium"
                >
                  <option value="">-- Selecciona una empresa --</option>
                  {clients.map(client => (
                    <option key={client.customerNumber} value={client.customerNumber}>
                      {client.company} (#{client.customerNumber})
                    </option>
                  ))}
                  <option value="manual">Ingresar manualmente...</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Hash className="w-4 h-4 text-blue-500" />
                Num. Cliente
              </label>
              <input
                required
                type="text"
                value={formData.customerNumber}
                onChange={e => setFormData({ ...formData, customerNumber: e.target.value })}
                readOnly={selectedClientId && !isManual}
                disabled={!selectedClientId}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium disabled:opacity-50"
                placeholder="Ej. CL-5023"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                Empresa
              </label>
              <input
                required
                type="text"
                value={formData.company}
                onChange={e => setFormData({ ...formData, company: e.target.value })}
                readOnly={selectedClientId && !isManual}
                disabled={!selectedClientId}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium disabled:opacity-50"
                placeholder="Nombre"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-500" />
                Razón Social
              </label>
              <input
                required
                type="text"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                readOnly={selectedClientId && !isManual}
                disabled={!selectedClientId}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none font-medium disabled:opacity-50"
                placeholder="Razón Social"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Ubicación Actual</label>
            <button
              type="button"
              onClick={captureLocation}
              disabled={isCapturingLocation}
              className={`w-full py-6 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all ${
                location 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-inner' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
              }`}
            >
              {isCapturingLocation ? (
                <>
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Detectando Satélites...</span>
                </>
              ) : location ? (
                <>
                  <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  <span className="text-sm font-bold">{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</span>
                  <span className="text-[10px] font-medium opacity-70">Ubicación Fijada. Tap para refrescar.</span>
                </>
              ) : (
                <>
                  <MapPin className="w-8 h-8 opacity-60" />
                  <span className="text-xs font-bold uppercase tracking-widest">Pinpoint Location</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Evidencia Fotográfica</label>
            <div className="relative h-[116px]">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className={`w-full h-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 transition-all overflow-hidden ${
                photo 
                  ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-inner' 
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100 hover:border-gray-300'
              }`}>
                {photo ? (
                  <div className="relative w-full h-full group/photo">
                    <img src={photo} alt="Vista previa" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 opacity-60" />
                    <span className="text-xs font-bold uppercase tracking-widest">Capturar Foto</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold flex items-start gap-3 border border-red-100">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 px-4 text-gray-600 font-bold hover:bg-gray-100 rounded-2xl transition-all active:scale-[0.98]"
          >
            Regresar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-2 py-4 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            {isSaving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <>
                <Save className="w-6 h-6" />
                Finalizar Registro
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

function AdminPanel({ visits }: { visits: Visit[] }) {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const exportVisits = () => {
    const csvData = visits.map(v => ({
      ID: v.id,
      Fecha: new Date(v.createdAt?.seconds * 1000).toLocaleString(),
      Asesor: v.salesAdvisor,
      NumCliente: v.customerNumber,
      Empresa: v.company,
      RazonSocial: v.businessName,
      Latitud: v.latitude,
      Longitud: v.longitude,
      UsuarioId: v.userId
    }));
    
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Visitas-GeoVisit-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setStatus(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const batch = writeBatch(db);
          let count = 0;

          for (const row of results.data as any[]) {
            const { customerNumber, businessName, company, userId } = row;
            if (customerNumber && businessName && company && userId) {
              const clientRef = doc(collection(db, 'clients'));
              batch.set(clientRef, {
                customerNumber,
                businessName,
                company,
                userId,
                updatedAt: serverTimestamp()
              });
              count++;
            }
          }

          if (count > 0) {
            await batch.commit();
            setStatus({ type: 'success', message: `${count} clientes cargados exitosamente.` });
          } else {
            setStatus({ type: 'error', message: "No se encontraron datos válidos en el CSV. El CSV debe tener columnas: customerNumber, businessName, company, userId" });
          }
        } catch (err) {
          console.error(err);
          setStatus({ type: 'error', message: "Error al cargar el archivo. Verifica el formato." });
        } finally {
          setUploading(false);
          if (e.target) e.target.value = '';
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">Módulo Administrativo</h2>
          <p className="text-sm text-gray-500">Gestión global de registros y base de datos de clientes.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportVisits}
            className="flex-1 sm:flex-initial py-3 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Download className="w-5 h-5" />
            Exportar CSV
          </button>
          <div className="relative flex-1 sm:flex-initial">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer z-10"
              disabled={uploading}
            />
            <button
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98]"
            >
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
              Subir Clientes
            </button>
          </div>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="font-bold text-sm">{status.message}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            Todos los Registros
          </h3>
          <span className="text-xs font-bold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm">
            Total Centralizado
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-[11px] tracking-widest border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Asesor / Fecha</th>
                <th className="px-6 py-4">Cliente / Empresa</th>
                <th className="px-6 py-4">Ubicación</th>
                <th className="px-6 py-4">Evidencia</th>
                <th className="px-6 py-4">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visits.map((visit) => (
                <tr key={visit.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{visit.salesAdvisor}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                      {new Date(visit.createdAt?.seconds * 1000).toLocaleDateString()} {new Date(visit.createdAt?.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-blue-600 truncate max-w-[150px]">{visit.company}</div>
                    <div className="text-xs text-gray-500 truncate max-w-[200px]">{visit.businessName}</div>
                    <div className="text-[10px] text-gray-400 bg-gray-100 w-fit px-1.5 rounded mt-1">#{visit.customerNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <MapPin className="w-3.5 h-3.5 text-gray-300" />
                      {visit.latitude.toFixed(4)}, {visit.longitude.toFixed(4)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {visit.photoBase64 ? (
                      <img src={visit.photoBase64} className="w-10 h-10 rounded-lg object-cover ring-2 ring-gray-100" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-300">
                        <Camera className="w-4 h-4" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`https://www.google.com/maps?q=${visit.latitude},${visit.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center transition-all bg-gray-50"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {visits.length === 0 && (
          <div className="py-20 text-center text-gray-400">
            No hay registros en la base de datos central.
          </div>
        )}
      </div>
    </div>
  );
}


