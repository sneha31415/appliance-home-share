import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  price_per_day: number;
  location: string;
  image_url: string | null;
  condition: string;
  is_featured: boolean;
}

const Browse = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_available", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products
    .filter((product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (a.is_featured === b.is_featured ? 0 : a.is_featured ? -1 : 1));

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-10">
        <div className="mb-10">
          <h1 className="text-2xl font-semibold mb-1 text-foreground tracking-tight">Browse Items</h1>
          <p className="text-[13px] text-muted-foreground mb-5">Find furniture and appliances available for rent.</p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, category, or location…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-[13px]"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse border border-border rounded-lg overflow-hidden">
                <div className="aspect-[4/3] bg-secondary" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-secondary rounded w-2/3" />
                  <div className="h-3 bg-secondary rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm text-muted-foreground">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group border border-border rounded-lg overflow-hidden cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-[4/3] bg-secondary overflow-hidden relative">
                  {product.is_featured && (
                    <div className="absolute top-2 left-2 z-10 bg-[hsl(var(--featured))] text-white rounded-full p-1 shadow-sm" title="Featured">
                      <Star className="h-3 w-3 fill-white" />
                    </div>
                  )}
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm font-medium text-foreground leading-snug">
                      {product.title}
                    </h3>
                    <span className="text-[11px] px-2 py-0.5 bg-secondary rounded-full text-muted-foreground flex-shrink-0">
                      {product.condition}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[12px] text-muted-foreground mb-3">
                    <MapPin className="h-3 w-3" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">
                      ${product.price_per_day}
                      <span className="text-[11px] font-normal text-muted-foreground">/day</span>
                    </p>
                    <Button variant="outline" size="sm" className="h-7 text-[12px] px-3">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
