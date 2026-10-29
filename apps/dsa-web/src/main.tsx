import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ThemeProvider } from './components/theme/ThemeProvider'

const appModule = import.meta.env.MODE === 'demo' ? import('./DemoApp.tsx') : import('./App.tsx')

void appModule.then(({ default: App }) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </StrictMode>,
  )
})
