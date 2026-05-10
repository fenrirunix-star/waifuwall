import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "@/src/components/Navbar";
import { Petals } from "@/src/components/Petals";
import { Home } from "@/src/pages/Home";
import { AdminPanel } from "@/src/pages/AdminPanel";
import { Categories } from "@/src/pages/Categories";
import { PremiumPlans } from "@/src/pages/PremiumPlans";
import { Trending } from "@/src/pages/Trending";
import { Register } from "@/src/pages/Register";
import { Login } from "@/src/pages/Login";
import { WallpaperDetail } from "@/src/pages/WallpaperDetail";
import { CategoryPage } from "@/src/pages/CategoryPage";
import { Profile } from "@/src/pages/Profile";
import { HelpCenter } from "@/src/pages/HelpCenter";
import { PrivacyPolicy } from "@/src/pages/PrivacyPolicy";
import { Terms } from "@/src/pages/Terms";
import { Cookies } from "@/src/pages/Cookies";
import { Contact } from "@/src/pages/Contact";
import { About } from "@/src/pages/About";
import { NotFound } from "@/src/pages/NotFound";
import { Offline } from "@/src/pages/Offline";
import { motion, AnimatePresence } from "motion/react";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Footer } from "./components/Footer";
import { useOnlineStatus } from "@/src/hooks/useOnlineStatus";

// Placeholder pages
// Profile removed and moved to separate file

export default function App() {
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // AdSense is now loaded in index.html for better persistence
  }, []);

  if (!isOnline) {
    return <Offline />;
  }

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative">
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-10 left-10 w-4 h-4 bg-pink-300/30 rounded-full blur-sm"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-purple-300/20 rounded-full blur-sm"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-pink-400/20 rounded-full blur-xs"></div>
          <div className="absolute top-1/2 right-1/3 w-5 h-5 bg-lavender-200/40 rounded-full blur-sm"></div>
        </div>
        <Petals />
        <Navbar />
        
        <main className="flex-grow z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={
                <PageWrapper>
                  <Home />
                </PageWrapper>
              } />
              <Route path="/categories" element={
                <PageWrapper>
                  <Categories />
                </PageWrapper>
              } />
              <Route path="/wallpaper/:wallpaperId" element={
                <PageWrapper>
                  <WallpaperDetail />
                </PageWrapper>
              } />
              <Route path="/category/:categoryId" element={
                <PageWrapper>
                  <CategoryPage />
                </PageWrapper>
              } />
              <Route path="/premium" element={
                <PageWrapper>
                  <PremiumPlans />
                </PageWrapper>
              } />
              <Route path="/login" element={
                <PageWrapper>
                  <Login />
                </PageWrapper>
              } />
              <Route path="/register" element={
                <PageWrapper>
                  <Register />
                </PageWrapper>
              } />
              <Route path="/trending" element={
                <PageWrapper>
                  <Trending />
                </PageWrapper>
              } />
              <Route path="/profile" element={
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              } />
              <Route path="/admin" element={
                <PageWrapper>
                  <ProtectedRoute adminOnly>
                    <AdminPanel />
                  </ProtectedRoute>
                </PageWrapper>
              } />
              <Route path="/help" element={
                <PageWrapper>
                  <HelpCenter />
                </PageWrapper>
              } />
              <Route path="/privacy" element={
                <PageWrapper>
                  <PrivacyPolicy />
                </PageWrapper>
              } />
              <Route path="/terms" element={
                <PageWrapper>
                  <Terms />
                </PageWrapper>
              } />
              <Route path="/cookies" element={
                <PageWrapper>
                  <Cookies />
                </PageWrapper>
              } />
              <Route path="/about" element={
                <PageWrapper>
                  <About />
                </PageWrapper>
              } />
              <Route path="/contact" element={
                <PageWrapper>
                  <Contact />
                </PageWrapper>
              } />
              <Route path="*" element={
                <PageWrapper>
                  <NotFound />
                </PageWrapper>
              } />
            </Routes>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </Router>
    </AuthProvider>
  );
}

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
