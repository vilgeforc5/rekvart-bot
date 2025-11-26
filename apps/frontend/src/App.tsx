import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { Header } from "./components/Header";
import { HealthBadge } from "./components/HealthBadge";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./lib/auth-context";
import { AutoMessage } from "./pages/AutoMessage";
import { Calculate } from "./pages/Calculate";
import { Commands } from "./pages/Commands";
import { Consultacya } from "./pages/Consultacya";
import { Dizayn } from "./pages/Dizayn";
import { Login } from "./pages/Login";
import { PortfolioPage } from "./pages/Portfolio";
import { TelegramUsers } from "./pages/TelegramUsers";
import { TopicContent } from "./pages/TopicContent";
import { Zamer } from "./pages/Zamer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Header />
                    <main>
                      <Routes>
                        <Route path="/" element={<Commands />} />
                        <Route
                          path="/start"
                          element={<Navigate to="/" replace />}
                        />
                        <Route path="/calculate" element={<Calculate />} />
                        <Route path="/portfolio" element={<PortfolioPage />} />
                        <Route path="/consultacya" element={<Consultacya />} />
                        <Route path="/zamer" element={<Zamer />} />
                        <Route path="/dizayn" element={<Dizayn />} />
                        <Route
                          path="/topic-content"
                          element={<TopicContent />}
                        />
                        <Route
                          path="/telegram-users"
                          element={<TelegramUsers />}
                        />
                        <Route path="/auto-message" element={<AutoMessage />} />
                      </Routes>
                    </main>
                    <HealthBadge />
                  </ProtectedRoute>
                }
              />
            </Routes>
            <Toaster position="top-right" richColors />
          </div>
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
