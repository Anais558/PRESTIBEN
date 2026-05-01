import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  Lightbulb, 
  Baby, 
  Home as CleaningBucket, 
  Shield, 
  MapPin, 
  Star, 
  Clock, 
  CheckCircle2, 
  Smartphone, 
  Search, 
  User, 
  Bell, 
  ArrowRight,
  Zap,
  Phone,
  MessageCircle,
  Menu,
  X,
  CreditCard,
  Map as MapIcon,
  Navigation
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { cn } from "./lib/utils";

// Types
interface Service {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
  basePrice: number;
}

interface Request {
  id: string;
  clientId: string;
  service: string;
  location: { lat: number; lng: number };
  status: "pending" | "matched" | "in_progress" | "completed";
}

const SERVICES: Service[] = [
  { id: "plumber", name: "Plomberie", icon: Wrench, category: "Dépannage", basePrice: 5000 },
  { id: "electrician", name: "Électricité", icon: Lightbulb, category: "Dépannage", basePrice: 5000 },
  { id: "nanny", name: "Nounou", icon: Baby, category: "Services", basePrice: 15000 },
  { id: "cleaning", name: "Ménage", icon: CleaningBucket, category: "Services", basePrice: 7000 },
];

export default function App() {
  const [role, setRole] = useState<"client" | "provider" | null>(null);
  const [step, setStep] = useState<"onboarding" | "selection" | "matching" | "active" | "provider_dashboard">("onboarding");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [activeRequest, setActiveRequest] = useState<Request | null>(null);
  const [availableRequests, setAvailableRequests] = useState<Request[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Socket
  useEffect(() => {
    const s = io();
    setSocket(s);

    s.on("new_request", (req: Request) => {
      setAvailableRequests(prev => [...prev, req]);
    });

    s.on("request_matched", (req: Request) => {
      setActiveRequest(req);
      setStep("active");
      setIsSearching(false);
    });

    s.on("match_confirmed", (req: Request) => {
      setActiveRequest(req);
      setStep("active");
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const handleJoin = (selectedRole: "client" | "provider") => {
    setRole(selectedRole);
    socket?.emit("join", selectedRole);
    if (selectedRole === "client") {
      setStep("selection");
    } else {
      setStep("provider_dashboard");
    }
  };

  const startRequest = (service: Service) => {
    setSelectedService(service);
    setIsSearching(true);
    setStep("matching");
    
    // Simulate geolocation
    const location = { lat: 6.3654, lng: 2.4183 }; // Cotonou
    socket?.emit("request_service", { service: service.name, location });

    // Auto-match simulation if no real provider joins (for demo)
    // setTimeout(() => {
    //   if (isSearching) {
    //     // In real app, the server handles this
    //   }
    // }, 5000);
  };

  const acceptRequest = (requestId: string) => {
    socket?.emit("accept_request", { requestId });
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-brand-green/20">
      {/* Mobile-first Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-brand-green rounded-lg flex items-center justify-center">
            <Zap className="text-white w-5 h-5 fill-current" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-slate-900 underline decoration-brand-yellow decoration-4 underline-offset-2">Prestiben</span>
        </div>
        <div className="flex items-center gap-4">
          <Bell className="w-5 h-5 text-slate-400" />
          <User className="w-5 h-5 text-slate-400" />
        </div>
      </nav>

      <main className="pt-20 pb-24 px-4 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          {step === "onboarding" && (
            <motion.div 
              key="onboarding"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h1 className="font-display text-4xl font-bold text-slate-900 leading-tight">
                  Un service pro en <span className="text-brand-green">moins de 60s</span>.
                </h1>
                <p className="text-slate-500 text-lg">
                  La plateforme de confiance pour tous vos besoins à domicile au Bénin.
                </p>
              </div>

              <div className="grid gap-4">
                <button 
                  onClick={() => handleJoin("client")}
                  className="group relative bg-white border-2 border-slate-200 p-6 rounded-2xl flex items-center gap-4 hover:border-brand-green transition-all"
                >
                  <div className="w-12 h-12 bg-brand-green/10 rounded-xl flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Je suis un Client</h3>
                    <p className="text-sm text-slate-500">Chercher un prestataire qualifié</p>
                  </div>
                </button>

                <button 
                  onClick={() => handleJoin("provider")}
                  className="group relative bg-white border-2 border-slate-200 p-6 rounded-2xl flex items-center gap-4 hover:border-brand-green transition-all"
                >
                  <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-brand-green group-hover:text-white transition-colors">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-lg">Je suis un Pro</h3>
                    <p className="text-sm text-slate-500">Gérer mes missions et revenus</p>
                  </div>
                  <div className="ml-auto bg-brand-yellow text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                    Certifié
                  </div>
                </button>
              </div>
            </motion.div>
          )}

          {step === "selection" && (
            <motion.div 
              key="selection"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="De quel service avez-vous besoin ?" 
                  className="w-full bg-white border border-slate-200 py-4 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-green"
                />
              </div>

              <div className="space-y-4">
                <h2 className="font-display font-bold text-xl">Dépannages Urgents</h2>
                <div className="grid grid-cols-2 gap-4">
                  {SERVICES.map((s) => (
                    <button 
                      key={s.id}
                      onClick={() => startRequest(s)}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left space-y-3"
                    >
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-brand-green">
                        <s.icon className="w-6 h-6" />
                      </div>
                      <h3 className="font-bold text-sm">{s.name}</h3>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">{s.category}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-brand-green/5 p-4 rounded-2xl border border-brand-green/10 flex items-center gap-3">
                <div className="bg-brand-green text-white p-2 rounded-full">
                  <Shield className="w-4 h-4" />
                </div>
                <p className="text-xs text-brand-green font-medium">
                  Tous nos prestataires sont vérifiés et assurés.
                </p>
              </div>
            </motion.div>
          )}

          {step === "matching" && (
            <motion.div 
              key="matching"
              className="flex flex-col items-center justify-center py-12 space-y-8 text-center"
            >
              <div className="relative">
                <div className="w-48 h-48 rounded-full border-4 border-slate-100 flex items-center justify-center relative overflow-hidden">
                  <motion.div 
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-brand-green rounded-full"
                  />
                  <div className="relative z-10 w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center">
                    {selectedService && <selectedService.icon className="w-10 h-10 text-brand-green" />}
                  </div>
                </div>
                <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute -top-4 left-1/2 -translate-x-1/2 w-[110%] h-[110%] border-2 border-dashed border-brand-green/30 rounded-full"
                />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Recherche en cours...</h2>
                <p className="text-slate-500">Nous trouvons le meilleur <span className="text-brand-green font-bold">{selectedService?.name}</span> à proximité de vous.</p>
                <div className="flex items-center justify-center gap-2 text-slate-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">Cotonou, Fidjrossè</span>
                </div>
              </div>

              <button 
                onClick={() => setStep("selection")}
                className="text-slate-400 font-medium hover:text-red-500 transition-colors"
              >
                Annuler la demande
              </button>
            </motion.div>
          )}

          {step === "active" && activeRequest && (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Match trouvé !</h2>
                    <p className="text-slate-500">Ibrahim est en route.</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border-2 border-brand-green">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Ibrahim" alt="Provider" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-6">
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center text-brand-yellow">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="font-bold ml-1 text-slate-900">4.9</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Note</p>
                  </div>
                  <div className="text-center space-y-1 border-x border-slate-100">
                    <div className="flex items-center justify-center text-brand-green font-bold text-slate-900">
                      <Clock className="w-4 h-4 mr-1" />
                      12 min
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Arrivée</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center font-bold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-blue-500 mr-1" />
                      Pro
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Status</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 bg-brand-green text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                    <Phone className="w-5 h-5 fill-current" />
                    Appeler
                  </button>
                  <button className="flex-1 bg-slate-100 text-slate-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Message
                  </button>
                </div>
              </div>

              {/* Fake Map */}
              <div className="h-64 bg-slate-200 rounded-3xl relative overflow-hidden flex items-center justify-center border-4 border-white shadow-lg overflow-hidden">
                <MapIcon className="absolute inset-0 w-full h-full text-slate-300 opacity-50" />
                <Navigation className="w-10 h-10 text-brand-green animate-pulse" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg flex items-center gap-2">
                  <MapPin className="text-red-500 w-4 h-4" />
                  <span className="text-xs font-medium truncate">Fidjrossè Calvaire - Rue 402</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === "provider_dashboard" && (
            <motion.div 
              key="provider_dashboard"
              className="space-y-6"
            >
              <div className="bg-brand-green p-6 rounded-3xl text-white space-y-4 shadow-lg shadow-brand-green/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium opacity-80">Revenu aujourd'hui</span>
                  <div className="bg-white/20 px-2 py-1 rounded text-[10px] font-bold">+12%</div>
                </div>
                <h2 className="text-4xl font-bold">24,500 FCFA</h2>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  <span className="w-2 h-2 rounded-full bg-brand-yellow animate-pulse" />
                  En ligne • Prêt pour une mission
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Missions Disponibles ({availableRequests.length})</h3>
                  <span className="text-brand-green text-sm font-bold">Voir tout</span>
                </div>

                <div className="space-y-4">
                  {availableRequests.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 text-center space-y-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <p className="text-slate-400 text-sm">En attente de demandes...</p>
                    </div>
                  ) : (
                    availableRequests.map(req => (
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={req.id}
                        className="bg-white p-4 rounded-2xl border-2 border-brand-green border-dashed space-y-4"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-brand-green">
                              <Wrench className="w-6 h-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">{req.service}</h4>
                              <p className="text-xs text-slate-500">À 2.4 km de vous</p>
                            </div>
                          </div>
                          <span className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-2 py-1 rounded-full">
                            NEW
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => acceptRequest(req.id)}
                            className="flex-1 bg-brand-green text-white font-bold py-3 rounded-xl text-sm"
                          >
                            Accepter (5,000 F)
                          </button>
                          <button className="flex-1 bg-slate-100 text-slate-400 font-bold py-3 rounded-xl text-sm">
                            Refuser
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      {(role === "client" || role === "provider") && (
        <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 px-8 py-4 flex justify-between items-center z-50">
          <div className="flex flex-col items-center gap-1 text-brand-green">
             <Smartphone className="w-6 h-6" />
             <span className="text-[10px] font-bold">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
             <MapIcon className="w-6 h-6" />
             <span className="text-[10px] font-bold">Missions</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
             <CreditCard className="w-6 h-6" />
             <span className="text-[10px] font-bold">Portefeuille</span>
          </div>
          <div className="flex flex-col items-center gap-1 text-slate-400">
             <User className="w-6 h-6" />
             <span className="text-[10px] font-bold">Profil</span>
          </div>
        </div>
      )}
    </div>
  );
}

