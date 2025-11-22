import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { HealthBadge } from "./components/HealthBadge";
import { Calculate } from "./pages/Calculate";
import { Commands } from "./pages/Commands";
import { Consultacya } from "./pages/Consultacya";
import { Dizayn } from "./pages/Dizayn";
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
              <Route path="/calculate" element={<Calculate />} />
              <Route path="/portfolio" element={<PortfolioPage />} />
              <Route path="/consultacya" element={<Consultacya />} />
              <Route path="/zamer" element={<Zamer />} />
              <Route path="/dizayn" element={<Dizayn />} />
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
