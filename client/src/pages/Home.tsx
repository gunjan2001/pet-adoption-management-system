import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Heart, Users, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
        {/* Geometric Background Elements */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full geometric-blue opacity-40 blur-3xl" />
        <div className="absolute bottom-0 left-10 w-96 h-96 rounded-full geometric-pink opacity-30 blur-3xl" />

        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-7xl font-black text-foreground text-balance">
              Find Your Perfect Companion
            </h1>

            <p className="subtitle text-lg md:text-xl">
              Discover loving pets waiting for their forever homes. Browse, connect, and start your adoption journey today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button
                asChild
                size="lg"
                className="bg-accent text-accent-foreground hover:opacity-90 text-base font-semibold"
              >
                <Link href="/pets">
                  <a>Browse Available Pets</a>
                </Link>
              </Button>

              {!isAuthenticated && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-border text-base font-semibold"
                >
                  <Link href={"/login"}>Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card/50">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12 md:gap-8">
            {/* Feature 1 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Browse Pets</h3>
              <p className="text-muted">
                Explore our collection of adoptable pets with detailed profiles, photos, and information.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Heart className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Apply to Adopt</h3>
              <p className="text-muted">
                Submit adoption applications and track their status in real-time through your dashboard.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-accent/20 rounded-lg flex items-center justify-center">
                  <Users className="w-8 h-8 text-accent" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Expert Support</h3>
              <p className="text-muted">
                Our team reviews each application carefully to ensure the best matches for our pets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black">Ready to Make a Difference?</h2>
            <p className="text-lg text-muted">
              Every pet deserves a loving home. Start browsing our available pets and find your perfect match today.
            </p>

            <Button
              asChild
              size="lg"
              className="bg-accent text-accent-foreground hover:opacity-90 text-base font-semibold"
            >
              <Link href="/pets">
                <a>Browse Pets Now</a>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
