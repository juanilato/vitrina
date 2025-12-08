'use client';

import Link from 'next/link';
import Image from 'next/image'; // Importamos Image para optimización
import { Boton } from '@/src/compartidos/ui/Boton/Boton';
import { Encabezado } from '@/src/compartidos/diseño/Encabezado';
import CircularGallery from '@/src/compartidos/ui/CircularGallery/CircularGallery';
import ScrollFloat from '@/src/compartidos/ui/ScrollFloat/ScrollFloat';
import { Stethoscope, Store, Heart, PawPrint, ArrowRight } from 'lucide-react'; // Iconos nuevos

export default function Home() {

  // Datos para la galería
    const categoriasPetShop = [
    { image: '/images/land/16004.jpg', text: '' },
    { image: '/images/land/cerca-de-veterinario-cuidando-perro.jpg', text: '' },
    { image: '/images/land/1625.jpg', text: '' },
    { image: '/images/land/vision-de-gatos-y-perros-siendo-amigos.jpg', text: '' },
    { image: '/images/land/vista-de-gatos-y-perros-mostrando-amistad.jpg', text: '' },
    ];

    return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
        
      {/* El encabezado flotante */}
        <div className="absolute w-full z-50">
            <Encabezado />
    </div>

      {/* --- SECCIÓN 1: HERO SPLIT-SCREEN (NUEVO DISEÑO) --- */}
    <main className="relative flex flex-col md:flex-row min-h-screen">
        
        {/* --- LADO IZQUIERDO: PROFESIONALES (B2B) --- */}
        <div className="group relative flex-1 flex flex-col justify-center items-center md:items-start px-6 md:px-20 py-32 overflow-hidden bg-slate-900 text-white transition-all duration-700 ease-out hover:flex-[1.2]">
            {/* Imagen de Fondo con Overlay */}
            <div className="absolute inset-0 z-0 opacity-40 group-hover:scale-105 transition-transform duration-1000">
                {/* REEMPLAZA src con tu imagen de veterinario real */}
                <Image 
                    src="/images/land/cerca-de-veterinario-cuidando-perro.jpg" 
                    alt="Veterinaria Profesional" 
                    fill 
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/80 mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-lg text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-sm font-bold mb-6 border border-blue-500/30">
                    <Store size={16} /> SOLUCIONES PARA EMPRESAS
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
                    Potencia tu <br/> <span className="text-blue-400">Veterinaria</span>.
                </h1>
                <p className="text-lg text-slate-300 mb-8 font-medium">
                    Gestión integral, historias clínicas en la nube y más clientes para tu negocio.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link href="/auth/register?role=vet">
                        <button className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-bold transition-all shadow-lg shadow-blue-900/50 flex items-center gap-2">
                            Soy Veterinaria <ArrowRight size={18} />
                        </button>
                    </Link>
                    <Link href="/auth/register?role=shop">
                        <button className="bg-transparent border-2 border-slate-600 hover:border-white text-white px-8 py-4 rounded-full font-bold transition-all">
                            Soy Pet Shop
                        </button>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- LADO DERECHO: DUEÑOS (B2C) --- */}
        <div className="group relative flex-1 flex flex-col justify-center items-center md:items-end px-6 md:px-20 py-32 overflow-hidden bg-orange-50 text-slate-900 transition-all duration-700 ease-out hover:flex-[1.2]">
             {/* Imagen de Fondo con Overlay */}
            <div className="absolute inset-0 z-0 opacity-60 group-hover:scale-105 transition-transform duration-1000">
                {/* REEMPLAZA src con tu imagen de dueño/perro real */}
                <Image 
                    src="/images/land/vision-de-gatos-y-perros-siendo-amigos.jpg" 
                    alt="Dueño feliz" 
                    fill 
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-orange-100/60 mix-blend-multiply" />
            </div>

            <div className="relative z-10 max-w-lg text-center md:text-right">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-200/50 text-orange-700 text-sm font-bold mb-6 border border-orange-300 ml-auto">
                    <Heart size={16} /> PARA DUEÑOS
                </div>
                <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4 text-slate-800">
                    Amor y <br/> <span className="text-orange-500">Cuidado</span>.
                </h1>
                <p className="text-lg text-slate-600 mb-8 font-medium">
                    Agenda turnos, lleva su historial médico y encuentra los mejores productos cerca de ti.
                </p>
                <div className="flex justify-center md:justify-end">
                    <Link href="/auth/register?role=client">
                        <button className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl hover:scale-105 flex items-center gap-2">
                            Soy Dueño de Mascota <PawPrint size={18} />
                        </button>
                    </Link>
                </div>
            </div>
        </div>

        {/* --- CONECTOR CENTRAL (LOGO) --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-100 p-4">
                 {/* Aquí iría tu Logo real */}
                 <span className="text-3xl">🐩</span>
            </div>
        </div>
      </main>

      {/* --- SECCIÓN 2: CÓMO FUNCIONA (EL UNIFICADOR) --- */}
      <section className="py-24 bg-white relative z-10">
          <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16 max-w-3xl mx-auto">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-800 mb-6">
                      Conectamos el cuidado animal <br/> en un solo lugar.
                  </h2>
                  <p className="text-xl text-slate-500">
                      Una plataforma integral donde profesionales y dueños conviven para mejorar la calidad de vida de las mascotas.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                  {/* Card 1: Veterinarias */}
                    <div className="p-8 rounded-[2rem] bg-slate-50 border border-slate-100 hover:shadow-xl transition-shadow text-center md:text-left">
                        <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto md:mx-0">
                            <Stethoscope size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Para Veterinarias</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Digitaliza tu clínica. Historias clínicas en la nube, recordatorios automáticos y agenda inteligente.
                        </p>
                    </div>

                  {/* Card 2: Pet Shops */}
                    <div className="p-8 rounded-[2rem] bg-orange-50/50 border border-orange-100 hover:shadow-xl transition-shadow text-center md:text-left">
                        <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 mx-auto md:mx-0">
                            <Store size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Para Pet Shops</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Gestiona tu stock en tiempo real y conéctate con miles de clientes locales que buscan tus productos.
                        </p>
                    </div>

                  {/* Card 3: Dueños */}
                    <div className="p-8 rounded-[2rem] bg-pink-50/50 border border-pink-100 hover:shadow-xl transition-shadow text-center md:text-left">
                        <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center text-pink-600 mb-6 mx-auto md:mx-0">
                            <Heart size={32} />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800 mb-3">Para Dueños</h3>
                        <p className="text-slate-500 leading-relaxed">
                            Tranquilidad total. Toda la salud y necesidades de tu mascota en tu bolsillo, accesible 24/7.
                        </p>
                    </div>
                </div>
            </div>
        </section>

      {/* --- SECCIÓN 3: GALERÍA CIRCULAR  --- */}
    <section className="bg-slate-50 py-20 relative z-10 border-t border-slate-200">
        <div className="text-center mb-10 px-4">
            <h2 className="text-3xl md:text-5xl font-black text-gray-800">
                Explora nuestras categorías
            </h2>
            <p className="text-gray-500 mt-2">Arrastra para ver más</p>
        </div>

        <div style={{ height: '600px', position: 'relative' }} className="w-full">
            <CircularGallery 
                items={categoriasPetShop}
                bend={3} 
                textColor="#000000" 
                borderRadius={0.05} 
                font="bold 30px sans-serif" 
            />
        </div>
    </section>

      {/* --- SECCIÓN 4: DATOS IMPACTANTES  --- */}
    <section className="bg-black text-white py-40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <div className="max-w-6xl mx-auto px-6">
            <div className="mb-40">
                <ScrollFloat 
                    animationDuration={1.2}
                    ease="back.out(1.5)"
                    scrollStart="top bottom-=10%"
                    textClassName="text-6xl md:text-8xl font-semibold tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-500"
                >
                    Potencia. Sin límites.
                </ScrollFloat>
                
                <div className="mt-10 max-w-2xl ml-auto border-l border-gray-800 pl-8">
                    <p className="text-2xl md:text-4xl text-gray-400 font-medium leading-relaxed">
                        Deja de usar papel. <span className="text-white">Automatiza tu veterinaria</span> y concéntrate en lo que importa.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
                <div>
                    <div className="mb-4">
                        <ScrollFloat animationDuration={1} scrollStart="top bottom-=15%" textClassName="text-[6rem] md:text-[10rem] font-bold text-primary leading-none">
                            40%
                        </ScrollFloat>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Más Eficiencia.</h3>
                    <p className="text-xl text-gray-500">Reducción de tiempos muertos en tu agenda.</p>
                </div>

                <div className="md:mt-32">
                    <div className="mb-4">
                        <ScrollFloat animationDuration={1} scrollStart="top bottom-=15%" textClassName="text-[6rem] md:text-[10rem] font-bold text-blue-500 leading-none">
                            24/7
                        </ScrollFloat>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">Siempre Abierto.</h3>
                    <p className="text-xl text-gray-500">Reservas y compras incluso mientras duermes.</p>
                </div>

                <div className="md:col-span-2 mt-20 text-center">
                    <ScrollFloat animationDuration={1.5} scrollStart="top bottom-=20%" textClassName="text-4xl md:text-6xl font-black text-white tracking-tight">
                        Gestión. Salud. Futuro.
                    </ScrollFloat>
                    <p className="text-gray-500 mt-6 text-xl">Todo en una sola plataforma segura.</p>
                </div>
            </div>
        </div>
    </section>

      {/* Footer */}
    <footer className="py-10 text-center bg-gray-50 text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Peluquería Mascotas.</p>
    </footer>
    </div>
    );
}