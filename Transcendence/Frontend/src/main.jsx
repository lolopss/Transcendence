import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Game from './Game.jsx'
import Menu from './Menu.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Game/>
    <Menu/>
  </StrictMode>,
)
