import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { TooltipProvider } from '@/components/ui/tooltip'
import { queryClient } from '@/lib/query-client'
import { signInAs } from '@/services/auth.service'
import { router } from './router'
import '@/styles/app.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element missing')

// Demo deep link: ?demo-as=<userId> opens the portal as a demo persona (QA and presenting).
const demoAs = new URLSearchParams(window.location.search).get('demo-as')
if (demoAs) await signInAs(demoAs).catch(() => undefined)

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={200}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>,
)
