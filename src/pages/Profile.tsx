import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Package, Calendar, Clock, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string | null;
  created_at: string | null;
  product: {
    id: string;
    title: string;
    image_url: string | null;
    category: string;
  } | null;
}

const statusColor = (status: string | null) => {
  switch (status) {
    case "confirmed": return "bg-emerald-500/10 text-emerald-600 border-emerald-200";
    case "cancelled": return "bg-red-500/10 text-red-600 border-red-200";
    case "completed": return "bg-blue-500/10 text-blue-600 border-blue-200";
    default: return "bg-amber-500/10 text-amber-600 border-amber-200";
  }
};

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUser(user);

    const [profileRes, bookingsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase
        .from("bookings")
        .select("id, start_date, end_date, total_price, status, created_at, product:products(id, title, image_url, category)")
        .eq("renter_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (bookingsRes.data) setBookings(bookingsRes.data as unknown as Booking[]);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Profile Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-7 w-7 text-muted-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {profile?.full_name || user?.email?.split("@")[0] || "User"}
            </h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bookings Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-5 w-5 text-foreground" />
            <h2 className="text-lg font-semibold text-foreground">My Bookings</h2>
            <span className="text-sm text-muted-foreground ml-1">({bookings.length})</span>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">You haven't made any bookings yet.</p>
                <Button variant="outline" onClick={() => navigate("/browse")}>
                  Browse Items
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const days = differenceInDays(new Date(booking.end_date), new Date(booking.start_date));
                return (
                  <Card key={booking.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        {/* Product Image */}
                        <div className="sm:w-32 h-32 sm:h-auto bg-muted flex-shrink-0">
                          {booking.product?.image_url ? (
                            <img
                              src={booking.product.image_url}
                              alt={booking.product.title || "Product"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium text-foreground">
                                {booking.product?.title || "Deleted Product"}
                              </h3>
                              <Badge variant="outline" className={statusColor(booking.status)}>
                                {booking.status || "pending"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(booking.start_date), "MMM d")} – {format(new Date(booking.end_date), "MMM d, yyyy")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {days} day{days !== 1 ? "s" : ""}
                              </span>
                            </div>
                            {booking.created_at && (
                              <p className="text-xs text-muted-foreground">
                                Booked on {format(new Date(booking.created_at), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-4">
                            <span className="text-xl font-semibold text-foreground">${booking.total_price}</span>
                            {booking.product && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/product/${booking.product!.id}`)}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
