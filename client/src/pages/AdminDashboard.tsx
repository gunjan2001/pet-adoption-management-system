// src/pages/AdminDashboard.tsx
import { useAuth } from "@/_core/hooks/useAuth";
import { useAllApplications } from "@/hooks/useAdoptions";
import { usePets } from "@/hooks/usePets";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock,
  Home,
  PawPrint,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocation } from "wouter";

// ─── Colour tokens (match project design system) ─────────────────────────────
const COLORS = {
  amber:  "#F59E0B",
  green:  "#22C55E",
  red:    "#EF4444",
  blue:   "#3B82F6",
  purple: "#8B5CF6",
  gray:   "#9CA3AF",
  orange: "#F97316",
};

// ─── Stat card definition ─────────────────────────────────────────────────────
interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
}

// ─── Custom tooltip for recharts ──────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2.5 text-sm">
      {label && <p className="text-gray-500 text-xs mb-1">{label}</p>}
      {payload.map((p: any) => (
        <p key={p.name} className="font-semibold" style={{ color: p.color ?? p.fill }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="flex items-center gap-2 mb-5">
    <span className="text-amber-500">{icon}</span>
    <h2 className="font-black text-gray-900 text-lg">{title}</h2>
  </div>
);

// ─── Skeleton pulse ───────────────────────────────────────────────────────────
const Pulse = ({ h = "h-8", w = "w-16" }: { h?: string; w?: string }) => (
  <div className={`${h} ${w} rounded-lg bg-gray-100 animate-pulse mx-auto`} />
);

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { pets,         isLoading: petsLoading }  = usePets({ limit: 500, page: 1 });
  const { applications, isLoading: appsLoading }  = useAllApplications({ limit: 500, page: 1 });
  const isLoading = petsLoading || appsLoading;

  // ── Derived stats ───────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:        pets.length,
    available:    pets.filter((p) => p.status === "available").length,
    pending:      pets.filter((p) => p.status === "pending").length,
    adopted:      pets.filter((p) => p.status === "adopted").length,
    totalApps:    applications.length,
    pendingApps:  applications.filter((a) => a.application.status === "pending").length,
    approvedApps: applications.filter((a) => a.application.status === "approved").length,
    rejectedApps: applications.filter((a) => a.application.status === "rejected").length,
  }), [pets, applications]);

  // ── Chart data ──────────────────────────────────────────────────────────────

  /** Pie — pet status breakdown */
  const petStatusData = useMemo(() => [
    { name: "Available", value: stats.available, color: COLORS.green  },
    { name: "Pending",   value: stats.pending,   color: COLORS.amber  },
    { name: "Adopted",   value: stats.adopted,   color: COLORS.gray   },
  ], [stats]);

  /** Bar — application status breakdown */
  const appStatusData = useMemo(() => [
    { name: "Pending",  value: stats.pendingApps,  fill: COLORS.amber  },
    { name: "Approved", value: stats.approvedApps, fill: COLORS.green  },
    { name: "Rejected", value: stats.rejectedApps, fill: COLORS.red    },
  ], [stats]);

  /**
   * Line — applications over time (last 7 days).
   * Groups by day of createdAt from the applications array.
   */
  const appTrendData = useMemo(() => {
    const today = new Date();
    const days: { date: string; label: string; count: number }[] = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (6 - i));
      return {
        date:  d.toISOString().slice(0, 10),
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        count: 0,
      };
    });

    applications.forEach(({ application }) => {
      const day = new Date(application.createdAt).toISOString().slice(0, 10);
      const slot = days.find((d) => d.date === day);
      if (slot) slot.count += 1;
    });

    return days.map(({ label, count }) => ({ label, count }));
  }, [applications]);

  // ── Recent applications ─────────────────────────────────────────────────────
  const recentApps = useMemo(
    () =>
      [...applications]
        .sort(
          (a, b) =>
            new Date(b.application.createdAt).getTime() -
            new Date(a.application.createdAt).getTime()
        )
        .slice(0, 6),
    [applications]
  );

  // ── Stat card definitions ───────────────────────────────────────────────────
  const statCards: StatCard[] = [
    {
      label:  "Total Pets",
      value:  stats.total,
      icon:   <PawPrint className="w-5 h-5" />,
      color:  "text-blue-600",
      bg:     "bg-blue-50",
      border: "border-blue-100",
    },
    {
      label:  "Available",
      value:  stats.available,
      icon:   <CheckCircle2 className="w-5 h-5" />,
      color:  "text-green-600",
      bg:     "bg-green-50",
      border: "border-green-100",
    },
    {
  label:  "Pending Adoption",
  value:  stats.pending,
  icon:   <Clock className="w-5 h-5" />,
  color:  "text-yellow-700",
  bg:     "bg-yellow-100",
  border: "border-yellow-200",
},
    {
      label:  "Adopted",
      value:  stats.adopted,
      icon:   <Home className="w-5 h-5" />,
      color:  "text-gray-600",
      bg:     "bg-gray-50",
      border: "border-gray-100",
    },
    {
      label:  "Total Apps",
      value:  stats.totalApps,
      icon:   <ClipboardList className="w-5 h-5" />,
      color:  "text-purple-600",
      bg:     "bg-purple-50",
      border: "border-purple-100",
    },
    {
  label:  "Pending Review",
  value:  stats.pendingApps,
  icon:   <TrendingUp className="w-5 h-5" />,
  color:  "text-rose-600",
  bg:     "bg-rose-50",
  border: "border-rose-200",
},
  ];

  // ── Status badge helper ─────────────────────────────────────────────────────
  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending:  "bg-amber-100 text-amber-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    return map[status] ?? "bg-gray-100 text-gray-600";
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <main className="container mx-auto px-4 max-w-7xl py-8 space-y-10">

        {/* ── Page title ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 mb-1">
              Admin Panel
            </p>
            <h1 className="text-3xl font-black text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1 text-sm">
              Welcome back,{" "}
              <span className="font-semibold text-gray-700">
                {user?.name ?? user?.email}
              </span>
            </p>
          </div>
          {/* Adoption rate pill */}
          {!isLoading && stats.total > 0 && (
            <div className="inline-flex items-center gap-2 bg-white border border-amber-200 rounded-2xl px-4 py-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-sm font-bold text-gray-700">
                Adoption rate:{" "}
                <span className="text-amber-600">
                  {Math.round((stats.adopted / stats.total) * 100)}%
                </span>
              </span>
            </div>
          )}
        </div>

        {/* ── Stat cards ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((s) => (
            <div
              key={s.label}
              className={`${s.bg} rounded-2xl p-4 text-center border ${s.border} hover:shadow-md transition-all duration-200 group`}
            >
              {/* Icon row */}
              <div
                className={`w-9 h-9 rounded-xl ${s.bg} border ${s.border} flex items-center justify-center mx-auto mb-2 ${s.color} group-hover:scale-110 transition-transform duration-200`}
              >
                {s.icon}
              </div>
              {/* Value */}
              {isLoading ? (
                <Pulse />
              ) : (
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 leading-tight font-medium">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* ── Charts row ────────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-6">

          {/* 1. Pie — Pet Status Breakdown */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
            <SectionHeader icon={<PawPrint className="w-4 h-4" />} title="Pet Status" />
            {isLoading ? (
              <Pulse h="h-48" w="w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={petStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {petStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(v) => (
                      <span className="text-xs text-gray-600 font-medium">{v}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 2. Bar — Application Status */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
            <SectionHeader icon={<BarChart3 className="w-4 h-4" />} title="Applications" />
            {isLoading ? (
              <Pulse h="h-48" w="w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={appStatusData} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "#F9FAFB" }} />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {appStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* 3. Line — Applications this week */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow">
            <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Weekly Trend" />
            {isLoading ? (
              <Pulse h="h-48" w="w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={appTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "#6B7280" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Applications"
                    stroke={COLORS.amber}
                    strokeWidth={2.5}
                    dot={{ fill: COLORS.amber, r: 4 }}
                    activeDot={{ r: 6, fill: COLORS.amber }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Quick actions ─────────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Manage Pets */}
          <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow group relative overflow-hidden">
            {/* decorative blob */}
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-50 opacity-60 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <PawPrint className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight">Manage Pets</h2>
                  <p className="text-xs text-gray-400 font-medium">{stats.total} total listings</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                Add new pets, update details, change status, or remove listings.
              </p>
              {/* mini progress bar: available ratio */}
              {!isLoading && stats.total > 0 && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span>Available</span>
                    <span>{stats.available} / {stats.total}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 rounded-full transition-all duration-700"
                      style={{ width: `${(stats.available / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => navigate("/admin/pets")}
                className="w-full px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
              >
                Go to Pet Management →
              </button>
            </div>
          </div>

          {/* Review Applications */}
          <div className="border border-gray-100 rounded-2xl p-6 bg-white hover:shadow-lg transition-shadow group relative overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-orange-50 opacity-60 group-hover:scale-125 transition-transform duration-500" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight">Review Applications</h2>
                  <p className="text-xs text-gray-400 font-medium">{stats.totalApps} total applications</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-5">
                {stats.pendingApps > 0
                  ? `${stats.pendingApps} application(s) are waiting for your review.`
                  : "No pending applications right now."}
              </p>
              {/* Pending badge row */}
              {!isLoading && (
                <div className="flex gap-2 mb-5 flex-wrap">
                  {[
                    { label: "Pending",  value: stats.pendingApps,  cls: "bg-amber-100 text-amber-700" },
                    { label: "Approved", value: stats.approvedApps, cls: "bg-green-100 text-green-700" },
                    { label: "Rejected", value: stats.rejectedApps, cls: "bg-red-100 text-red-700"    },
                  ].map((b) => (
                    <span key={b.label} className={`px-3 py-1 rounded-full text-xs font-semibold ${b.cls}`}>
                      {b.value} {b.label}
                    </span>
                  ))}
                </div>
              )}
              <button
                onClick={() => navigate("/admin/applications")}
                className="w-full px-7 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all active:scale-95"
              >
                Go to Applications →
              </button>
            </div>
          </div>
        </div>

        {/* ── Recent applications ───────────────────────────────────────────── */}
        <div className="border border-gray-100 rounded-2xl bg-white overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              <h2 className="font-bold text-gray-900">Recent Applications</h2>
            </div>
            <button
              onClick={() => navigate("/admin/applications")}
              className="text-sm text-amber-600 hover:text-amber-700 font-semibold transition-colors"
            >
              View all →
            </button>
          </div>

          {appsLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : recentApps.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <PawPrint className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No applications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentApps.map(({ application, pet, applicant }) => (
                <div
                  key={application.id}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-amber-50/40 transition-colors"
                >
                  {/* Pet thumbnail */}
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100">
                    {pet.imageUrl ? (
                      <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">🐾</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {applicant.name ?? applicant.email}
                      <span className="text-gray-300 font-normal mx-1.5">→</span>
                      <span className="text-amber-600">{pet.name}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(application.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusBadge(
                      application.status
                    )}`}
                  >
                    {application.status === "pending"  && <Clock className="w-3 h-3 inline mr-1" />}
                    {application.status === "approved" && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
                    {application.status === "rejected" && <XCircle className="w-3 h-3 inline mr-1" />}
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}