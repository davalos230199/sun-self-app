/*import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
*/


// frontend/src/App.jsx

import {
  createBrowserRouter,
  RouterProvider,
  Navigate // <-- 1. Importa Navigate
} from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';

const router = createBrowserRouter([
  {
    // 2. Ruta raíz que redirige a /login
    path: '/',
    element: <Navigate to="/login" replace />
  },
  {
    // 3. Ruta de login explícita
    path: '/login',
    element: <Login />
  },
  {
    path: '/home',
    element: <Home />
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