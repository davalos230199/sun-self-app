import { useAuth } from '../contexts/AuthContext';
import { Sun } from 'lucide-react'; // Un ícono para el botón

// Eliminamos el CSS anterior ya que la estructura es completamente nueva
// import './Auth.css'; 

export default function Auth() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 to-orange-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
            <div className="w-full max-w-4xl mx-auto">
                
                {/* Cabecera */}
                <header className="text-center mb-12">
                    <h1 className="font-['Patrick_Hand'] text-5xl sm:text-7xl font-bold text-orange-600">
                        Sun Self
                    </h1>
                    <p className="text-lg sm:text-xl mt-2 text-zinc-600">
                        Tu micro-hábito de auto-observación.
                    </p>
                </header>

                {/* Contenido Principal */}
                <main className="bg-white/70 backdrop-blur-md rounded-2xl shadow-lg p-6 sm:p-10 text-zinc-800">
                    
                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-3">Bienvenido a Sun Self</h2>
                        <p className="text-base leading-relaxed">
                            Una herramienta para la auto-observación y el autoconocimiento. Sun Self es un micro-hábito diario diseñado para que te reencuentres con la persona más importante en tu vida: <strong>tú mismo</strong>.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-bold text-zinc-900 mb-3">¿Cómo funciona?</h2>
                        <p className="mb-4">
                            Cada día, la app te invita a responder: <strong>"¿Cómo estás hoy?"</strong> usando tres estados climáticos:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="p-4 bg-amber-100 rounded-lg"><strong>☀️ Soleado:</strong> Te sientes bien, con energía y en armonía.</div>
                            <div className="p-4 bg-slate-200 rounded-lg"><strong>☁️ Nublado:</strong> Sientes cierta incomodidad o confusión.</div>
                            <div className="p-4 bg-sky-200 rounded-lg"><strong>🌧️ Lluvioso:</strong> Te sientes mal o con emociones intensas.</div>
                        </div>
                    </section>

                    <section className="mb-8">
                         <h2 className="text-2xl font-bold text-zinc-900 mb-3">Tu espacio, tus reglas</h2>
                        <ul className="list-disc list-inside space-y-2">
                            <li><strong>Ejemplos de la comunidad:</strong> Inspírate con registros anónimos de otros usuarios.</li>
                            <li><strong>Privacidad total:</strong> Tú decides si quieres guardar tus registros para un análisis más profundo o empezar de cero cada día.</li>
                            <li><strong>Análisis profundo:</strong> Identifica patrones con un calendario climático y desglosa tus registros para encontrar la raíz de tus estados.</li>
                        </ul>
                    </section>

                    <section className="text-center">
                         <h2 className="text-2xl font-bold text-zinc-900 mb-4">¿Listo para empezar a conocerte mejor?</h2>
                         <button
                            onClick={signInWithGoogle}
                            className="bg-gradient-to-r from-orange-500 to-amber-400 text-white font-bold py-3 px-8 rounded-full text-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-in-out flex items-center justify-center mx-auto"
                        >
                            <img src="https://rotulosmatesanz.com/wp-content/uploads/2017/09/2000px-Google_G_Logo.svg_.png" alt="Google logo" className="w-6 h-6 mr-3"/>
                            Iniciar el viaje con Google
                        </button>
                    </section>
                </main>

                <footer className="text-center mt-8 text-zinc-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} Sun Self. Vuelve a habitarte a ti mismo.</p>
                </footer>
            </div>
        </div>
    );
}