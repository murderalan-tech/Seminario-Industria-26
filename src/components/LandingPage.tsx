import React, { useState } from 'react';
import { Calendar, MapPin, Utensils, CheckCircle2, ExternalLink, Mail, Phone, Globe, Flame, Loader2, Sparkles } from 'lucide-react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import logo from '../assets/logo.png';
import map from '../assets/map.png';
import parrillada from '../assets/parrillada.jpg';
import hero from '../assets/hero.jpg';
import mobilLogo from '../assets/mobil_logo.png';

interface LandingPageProps {
  onNavigateToTracker: () => void;
}

export default function LandingPage({ onNavigateToTracker }: LandingPageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    jobTitle: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      // Save to Firebase firestore
      await addDoc(collection(db, 'seminar_registrations'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setSuccess(true);
      setFormData({ fullName: '', company: '', email: '', phone: '', jobTitle: '' });
    } catch (err) {
      console.error('Error registering for seminar:', err);
      setError('Ocurrió un error al registrar tu asistencia. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-surface text-on-surface font-sans overflow-x-hidden min-h-screen">
      {/* TopNavBar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-md border-b-2 border-outline-variant shadow-sm">
        <div className="flex justify-between items-center h-20 px-4 md:px-16 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Alchisa Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6">
              <a className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm" href="#seminario">Seminario</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm" href="#ubicacion">Ubicación</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm" href="#parrillada">Parrillada</a>
              <a className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm" href="#registro">Registro</a>
            </div>
            <a className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 font-bold uppercase tracking-wider text-xs rounded-lg active:scale-95 transition-all shadow-md" href="#registro">
              Inscribirse
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] flex items-center overflow-hidden" id="seminario">
          <div className="absolute inset-0 z-0">
            <img 
              alt="Seminario Mobil Industrial" 
              className="w-full h-full object-cover brightness-50" 
              src={hero} 
            />
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-12 gap-8 py-20">
            <div className="md:col-span-8 flex flex-col justify-center gap-6 text-left">
              <div className="inline-block py-1 px-3 bg-secondary text-white font-mono text-xs font-bold self-start rounded">
                EVENTO TÉCNICO EXCLUSIVO
              </div>
              <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight">
                Maximizando la Confiabilidad de los Sistemas Hidráulicos
              </h1>
              <p className="text-lg md:text-xl text-primary-fixed max-w-2xl font-light">
                Principales causas de falla y estrategias de mitigación. Únete a los expertos de Mobil para elevar la efficiency operativa de tu planta.
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <a className="bg-primary-container text-white px-8 py-4 font-bold text-sm rounded industrial-shadow hover:brightness-110 transition-all uppercase tracking-wider" href="#registro">
                  REGISTRARSE AHORA
                </a>
                <a className="border-2 border-white text-white px-8 py-4 font-bold text-sm rounded hover:bg-white/10 transition-all uppercase tracking-wider" href="#detalles">
                  VER DETALLES
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Event Quick Info */}
        <section className="bg-surface-container-low py-16" id="detalles">
          <div className="max-w-7xl mx-auto px-4 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Info Card 1 */}
            <div className="bg-surface border border-outline-variant p-8 accent-border industrial-shadow rounded-lg text-left">
              <div className="flex items-center gap-4 mb-4 text-primary">
                <Calendar className="w-10 h-10" />
                <h3 className="font-display text-xl font-bold">Fecha</h3>
              </div>
              <p className="text-lg text-on-surface font-bold">Jueves 23 de Julio 2026</p>
              <p className="text-on-surface-variant mt-1 text-sm">Recepción: 18:30 hrs.</p>
            </div>
            {/* Info Card 2 */}
            <div className="bg-surface border border-outline-variant p-8 accent-border industrial-shadow rounded-lg text-left">
              <div className="flex items-center gap-4 mb-4 text-primary">
                <MapPin className="w-10 h-10" />
                <h3 className="font-display text-xl font-bold">Lugar</h3>
              </div>
              <p className="text-lg text-on-surface font-bold">D'Mariel</p>
              <p className="text-on-surface-variant mt-1 text-sm">Blvd. Independencia 559, Zaragoza, Juárez, Chih.</p>
            </div>
            {/* Info Card 3 */}
            <div className="bg-surface border border-outline-variant p-8 accent-border-red industrial-shadow rounded-lg text-left">
              <div className="flex items-center gap-4 mb-4 text-secondary">
                <Utensils className="w-10 h-10" />
                <h3 className="font-display text-xl font-bold">After Event</h3>
              </div>
              <p className="text-lg text-on-surface font-bold">Parrillada Mobil</p>
              <p className="text-on-surface-variant mt-1 text-sm">Networking & "Parrillando con la Raza".</p>
            </div>
          </div>
        </section>

        {/* Registration Form & Content Section */}
        <section className="py-24 max-w-7xl mx-auto px-4 md:px-16" id="registro">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 text-left">
            {/* Content */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-3xl font-display font-bold text-primary mb-4">Soluciones de Clase Mundial. Sin importar el reto.</h2>
                <div className="w-24 h-1 bg-secondary mb-6"></div>
                <p className="text-lg text-on-surface-variant leading-relaxed">
                  En este seminario técnico intensivo, abordaremos los desafíos más críticos que enfrentan los sistemas hidráulicos modernos. Aprenda de ingenieros expertos cómo prevenir el tiempo de inactividad no planificado y optimizar el rendimiento de sus lubricantes Mobil.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-display font-semibold text-primary">Lo que aprenderás:</h3>
                <ul className="zebra-list border border-outline-variant rounded-lg overflow-hidden divide-y divide-outline-variant">
                  <li className="p-4 flex gap-4 items-start bg-white">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-on-surface">Análisis de Fallas Comunes</p>
                      <p className="text-on-surface-variant text-sm mt-0.5">Identificación de contaminantes y degradación térmica.</p>
                    </div>
                  </li>
                  <li className="p-4 flex gap-4 items-start bg-gray-50/50">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-on-surface">Estrategias de Mitigación</p>
                      <p className="text-on-surface-variant text-sm mt-0.5">Implementación de programas de mantenimiento predictivo.</p>
                    </div>
                  </li>
                  <li className="p-4 flex gap-4 items-start bg-white">
                    <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-on-surface">Tecnología Mobil SHC™</p>
                      <p className="text-on-surface-variant text-sm mt-0.5">Beneficios de la lubricación sintética de alto rendimiento.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Registration Form */}
            <div className="lg:col-span-5">
              <div className="bg-surface border-2 border-primary p-8 industrial-shadow rounded-lg sticky top-28">
                <h3 className="text-2xl font-display font-bold text-primary mb-6">Asegura tu lugar</h3>
                
                {success ? (
                  <div className="py-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-emerald-800">¡Registro Exitoso!</h4>
                    <p className="text-sm text-gray-600">Tu lugar ha sido reservado. Te enviaremos un correo de confirmación con los detalles del evento.</p>
                    <button 
                      onClick={() => setSuccess(false)}
                      className="mt-4 text-sm font-semibold text-primary hover:underline"
                    >
                      Registrar a otra persona
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-semibold">NOMBRE COMPLETO</label>
                      <input 
                        required
                        type="text"
                        value={formData.fullName}
                        onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 transition-colors outline-none font-medium text-sm" 
                        placeholder="Ej. Juan Pérez" 
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-semibold">EMPRESA</label>
                      <input 
                        required
                        type="text"
                        value={formData.company}
                        onChange={e => setFormData({ ...formData, company: e.target.value })}
                        className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 transition-colors outline-none font-medium text-sm" 
                        placeholder="Tu organización" 
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-semibold">PUESTO</label>
                      <input 
                        required
                        type="text"
                        value={formData.jobTitle}
                        onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                        className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 transition-colors outline-none font-medium text-sm" 
                        placeholder="Ej. Gerente de Mantenimiento" 
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-semibold">CORREO</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 transition-colors outline-none font-medium text-sm" 
                          placeholder="email@empresa.com" 
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-on-surface-variant mb-2 font-semibold">TELÉFONO</label>
                        <input 
                          required
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-surface-container-low border-b-2 border-outline focus:border-primary focus:ring-0 px-4 py-3 transition-colors outline-none font-medium text-sm" 
                          placeholder="10 dígitos" 
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded border border-red-200">
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-primary py-4 text-white font-bold text-lg rounded-lg active:scale-[0.98] transition-all shadow-md hover:bg-primary-container flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : (
                        <span>CONFIRMAR ASISTENCIA</span>
                      )}
                    </button>
                    <p className="text-center font-mono text-[10px] text-outline">Cupo Limitado</p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Special Guest / Parrillada Section */}
        <section className="bg-primary py-24 text-white overflow-hidden relative" id="parrillada">
          <div className="max-w-7xl mx-auto px-4 md:px-16 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-16 text-left">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-secondary flex items-center justify-center bg-white shadow-md">
                    <Flame className="w-8 h-8 text-secondary" />
                  </div>
                  <span className="font-display text-xl uppercase tracking-wider font-extrabold text-secondary-fixed">Invitados Especiales</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white leading-tight">
                  ¡Te esperamos! Parrillada Mobil™
                </h2>
                <p className="text-lg text-primary-fixed font-light leading-relaxed">
                  Después de la sesión técnica, relájate y conecta con otros líderes de la industria en nuestra exclusiva convivencia. Disfruta de una experiencia gastronómica única con <strong>"Parrillando con la Raza"</strong>.
                </p>
                <div className="flex flex-wrap gap-8 items-center pt-4">
                  <img 
                    className="h-20 w-auto grayscale invert brightness-200" 
                    alt="Logo de Parrillando con la Raza"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu_EBzYZbFmujlJgAw7a4UNBGLZLVNT7I5vcfS5qZWei33Xk8pxt6KJHWNiFhpbIsp-tWRdo1Rta2KuaA1gtmRFjRivG_8JmxIiWGdRGKFL16prpUettfTShVDel1gAkgYp9ygfrS4Ns0zZAo3kFJrgz9MXN6WP_NFD5HjJiBEUbVxWZM8II5SCf_iDqzmc1Bea4GoO7nrN6bx3LotoQXTjL_ipz4BULPDRwjUSo2gcszUJuiH4eg2oRpzQRig8HKnhIfvJyzDwgg" 
                  />
                  <div className="border-l-2 border-secondary-fixed pl-6">
                    <p className="font-display text-lg font-bold">Networking de Alto Impacto</p>
                    <p className="font-mono text-xs text-outline-variant">Intercambio de mejores prácticas industriales</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 w-full max-w-lg aspect-square">
                <div className="w-full h-full rounded-2xl overflow-hidden industrial-shadow border-4 border-primary-fixed">
                  <img 
                    className="w-full h-full object-cover" 
                    alt="Parrillada Networking"
                    src={parrillada} 
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="py-24 bg-surface" id="ubicacion">
          <div className="max-w-7xl mx-auto px-4 md:px-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-left">
            <div className="space-y-6">
              <h2 className="text-3xl font-display font-bold text-primary">Sede del Evento</h2>
              <div className="p-8 border border-outline-variant bg-surface-container-lowest industrial-shadow accent-border rounded-lg">
                <p className="font-display text-2xl font-bold mb-2 text-primary">Salón D'Mariel</p>
                <p className="text-base flex items-start gap-2 text-on-surface-variant font-medium">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  Blvd. Independencia 559, Zaragoza, Ciudad Juárez, Chih.
                </p>
                <div className="mt-8 pt-8 border-t border-outline-variant flex justify-between items-center">
                  <div>
                    <p className="font-mono text-[10px] text-on-surface-variant">ESTACIONAMIENTO</p>
                    <p className="font-bold text-sm">Privado & Gratuito</p>
                  </div>
                  <a 
                    className="text-primary font-bold hover:underline flex items-center gap-1.5 text-sm" 
                    href="https://maps.app.goo.gl/n2ERLuEw3WNjy9VW8"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Abrir en Google Maps</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
            <div className="h-[450px] w-full rounded-xl overflow-hidden industrial-shadow border border-outline-variant">
              <img 
                className="w-full h-full object-cover" 
                alt="Mapa Sede" 
                src={map} 
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest border-t border-outline-variant">
        <div className="flex flex-col md:flex-row justify-between items-center py-12 px-4 md:px-16 max-w-7xl mx-auto gap-8 text-left md:text-center">
          <div className="flex flex-col gap-2 items-start">
            <img src={mobilLogo} alt="Mobil Logo" className="h-28 w-auto object-contain" />
          </div>
          <div className="text-left md:text-right space-y-2">
            <div className="flex justify-start md:justify-end gap-4">
              <a href="mailto:contacto@alchisa.com" className="text-primary hover:scale-110 transition-transform" title="Enviar correo">
                <Mail className="w-5 h-5" />
              </a>
              <a href="tel:6141858500" className="text-primary hover:scale-110 transition-transform" title="Llamar">
                <Phone className="w-5 h-5" />
              </a>
              <a href="https://www.alchisa.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:scale-110 transition-transform" title="Visitar Sitio Web">
                <Globe className="w-5 h-5" />
              </a>
            </div>
            <p className="font-mono text-[10px] text-on-surface-variant">
              © 2026 Alchisa Distribuidor Autorizado Mobil. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/526142472089" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-[#25d366] hover:bg-[#20ba5a] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer" 
        title="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.859-4.42 9.863-9.864.002-2.637-1.023-5.117-2.884-6.98-1.862-1.862-4.343-2.885-6.984-2.887-5.441 0-9.864 4.42-9.869 9.865-.002 1.798.482 3.55 1.398 5.093l-.952 3.473 3.566-.936zm11.367-7.312c-.29-.145-1.713-.846-1.978-.942-.266-.097-.459-.145-.653.146-.193.29-.749.942-.919 1.134-.17.194-.341.217-.63.073-.29-.145-1.229-.453-2.34-1.444-.864-.772-1.448-1.725-1.618-2.016-.17-.29-.018-.447.127-.59.13-.13.29-.34.435-.508.145-.17.193-.29.29-.483.097-.193.048-.363-.024-.508-.073-.145-.653-1.573-.895-2.153-.235-.567-.475-.49-.653-.49-.17 0-.363-.016-.557-.016-.193 0-.507.073-.772.363-.266.29-1.015.992-1.015 2.417s1.039 2.798 1.184 2.993c.145.193 2.044 3.12 4.952 4.378.692.3 1.232.478 1.652.612.695.221 1.328.19 1.828.115.556-.08 1.713-.7 1.953-1.378.24-.678.24-1.258.17-1.378-.073-.12-.266-.193-.556-.338z"/>
        </svg>
      </a>
    </div>
  );
}
