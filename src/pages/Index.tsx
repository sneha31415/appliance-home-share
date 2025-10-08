import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Search, Upload, Shield } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background z-10" />
        <img
          src={heroImage}
          alt="Modern furniture and appliances"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        
        <div className="relative z-20 container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-semibold mb-6 text-foreground leading-tight">
              Rent Quality<br />Furniture & Appliances
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
              Discover a marketplace where you can rent furniture and appliances from verified owners. 
              Flexible, affordable, sustainable.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" onClick={() => navigate("/browse")} className="text-base">
                <Search className="mr-2 h-5 w-5" />
                Browse Items
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/list-item")} className="text-base">
                <Upload className="mr-2 h-5 w-5" />
                List Your Item
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-foreground">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to start renting or earning from your items
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Search className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Browse & Discover</h3>
                <p className="text-muted-foreground">
                  Explore a wide range of quality furniture and appliances available for rent in your area
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Package className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Book Instantly</h3>
                <p className="text-muted-foreground">
                  Choose your rental period and book items with just a few clicks. Flexible pricing options available
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg">
              <CardContent className="p-8">
                <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">Safe & Secure</h3>
                <p className="text-muted-foreground">
                  All transactions are secure. Verified users and quality-checked items ensure peace of mind
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">
                Have Items to Rent Out?
              </h2>
              <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
                Turn your unused furniture and appliances into a steady income stream. 
                List your items today and start earning.
              </p>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/list-item")}
                className="text-base"
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Listing
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
