import React from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import './style.css'
import { NotifierProvider } from './components/Notifier'

const queryClient = new QueryClient()

const rootEl = document.getElementById('app')!
const root = createRoot(rootEl)
root.render(
	<QueryClientProvider client={queryClient}>
		<NotifierProvider>
			<App />
		</NotifierProvider>
	</QueryClientProvider>
)
