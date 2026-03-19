import { ReactNode } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, Link } from "wouter";
import { LogOut, Home, Users, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminLayoutProps {
  children: ReactNode;
  activeTab: "applications" | "pets";
}

export default function AdminLayout({ children, activeTab }: AdminLayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Header - Only this header should be visible */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
        <div className="container py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⚙️</div>
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <span className="bg-blue-700 px-3 py-1 rounded-full text-sm">Admin</span>
              <span className="text-blue-100 ml-2">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </Button>
              </Link>
              <Button
                onClick={handleLogout}
                variant="secondary"
                size="sm"
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4">
            <Link href="/admin/applications">
              <Button
                variant={activeTab === "applications" ? "default" : "ghost"}
                className={`flex items-center gap-2 ${
                  activeTab === "applications"
                    ? "bg-white text-blue-600 hover:bg-white"
                    : "text-white hover:bg-blue-700"
                }`}
              >
                <Users className="w-4 h-4" />
                Applications
              </Button>
            </Link>
            <Link href="/admin/pets">
              <Button
                variant={activeTab === "pets" ? "default" : "ghost"}
                className={`flex items-center gap-2 ${
                  activeTab === "pets"
                    ? "bg-white text-blue-600 hover:bg-white"
                    : "text-white hover:bg-blue-700"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Manage Pets
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
