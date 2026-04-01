import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search, Package, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Modern furniture and appliances"
            className="w-full h-full object-cover opacity-[0.15]"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-24 md:py-36 border-primary-foreground">
          <div className="max-w-2xl">
            <p className="text-[13px] font-medium text-muted-foreground tracking-wide uppercase mb-4">
              Furniture & Appliance Rental
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-foreground leading-[1.1] tracking-tight mb-5">
              Rent quality items from people near you.
            </h1>
            <p className="text-base text-muted-foreground mb-8 max-w-lg leading-relaxed">
              A marketplace for renting furniture and appliances from verified owners. Flexible pricing, no long-term commitments.
            </p>
            <div className="flex gap-3">
              <Button onClick={() => navigate("/browse")} className="h-9 px-4 text-[13px]">
                Browse Items
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
              <Button variant="outline" onClick={() => navigate("/list-item")} className="h-9 px-4 text-[13px]">
                List Your Item
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white border-b border-border">
        <div className="container mx-auto px-4">
          <div className="mb-14">
            <p className="font-medium text-muted-foreground tracking-wide uppercase mb-2 text-5xl border-primary shadow-none">How it works</p>
            <h2 className="text-2xl font-semibold text-foreground tracking-tight">Three simple steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-lg overflow-hidden border border-border">
            {[
              { icon: Search, title: "Browse & Discover", desc: "Explore quality furniture and appliances available for rent in your area." },
              { icon: Package, title: "Book Instantly", desc: "Choose your rental period and book with a few clicks. Flexible daily, weekly, or monthly pricing." },
              { icon: Shield, title: "Safe & Secure", desc: "Verified users and quality-checked items. All transactions are protected." },
            ].map((item, i) => (
              <div key={i} className="p-8 shadow-xl opacity-100 border-[#d5bebe] bg-[#e6e6e6]">
                <div className="h-9 w-9 rounded-md border border-border flex items-center justify-center mb-5">
                  <item.icon className="h-4 w-4 text-foreground" />
                </div>
                <h2 className="text-sm font-semibold mb-2 text-foreground">{item.title}</h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="rounded-lg border border-border p-12 text-center bg-[#e6e6e6]">
            <h2 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
              Have items to rent out?
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Turn unused furniture and appliances into steady income. List your items and start earning today.
            </p>
            <Button onClick={() => navigate("/list-item")} className="h-9 px-4 text-[13px]">
              Start Listing
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
