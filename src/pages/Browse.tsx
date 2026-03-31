import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-semibold mb-4 text-foreground">Browse Items</h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-accent transition-colors">
                    {product.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                    {product.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">
                        ${product.price_per_day}
                        <span className="text-sm font-normal text-muted-foreground">/day</span>
                      </p>
                    </div>
                    <span className="text-xs px-3 py-1 bg-secondary rounded-full text-secondary-foreground">
                      {product.condition}
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button variant="default" className="w-full">
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse;
