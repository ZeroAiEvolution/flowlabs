import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminProvider } from "./contexts/AdminContext";
import CustomCursor from "./components/CustomCursor";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Team from "./pages/Team";
import Content from "./pages/Content";
import Students from "./pages/Students";
import Professionals from "./pages/Professionals";
import About from "./pages/About";
import Profile from "./pages/Profile";
import DirectoryProfile from "./pages/DirectoryProfile";
import NotFound from "./pages/NotFound";
import CategoryPage from "./pages/CategoryPage";
import Help from "./pages/Help";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import MobileCover from "./components/MobileCover";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// Admin pages
import NetworkPage from './pages/network/NetworkPage';
import NetworkRequests from './pages/network/NetworkRequests';
import MessagesPage from './pages/network/MessagesPage';
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminRoles from "./pages/admin/AdminRoles";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminPartners from "./pages/admin/AdminPartners";
import AdminOpportunities from "./pages/admin/AdminOpportunities";
import AdminTeam from "./pages/admin/AdminTeam";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminHelpRequests from "./pages/admin/AdminHelpRequests";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AdminProvider>
        <TooltipProvider>
          <MobileCover />
          <CustomCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Unauthenticated */}
              <Route path="/" element={<Auth />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* Protected Application Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/team" element={<Team />} />
                <Route path="/content" element={<Content />} />
                <Route path="/students" element={<Students />} />
                <Route path="/professionals" element={<Professionals />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/directory/:id" element={<DirectoryProfile />} />
                <Route path="/explore/:category" element={<CategoryPage />} />
                <Route path="/network" element={<NetworkPage />} />
                <Route path="/network/requests" element={<NetworkRequests />} />
                <Route path="/messages" element={<Navigate to="/network?tab=messages" replace />} />
                <Route path="/about" element={<About />} />
                <Route path="/help" element={<Help />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="content" element={<AdminContent />} />
                <Route path="projects" element={<AdminProjects />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="partners" element={<AdminPartners />} />
                <Route path="opportunities" element={<AdminOpportunities />} />
                <Route path="team" element={<AdminTeam />} />
                <Route path="help-requests" element={<AdminHelpRequests />} />
              </Route>

              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AdminProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
