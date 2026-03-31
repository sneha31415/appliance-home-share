import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="text-sm font-semibold tracking-tight text-foreground">
            RentIt
          </Link>

          <div className="flex items-center gap-1">
            <Link to="/browse" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary">
              Browse
            </Link>
            
            {user ? (
              <>
                <Link to="/list-item" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary">
                  List Item
                </Link>
                <Link to="/profile" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-secondary">
                  Profile
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-[13px] text-muted-foreground hover:text-foreground h-8 px-3">
                  <LogOut className="h-3.5 w-3.5 mr-1.5" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button size="sm" onClick={() => navigate("/auth")} className="text-[13px] h-8 px-3">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
