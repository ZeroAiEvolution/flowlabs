
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderGit2,
  Tags,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
  Image,
  LogOut,
  Handshake,
  Calendar,
  HeartHandshake,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const menuItems = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Banners', path: '/admin/banners', icon: Image },
  { title: 'Users', path: '/admin/users', icon: Users },
  { title: 'Content', path: '/admin/content', icon: FileText },
  { title: 'Projects', path: '/admin/projects', icon: FolderGit2 },
  { title: 'Categories', path: '/admin/categories', icon: Tags },
  { title: 'Partners', path: '/admin/partners', icon: Handshake },
  { title: 'Opportunities', path: '/admin/opportunities', icon: Calendar },
  { title: 'Team', path: '/admin/team', icon: Users },
  { title: 'Help Requests', path: '/admin/help-requests', icon: HeartHandshake },
];

const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  return (
    <aside
      className={cn(
        "h-screen bg-background border-r border-border flex flex-col transition-all duration-300 pointer-events-auto sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        {!collapsed && (
          <h1 className="text-lg font-bold">Admin Panel</h1>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors mb-1",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border space-y-1">
        <Link
          to="/home"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Back to Site</span>}
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors w-full text-left"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
