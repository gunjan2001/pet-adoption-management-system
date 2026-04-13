// src/pages/UserDashboard.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { useMyApplications } from "@/hooks/useAdoptions";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { useState } from "react";

const STATUS_COLORS = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { applications, isLoading, error, refetch } = useMyApplications();
  const [withdrawing, setWithdrawing] = useState<number | null>(null);

  const handleWithdraw = async (id: number) => {
    if (!confirm("Are you sure you want to withdraw this application?")) return;
    setWithdrawing(id);
    try {
      await adoptionsApi.withdraw(id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setWithdrawing(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user?.name ?? user?.email}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/pets")}>
            Browse Pets
          </Button>
          <Button variant="ghost" onClick={logout}>
            Log out
          </Button>
        </div>
      </div>

      {/* ── Applications ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>My Adoption Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : error ? (
            <p className="text-destructive">{error}</p>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven't applied to adopt any pets yet.
              </p>
              <Button onClick={() => navigate("/pets")}>Find a Pet</Button>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(({ application, pet }) => (
                <div
                  key={application.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {pet.imageUrl ? (
                    <img
                      src={pet.imageUrl}
                      alt={pet.name}
                      className="h-16 w-16 object-cover rounded-md flex-shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center text-2xl flex-shrink-0">
                      🐾
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{pet.name}</p>
                      <Badge className={STATUS_COLORS[application.status]}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {application.adminNotes && (
                      <p className="text-sm mt-1 text-muted-foreground italic">
                        Note: {application.adminNotes}
                      </p>
                    )}
                  </div>

                  {application.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWithdraw(application.id)}
                      disabled={withdrawing === application.id}
                    >
                      {withdrawing === application.id ? "…" : "Withdraw"}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
