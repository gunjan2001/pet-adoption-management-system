// src/pages/UserDashboard.tsx (Alternative version with enhanced modal)
import { useAuth } from "@/_core/hooks/useAuth";
import WithdrawModal from "@/components/WithdrawModal";
import { useMyApplications } from "@/hooks/useAdoptions";
import { adoptionsApi } from "@/lib/api/adoptions.api";
import { getErrorMessage } from "@/lib/errorHandler";
import type { AdoptionStatus, ApplicationWithPet } from "@/types";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";

const STATUS_CONFIG: Record<AdoptionStatus, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
  pending:  { bg: "bg-amber-50  border-amber-200",  text: "text-amber-700",  icon: <Clock       className="w-4 h-4 text-amber-500" />,  label: "Pending"  },
  approved: { bg: "bg-green-50  border-green-200",  text: "text-green-700",  icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,  label: "Approved" },
  rejected: { bg: "bg-red-50    border-red-200",    text: "text-red-700",    icon: <XCircle     className="w-4 h-4 text-red-500" />,    label: "Rejected" },
};

export default function UserDashboard() {
  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { applications, isLoading, refetch } = useMyApplications();
  const [withdrawing, setWithdrawing] = useState(false);
  const [applicationToWithdraw, setApplicationToWithdraw] = useState<ApplicationWithPet | null>(null);

  useEffect(() => {
    if (!isAuthenticated) setLocation("/");
    else if (user?.role === "admin") setLocation("/admin");
  }, [isAuthenticated, user?.role, setLocation]);

  if (!isAuthenticated) return null;

  const handleWithdrawClick = (application: ApplicationWithPet) => {
    setApplicationToWithdraw(application);
  };

  const handleWithdrawConfirm = async () => {
    if (!applicationToWithdraw) return;
    
    setWithdrawing(true);
    try {
      await adoptionsApi.withdraw(applicationToWithdraw.application.id);
      toast.success("Application withdrawn successfully");
      setApplicationToWithdraw(null);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setWithdrawing(false);
    }
  };

  const handleWithdrawCancel = () => {
    if (!withdrawing) {
      setApplicationToWithdraw(null);
    }
  };

  const counts = {
    total:    applications.length,
    pending:  applications.filter((a) => a.application.status === "pending").length,
    approved: applications.filter((a) => a.application.status === "approved").length,
    rejected: applications.filter((a) => a.application.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/60 to-white">
      <div className="container mx-auto px-4 max-w-5xl py-12 md:py-20">

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-5 mb-10">
          <div>
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-1">My Account</p>
            <h1 className="text-4xl font-black text-gray-900">My Applications</h1>
            <p className="text-gray-500 mt-1">
              Welcome back, <span className="font-semibold text-gray-700">{user?.name ?? user?.email}</span>
            </p>
          </div>
        </div>

        {/* ── Stat pills ───────────────────────────────────────────────────── */}
        {!isLoading && applications.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Total",    value: counts.total,    color: "text-gray-900",   bg: "bg-white"        },
              { label: "Pending",  value: counts.pending,  color: "text-amber-700",  bg: "bg-amber-50"     },
              { label: "Approved", value: counts.approved, color: "text-green-700",  bg: "bg-green-50"     },
              { label: "Rejected", value: counts.rejected, color: "text-red-600",    bg: "bg-red-50"       },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-2xl border border-gray-100 p-4 text-center`}>
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Applications list ────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-gray-100 p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 w-1/3 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-1/2 bg-gray-100 rounded-lg" />
                    <div className="h-4 w-1/4 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : applications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-amber-200">
            <p className="text-5xl mb-4">🐾</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-500 mb-6">Find a pet you love and start your adoption journey!</p>
            <Link href="/pets">
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-200 transition-colors cursor-pointer">
                Browse Pets <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>

        ) : (
          <div className="space-y-4">
            {applications.map((item) => {
              const { application, pet } = item;
              const cfg = STATUS_CONFIG[application.status];
              return (
                <div key={application.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">

                  {/* Coloured top stripe based on status */}
                  <div className={`h-1 w-full ${
                    application.status === "approved" ? "bg-green-400"
                    : application.status === "rejected" ? "bg-red-400"
                    : "bg-amber-400"}`} />

                  <div className="p-5 sm:p-6">
                    <div className="flex gap-4 items-start">
                      {/* Pet image */}
                      <div className="w-16 h-16 rounded-2xl bg-amber-50 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {pet.imageUrl
                          ? <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                          : <span className="text-2xl">🐾</span>}
                      </div>

                      {/* Main content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2 mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900">{pet.name}</h3>
                            <p className="text-sm text-gray-500 capitalize">
                              {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
                            </p>
                          </div>
                          {/* Status badge */}
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text}`}>
                            {cfg.icon} {cfg.label}
                          </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-xs">
                          <div className="bg-gray-50 rounded-xl p-2.5">
                            <p className="text-gray-400 mb-0.5">App #</p>
                            <p className="font-semibold text-gray-700">#{application.id}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5">
                            <p className="text-gray-400 mb-0.5">Applied</p>
                            <p className="font-semibold text-gray-700">{format(new Date(application.createdAt), "MMM d, yyyy")}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5">
                            <p className="text-gray-400 mb-0.5">Home Type</p>
                            <p className="font-semibold text-gray-700 capitalize">{application.homeType || "—"}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-2.5">
                            <p className="text-gray-400 mb-0.5">Has Yard</p>
                            <p className="font-semibold text-gray-700">{application.hasYard ? "Yes" : "No"}</p>
                          </div>
                        </div>

                        {/* Reason */}
                        {application.reason && (
                          <div className="mt-3 bg-amber-50 rounded-xl px-4 py-3">
                            <p className="text-xs font-semibold text-amber-700 mb-1">Your reason</p>
                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">{application.reason}</p>
                          </div>
                        )}

                        {/* Admin notes */}
                        {application.adminNotes && (
                          <div className={`mt-3 rounded-xl px-4 py-3 border ${cfg.bg}`}>
                            <p className={`text-xs font-semibold mb-1 ${cfg.text}`}>Admin note</p>
                            <p className="text-sm text-gray-700 leading-relaxed">{application.adminNotes}</p>
                          </div>
                        )}

                        {/* Withdraw */}
                        {application.status === "pending" && (
                          <div className="mt-4 flex justify-end">
                            <button 
                              onClick={() => handleWithdrawClick(item)}
                              className="px-4 py-2 rounded-xl border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-50 transition-colors"
                            >
                              Withdraw Application
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Withdraw Confirmation Modal ──────────────────────────────────── */}
      <WithdrawModal
        isOpen={!!applicationToWithdraw}
        onClose={handleWithdrawCancel}
        onConfirm={handleWithdrawConfirm}
        application={applicationToWithdraw}
        isLoading={withdrawing}
      />
    </div>
  );
}