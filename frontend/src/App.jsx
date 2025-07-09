import {
  createBrowserRouter,
  RouterProvider,
  Navigate // <-- 1. Importa Navigate
} from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import LoginScene from './pages/loginscene'; // <-- Importa el nuevo componente
import Tracking from './pages/tracking'; // <-- Importa la nueva página
import Couch from './pages/couch'; // <-- Importa la nueva página del couchIA
import ProtectedRoute from './components/protectedroute'; // <-- 1. Importa el guardián

const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    path: '/login',
    element: <LoginScene />
  },
  {
    // 2. Esta es la ruta "protegida"
    path: '/',
    element: <ProtectedRoute />,
    children: [
      // 3. Todas estas rutas ahora están protegidas por el guardián
      {
        path: '/home',
        element: <Home />
      },
      {
        path: '/tracking',
        element: <Tracking />
      },
      {
        path: '/couch',
        element: <Couch />
      }
    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

































































































/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/