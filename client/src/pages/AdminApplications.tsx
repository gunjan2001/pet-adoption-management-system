// src/pages/AdminApplications.tsx
import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { useAllApplications } from "@/hooks/useAdoptions";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
import type { AdoptionStatus, ApplicationWithPetAndApplicant } from "@/types";

const STATUS_STYLES: Record<AdoptionStatus, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100  text-green-800",
  rejected: "bg-red-100    text-red-800",
};

export default function AdminApplications() {
  const { logout } = useAuth();
  const [, navigate] = useLocation();

  // ── Filters + Pagination ──────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<AdoptionStatus | "all">("all");
  const [page, setPage] = useState(1);
  const LIMIT = 10;

  const { applications, totalPages, isLoading, error, refetch } = useAllApplications({
    status: statusFilter === "all" ? undefined : statusFilter,
    page,
    limit: LIMIT,
  });

  // ── Review dialog state ───────────────────────────────────────────────────
  const [reviewing,   setReviewing]   = useState<ApplicationWithPetAndApplicant | null>(null);
  const [decision,    setDecision]    = useState<"approved" | "rejected">("approved");
  const [adminNotes,  setAdminNotes]  = useState("");
  const [submitting,  setSubmitting]  = useState(false);

  const openReview = (row: ApplicationWithPetAndApplicant) => {
    setReviewing(row);
    setDecision("approved");
    setAdminNotes("");
  };

  const handleReview = async () => {
    if (!reviewing) return;
    setSubmitting(true);
    try {
      await adoptionsApi.review(reviewing.application.id, {
        status:     decision,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success(`Application ${decision}`);
      setReviewing(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const inp = "w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="min-h-screen bg-background">

      <main className="container mx-auto px-4 max-w-7xl py-8">

        {/* ── Title ────────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-3xl font-black">Adoption Applications</h1>
          <p className="text-muted-foreground mt-1">Review and manage all adoption requests</p>
        </div>

        {/* ── Status filter tabs ───────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "pending", "approved", "rejected"] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {error && <p className="text-destructive text-sm mb-4">{error}</p>}

        {/* ── List ─────────────────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>

        ) : applications.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-border rounded-xl">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-muted-foreground">No applications found.</p>
          </div>

        ) : (
          <div className="space-y-3">
            {applications.map(({ application, pet, applicant }) => (
              <div
                key={application.id}
                className="bg-card border border-border rounded-xl p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                  {/* Pet thumbnail */}
                  <div className="w-12 h-12 rounded-lg bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                    {pet.imageUrl
                      ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                      : <span className="text-xl">🐾</span>}
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-bold">
                          {applicant.name ?? applicant.email}
                          <span className="text-muted-foreground font-normal mx-2">→</span>
                          {pet.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          App #{application.id} · {applicant.email} · {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${STATUS_STYLES[application.status]}`}>
                        {application.status}
                      </span>
                    </div>

                    {/* Contact row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-muted-foreground mb-0.5">Phone</p><p className="font-medium">{application.phone}</p></div>
                      <div><p className="text-muted-foreground mb-0.5">Address</p><p className="font-medium truncate">{application.address}</p></div>
                      {application.homeType && <div><p className="text-muted-foreground mb-0.5">Home</p><p className="font-medium capitalize">{application.homeType}</p></div>}
                      <div><p className="text-muted-foreground mb-0.5">Has Yard</p><p className="font-medium">{application.hasYard ? "Yes" : "No"}</p></div>
                    </div>

                    {/* Reason */}
                    {application.reason && (
                      <div className="bg-muted/40 rounded-lg px-3 py-2 text-xs">
                        <span className="text-muted-foreground font-medium">Reason: </span>
                        {application.reason}
                      </div>
                    )}

                    {/* Admin notes (resolved) */}
                    {application.adminNotes && application.status !== "pending" && (
                      <div className={`rounded-lg px-3 py-2 text-xs ${STATUS_STYLES[application.status]}`}>
                        <span className="font-medium">Note: </span>{application.adminNotes}
                      </div>
                    )}

                    {/* Review button */}
                    {application.status === "pending" && (
                      <button
                        onClick={() => openReview({ application, pet, applicant })}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
                      >
                        Review Application
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────────────────── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* ── Review Dialog ─────────────────────────────────────────────────────── */}
      {reviewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setReviewing(null)} />
          <div className="relative bg-background rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-5">

            <h2 className="font-bold text-lg">Review Application</h2>

            {/* Summary */}
            <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-1.5">
              <p><span className="text-muted-foreground">Applicant:</span> <span className="font-medium">{reviewing.applicant.name ?? reviewing.applicant.email}</span></p>
              <p><span className="text-muted-foreground">Pet:</span> <span className="font-medium">{reviewing.pet.name} ({reviewing.pet.species})</span></p>
              <p><span className="text-muted-foreground">Email:</span> <span className="font-medium">{reviewing.application.email}</span></p>
              {reviewing.application.reason && (
                <p className="pt-1 border-t border-border"><span className="text-muted-foreground">Reason:</span> {reviewing.application.reason}</p>
              )}
            </div>

            {/* Decision */}
            <div>
              <p className="text-xs font-medium mb-2">Decision *</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDecision("approved")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    decision === "approved"
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("rejected")}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-semibold transition-colors ${
                    decision === "rejected"
                      ? "border-red-500 bg-red-50 text-red-700"
                      : "border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>

            {/* Admin notes */}
            <div>
              <label className="text-xs font-medium mb-1 block">Note for applicant (optional)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={3}
                placeholder={decision === "approved" ? "e.g. We will contact you shortly to arrange a meetup." : "e.g. Unfortunately we found a better match for this pet."}
                className={inp}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleReview}
                disabled={submitting}
                className={`flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 transition-opacity hover:opacity-90 ${
                  decision === "approved"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                }`}
              >
                {submitting ? "Saving…" : decision === "approved" ? "Confirm Approval" : "Confirm Rejection"}
              </button>
              <button
                onClick={() => setReviewing(null)}
                className="flex-1 py-3 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
