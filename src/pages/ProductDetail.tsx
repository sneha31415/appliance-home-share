import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Calendar, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import BookingDialog from "@/components/BookingDialog";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  price_per_week: number | null;
  price_per_month: number | null;
  location: string;
  image_url: string | null;
  condition: string;
  owner_id: string;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchProduct();
  }, [id]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setProduct(data);
    } catch (error: any) {
      toast.error("Failed to load product");
      navigate("/browse");
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.error("Please sign in to book this item");
      navigate("/auth");
      return;
    }
    toast.success("Booking feature coming soon!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/browse")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Browse
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  No Image Available
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="mb-6">
              <span className="text-sm font-medium text-accent uppercase tracking-wide">
                {product.category}
              </span>
              <h1 className="text-4xl font-semibold mt-2 mb-4 text-foreground">
                {product.title}
              </h1>
              <div className="flex items-center gap-2 text-muted-foreground mb-4">
                <MapPin className="h-5 w-5" />
                <span>{product.location}</span>
              </div>
              <span className="inline-block px-4 py-1.5 bg-secondary rounded-full text-sm text-secondary-foreground">
                {product.condition} condition
              </span>
            </div>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Pricing</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Per Day</span>
                    <span className="text-2xl font-semibold">${product.price_per_day}</span>
                  </div>
                  {product.price_per_week && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Per Week</span>
                      <span className="text-2xl font-semibold">${product.price_per_week}</span>
                    </div>
                  )}
                  {product.price_per_month && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Per Month</span>
                      <span className="text-2xl font-semibold">${product.price_per_month}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Button
              size="lg"
              className="w-full"
              onClick={handleBooking}
            >
              <Calendar className="mr-2 h-5 w-5" />
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
