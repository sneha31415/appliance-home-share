import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
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
  const [bookingOpen, setBookingOpen] = useState(false);

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
    setBookingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <button
          onClick={() => navigate("/browse")}
          className="flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-secondary rounded-lg overflow-hidden border border-border">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No Image
              </div>
            )}
          </div>

          <div>
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">
              {product.category}
            </p>
            <h1 className="text-2xl font-semibold mb-3 text-foreground tracking-tight">
              {product.title}
            </h1>
            <div className="flex items-center gap-4 text-[13px] text-muted-foreground mb-6">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {product.location}
              </span>
              <span className="px-2 py-0.5 bg-secondary rounded text-[12px]">
                {product.condition}
              </span>
            </div>

            {/* Pricing */}
            <div className="border border-border rounded-lg p-5 mb-6">
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-4">Pricing</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[13px] text-muted-foreground">Per Day</span>
                  <span className="text-lg font-semibold text-foreground">${product.price_per_day}</span>
                </div>
                {product.price_per_week && (
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-[13px] text-muted-foreground">Per Week</span>
                    <span className="text-lg font-semibold text-foreground">${product.price_per_week}</span>
                  </div>
                )}
                {product.price_per_month && (
                  <div className="flex justify-between items-center pt-3 border-t border-border">
                    <span className="text-[13px] text-muted-foreground">Per Month</span>
                    <span className="text-lg font-semibold text-foreground">${product.price_per_month}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Description</p>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            <Button
              className="w-full h-10 text-[13px]"
              onClick={handleBooking}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {user && product && (
        <BookingDialog
          open={bookingOpen}
          onOpenChange={setBookingOpen}
          product={product}
          userId={user.id}
        />
      )}
    </div>
  );
};

export default ProductDetail;
