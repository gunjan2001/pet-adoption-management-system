import React from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/_core/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LayoutGrid, Settings, LogOut, Home, Users } from 'lucide-react';

interface AdminHeaderProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ activeTab = 'applications' }) => {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const adminTabs = [
    { id: 'applications', label: 'Applications', icon: Users },
    { id: 'pets', label: 'Manage Pets', icon: LayoutGrid },
  ];

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-accent to-accent/80 text-accent-foreground border-b border-accent/20">
      <div className="container">
        {/* Top Admin Bar */}
        <div className="flex items-center justify-between h-16 py-3">
          {/* Left Section - Logo */}
          <div className="flex items-center gap-3">
            <Link href="/admin">
              <a className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity">
                <div className="w-8 h-8 bg-accent-foreground rounded-lg flex items-center justify-center">
                  <span className="text-accent font-bold">⚙️</span>
                </div>
                <span className="hidden sm:inline">Admin Panel</span>
              </a>
            </Link>
          </div>

          {/* Center Section - Admin Info */}
          <div className="flex items-center gap-3 px-4">
            <Badge variant="secondary" className="bg-accent-foreground/20 text-accent-foreground border-accent-foreground/30">
              Admin
            </Badge>
            <span className="text-sm font-medium hidden md:inline">
              {user?.name || user?.email}
            </span>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center gap-2">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-accent-foreground hover:bg-accent-foreground/20"
            >
              <Link href="/">
                <a className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  <span className="hidden sm:inline">Home</span>
                </a>
              </Link>
            </Button>

            <Button
              onClick={handleLogout}
              variant="ghost"
              size="sm"
              className="text-accent-foreground hover:bg-accent-foreground/20"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="flex items-center gap-1 border-t border-accent/20 px-0">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors
                  border-b-2 -mb-[2px]
                  ${isActive
                    ? 'border-accent-foreground text-accent-foreground'
                    : 'border-transparent text-accent-foreground/70 hover:text-accent-foreground hover:bg-accent-foreground/10'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
