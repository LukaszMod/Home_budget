import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { NotifierProvider } from './components/common/Notifier'

const queryClient = new QueryClient()

const rootEl = document.getElementById('app')!
const root = createRoot(rootEl)
root.render(
	<QueryClientProvider client={queryClient}>
		<NotifierProvider>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</NotifierProvider>
	</QueryClientProvider>
)
