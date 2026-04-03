
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PageProvider } from "@/contexts/PageContext";
import { AccessibilityProvider } from "@/contexts/AccessibilityContext";
import ErrorBoundary from "@/components/layout/ErrorBoundary";
import CookieConsent from "@/components/compliance/CookieConsent";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";
import { trackPageView } from "@/lib/analytics";

// Pages
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MyProducts from "./pages/MyProducts";
import Documentation from "./pages/Documentation";
import NotFound from "./pages/NotFound";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Cookies from "./pages/Cookies";
import Pricing from "./pages/Pricing";
import Features from "./pages/Features";
import About from "./pages/About";
import Help from "./pages/Help";
import PrivacySettings from "./pages/PrivacySettings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import PublicPage from "./pages/PublicPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient();

// Component to track page views on route changes
function PageViewTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AccessibilityProvider>
        <ThemeProvider>
          <AuthProvider>
            <PageProvider>
              <ProductProvider>
                <TooltipProvider>
                  <Toaster />
                  <BrowserRouter>
                  <PageViewTracker />
                  <OnboardingWizard />
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/my-products" element={
                  <ProtectedRoute>
                    <MyProducts />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
                <Route path="/documentation" element={<Documentation />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/privacy-settings" element={<PrivacySettings />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/terms-of-service" element={<Terms />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/cookies" element={<Cookies />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/features" element={<Features />} />
                <Route path="/about-us" element={<About />} />
                <Route path="/help-center" element={<Help />} />
                <Route path="/@:username" element={<PublicPage />} />
                <Route path="/@:username/:collectionSlug" element={<PublicPage />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <CookieConsent />
              </BrowserRouter>
            </TooltipProvider>
          </ProductProvider>
        </PageProvider>
      </AuthProvider>
    </ThemeProvider>
    </AccessibilityProvider>
  </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
