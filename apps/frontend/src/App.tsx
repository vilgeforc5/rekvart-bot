import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { HealthBadge } from "./components/HealthBadge";
import { Commands } from "./pages/Commands";
import { Consultacya } from "./pages/Consultacya";
import { PortfolioPage } from "./pages/Portfolio";
import { Zamer } from "./pages/Zamer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Commands />} />
              <Route path="/start" element={<Navigate to="/" replace />} />
              <Route path="/zamer" element={<Zamer />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/consultacya" element={<Consultacya />} />
            </Routes>
          </main>
          <HealthBadge />
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
