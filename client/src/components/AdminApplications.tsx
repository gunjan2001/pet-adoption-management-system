// src/pages/AdminApplications.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { useAllApplications } from "@/hooks/useAdoptions";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import type { AdoptionStatus, ApplicationWithPetAndApplicant } from "@/types";

const STATUS_COLORS: Record<AdoptionStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminApplications() {
  const [, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState<AdoptionStatus | "all">("all");
  const [page, setPage] = useState(1);

  const { applications, totalPages, isLoading, error, refetch } = useAllApplications({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: 10,
  });

  // Review dialog state
  const [reviewing,  setReviewing]  = useState<ApplicationWithPetAndApplicant | null>(null);
  const [decision,   setDecision]   = useState<"approved" | "rejected">("approved");
  const [adminNotes, setAdminNotes] = useState("");
  const [saving,     setSaving]     = useState(false);
  const [saveErr,    setSaveErr]    = useState<string | null>(null);

  const openReview = (row: ApplicationWithPetAndApplicant) => {
    setReviewing(row);
    setDecision("approved");
    setAdminNotes("");
    setSaveErr(null);
  };

  const handleReview = async () => {
    if (!reviewing) return;
    setSaving(true);
    setSaveErr(null);
    try {
      await adoptionsApi.review(reviewing.application.id, {
        status: decision,
        adminNotes: adminNotes || undefined,
      });
      setReviewing(null);
      refetch();
    } catch (err) {
      setSaveErr(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Adoption Applications</h1>
          <p className="text-muted-foreground">Review and manage all adoption requests</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin")}>← Dashboard</Button>
      </div>

      {/* ── Filters ─────────────────────────────────────────────────────── */}
      <div className="flex gap-3 mb-6">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as any); setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {error && <p className="text-destructive mb-4">{error}</p>}

      {/* ── List ────────────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No applications found.</p>
          ) : (
            <div className="space-y-3">
              {applications.map(({ application, pet, applicant }) => (
                <div
                  key={application.id}
                  className="flex items-center gap-4 p-4 border rounded-lg"
                >
                  {/* Pet thumbnail */}
                  {pet.imageUrl ? (
                    <img src={pet.imageUrl} alt={pet.name} className="h-14 w-14 object-cover rounded-md flex-shrink-0" />
                  ) : (
                    <div className="h-14 w-14 bg-muted rounded-md flex items-center justify-center text-xl flex-shrink-0">🐾</div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold">{applicant.name ?? applicant.email}</p>
                      <span className="text-muted-foreground text-sm">→</span>
                      <p className="font-semibold">{pet.name}</p>
                      <Badge className={STATUS_COLORS[application.status]}>
                        {application.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {applicant.email} · {new Date(application.createdAt).toLocaleDateString()}
                    </p>
                    {application.adminNotes && (
                      <p className="text-sm text-muted-foreground italic mt-1">
                        Note: {application.adminNotes}
                      </p>
                    )}
                  </div>

                  {/* Action */}
                  {application.status === "pending" && (
                    <Button size="sm" onClick={() => openReview({ application, pet, applicant })}>
                      Review
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            ← Prev
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next →
          </Button>
        </div>
      )}

      {/* ── Review Dialog ────────────────────────────────────────────────── */}
      <Dialog open={!!reviewing} onOpenChange={(open) => !open && setReviewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Review Application — {reviewing?.applicant.name ?? reviewing?.applicant.email}
            </DialogTitle>
          </DialogHeader>

          {reviewing && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted p-3 text-sm space-y-1">
                <p><span className="font-medium">Pet:</span> {reviewing.pet.name} ({reviewing.pet.species})</p>
                <p><span className="font-medium">Applicant:</span> {reviewing.application.fullName}</p>
                <p><span className="font-medium">Email:</span> {reviewing.application.email}</p>
                <p><span className="font-medium">Phone:</span> {reviewing.application.phone}</p>
                <p><span className="font-medium">Address:</span> {reviewing.application.address}</p>
                {reviewing.application.reason && (
                  <p><span className="font-medium">Reason:</span> {reviewing.application.reason}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label>Decision *</Label>
                <Select value={decision} onValueChange={(v) => setDecision(v as "approved" | "rejected")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approved">✅ Approve</SelectItem>
                    <SelectItem value="rejected">❌ Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Admin notes (optional)</Label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Leave a note for the applicant…"
                  rows={3}
                />
              </div>

              {saveErr && <p className="text-sm text-destructive">{saveErr}</p>}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewing(null)}>Cancel</Button>
            <Button
              onClick={handleReview}
              disabled={saving}
              variant={decision === "rejected" ? "destructive" : "default"}
            >
              {saving ? "Saving…" : decision === "approved" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
