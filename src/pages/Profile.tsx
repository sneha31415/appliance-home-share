import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Calendar, Clock, ArrowRight } from "lucide-react";
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

const statusStyle = (status: string | null) => {
  switch (status) {
    case "confirmed": return "border-emerald-300 text-emerald-700 bg-emerald-50";
    case "cancelled": return "border-red-300 text-red-700 bg-red-50";
    case "completed": return "border-blue-300 text-blue-700 bg-blue-50";
    default: return "border-amber-300 text-amber-700 bg-amber-50";
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
    if (!user) { navigate("/auth"); return; }
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">
            {profile?.full_name || user?.email?.split("@")[0] || "User"}
          </h1>
          <p className="text-[13px] text-muted-foreground">{user?.email}</p>
        </div>

        {/* Bookings */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-foreground">My Bookings</h2>
            <span className="text-[12px] text-muted-foreground">{bookings.length} total</span>
          </div>

          {bookings.length === 0 ? (
            <div className="border border-border rounded-lg py-16 text-center">
              <Package className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground mb-4">No bookings yet.</p>
              <Button variant="outline" size="sm" onClick={() => navigate("/browse")} className="text-[13px] h-8">
                Browse Items
              </Button>
            </div>
          ) : (
            <div className="border border-border rounded-lg divide-y divide-border">
              {bookings.map((booking) => {
                const days = differenceInDays(new Date(booking.end_date), new Date(booking.start_date));
                return (
                  <div key={booking.id} className="flex items-center gap-4 p-4 hover:bg-secondary/50 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-md bg-secondary flex-shrink-0 overflow-hidden">
                      {booking.product?.image_url ? (
                        <img src={booking.product.image_url} alt={booking.product.title || ""} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="h-4 w-4 text-muted-foreground" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {booking.product?.title || "Deleted Product"}
                        </span>
                        <Badge variant="outline" className={`text-[11px] px-1.5 py-0 h-5 ${statusStyle(booking.status)}`}>
                          {booking.status || "pending"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.start_date), "MMM d")} – {format(new Date(booking.end_date), "MMM d")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {days}d
                        </span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-sm font-semibold text-foreground">${booking.total_price}</span>
                      {booking.product && (
                        <button
                          onClick={() => navigate(`/product/${booking.product!.id}`)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
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
