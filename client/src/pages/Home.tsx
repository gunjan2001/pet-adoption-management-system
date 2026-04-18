// src/pages/Home.tsx
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Heart, Shield, Clock, ArrowRight, PawPrint, Star } from "lucide-react";

const STATS = [
  { value: "2,400+", label: "Pets Rehomed" },
  { value: "1,800+", label: "Happy Families" },
  { value: "98%",    label: "Satisfaction Rate" },
  { value: "60+",    label: "Breeds Available" },
];

const FEATURES = [
  {
    icon: PawPrint,
    title: "Browse & Discover",
    body: "Explore hundreds of lovable pets with rich profiles, real photos, and personality details that help you find your perfect match.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Heart,
    title: "Apply to Adopt",
    body: "Our simple application takes minutes. Submit, track status in real-time, and receive personalised feedback from our care team.",
    color: "bg-rose-100 text-rose-600",
  },
  {
    icon: Shield,
    title: "Trusted & Safe",
    body: "Every pet is health-checked and every application is reviewed by our experts, so both you and your new companion are in safe hands.",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Clock,
    title: "Fast Process",
    body: "Most adoptions are completed within a week. We work hard to keep things moving so pets get to their new homes quickly.",
    color: "bg-sky-100 text-sky-700",
  },
];

const TESTIMONIALS = [
  {
    quote: "We found our golden retriever Luna here. The whole process was so smooth and the team was incredibly helpful.",
    name: "Priya S.",
    pet: "Adopted Luna, 2 years ago",
  },
  {
    quote: "I was nervous about adopting for the first time, but the team walked me through every step. Couldn't be happier!",
    name: "Rahul M.",
    pet: "Adopted Mochi the cat",
  },
  {
    quote: "Three months in and Biscuit has completely changed our home. Best decision we ever made.",
    name: "Anjali K.",
    pet: "Adopted Biscuit the beagle",
  },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-28 md:pt-32 md:pb-40 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 overflow-hidden">

        {/* Background blobs */}
        <div className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full bg-amber-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-rose-200/40 blur-3xl pointer-events-none" />

        {/* Floating pet emojis — decorative */}
        <span className="absolute top-20 left-[8%]  text-4xl md:text-5xl animate-bounce  [animation-duration:3s]  select-none">🐶</span>
        <span className="absolute top-32 right-[6%] text-3xl md:text-4xl animate-bounce  [animation-duration:4s] [animation-delay:0.5s] select-none">🐱</span>
        <span className="absolute bottom-24 left-[14%] text-3xl animate-bounce [animation-duration:3.5s] [animation-delay:1s] select-none hidden md:block">🐰</span>
        <span className="absolute bottom-20 right-[12%] text-4xl animate-bounce [animation-duration:4.5s] [animation-delay:0.3s] select-none hidden md:block">🐾</span>

        <div className="container mx-auto px-4 max-w-5xl relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">

            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-sm font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              India's most trusted pet adoption platform
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Every Pet Deserves a{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-amber-600">Forever Home</span>
                {/* Underline squiggle */}
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 8 Q75 2 150 8 Q225 14 298 8" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"/>
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
              Browse hundreds of lovable pets waiting for their next chapter. Simple applications, transparent process, joyful outcomes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/pets">
                <span className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-base font-bold shadow-lg shadow-amber-200 hover:shadow-amber-300 transition-all duration-200 cursor-pointer">
                  Browse Available Pets
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
              {!isAuthenticated && (
                <Link href="/register">
                  <span className="inline-flex items-center justify-center px-7 py-3.5 rounded-2xl border-2 border-gray-900 text-gray-900 text-base font-bold hover:bg-gray-900 hover:text-white transition-all duration-200 cursor-pointer">
                    Create Free Account
                  </span>
                </Link>
              )}
            </div>

            {/* Trust markers */}
            <div className="flex items-center justify-center gap-6 pt-2 text-sm text-gray-500 flex-wrap">
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Free to apply</span>
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> Health-checked pets</span>
              <span className="flex items-center gap-1.5"><span className="text-green-500">✓</span> No hidden fees</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-900 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-gray-700">
            {STATS.map(({ value, label }) => (
              <div key={label} className="text-center px-6">
                <p className="text-3xl md:text-4xl font-black text-amber-400">{value}</p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">How Adoption Works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="absolute top-10 left-[16.6%] right-[16.6%] h-px bg-amber-200 hidden md:block" />

            {[
              { step: "01", title: "Browse Pets", body: "Filter by species, breed, age, or status to find pets that match your lifestyle and home.", emoji: "🔍" },
              { step: "02", title: "Submit Application", body: "Fill in a short form about yourself and your home. Takes less than 5 minutes.", emoji: "📝" },
              { step: "03", title: "Welcome Home!", body: "Our team reviews and responds within 48 hours. Approved? Your new family member is ready!", emoji: "🏠" },
            ].map(({ step, title, body, emoji }) => (
              <div key={step} className="text-center relative">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-amber-500 text-white text-3xl mb-6 shadow-lg shadow-amber-200">
                  {emoji}
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-black flex items-center justify-center">
                    {step}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/pets">
              <span className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-lg shadow-amber-200 transition-all cursor-pointer">
                Start Browsing <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Built Around Pets & People</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map(({ icon: Icon, title, body, color }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <p className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-3">Stories</p>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900">Happy Tails 🐾</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ quote, name, pet }) => (
              <div key={name} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{quote}"</p>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{name}</p>
                  <p className="text-amber-600 text-xs">{pet}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-rose-500/10 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 max-w-3xl text-center relative z-10">
          <p className="text-5xl mb-6">🐾</p>
          <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
            Your New Best Friend<br />is Waiting
          </h2>
          <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
            Thousands of pets need a loving home. Browse our listings today and take the first step towards an unforgettable bond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pets">
              <span className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-900 text-base font-black shadow-xl shadow-amber-900/30 transition-all cursor-pointer">
                Find My Pet <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            {!isAuthenticated && (
              <Link href="/register">
                <span className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white/20 text-white text-base font-bold hover:bg-white/10 transition-all cursor-pointer">
                  Create Account
                </span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="bg-gray-950 py-10">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <span className="text-2xl">🐾</span> PawAdopt
          </div>
          <p className="text-gray-600 text-sm text-center">
            © {new Date().getFullYear()} PawAdopt. Helping pets find their forever homes.
          </p>
          <div className="flex gap-5 text-sm text-gray-600">
            <Link href="/pets"><span className="hover:text-amber-400 transition-colors cursor-pointer">Browse Pets</span></Link>
            <Link href="/login"><span className="hover:text-amber-400 transition-colors cursor-pointer">Login</span></Link>
            <Link href="/register"><span className="hover:text-amber-400 transition-colors cursor-pointer">Register</span></Link>
          </div>
        </div>
      </footer>

    </div>
  );
}