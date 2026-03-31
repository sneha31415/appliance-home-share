import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [signupForm, setSignupForm] = useState({ email: "", password: "", fullName: "" });

  useEffect(() => {
    checkUser();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) navigate("/");
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) navigate("/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password,
      });
      if (error) throw error;
      toast.success("Welcome back!");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password,
        options: {
          data: { full_name: signupForm.fullName },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">Welcome to RentIt</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Sign in or create an account to continue.</p>
        </div>

        <div className="border border-border rounded-lg p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 h-9">
              <TabsTrigger value="login" className="text-[13px]">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="text-[13px]">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-[13px]">Email</Label>
                  <Input id="login-email" type="email" required value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} placeholder="you@example.com" className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-[13px]">Password</Label>
                  <Input id="login-password" type="password" required value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} placeholder="••••••••" className="h-9 text-[13px]" />
                </div>
                <Button type="submit" className="w-full h-9 text-[13px]" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Signing in…</> : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-name" className="text-[13px]">Full Name</Label>
                  <Input id="signup-name" type="text" required value={signupForm.fullName} onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })} placeholder="John Doe" className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-[13px]">Email</Label>
                  <Input id="signup-email" type="email" required value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} placeholder="you@example.com" className="h-9 text-[13px]" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-[13px]">Password</Label>
                  <Input id="signup-password" type="password" required value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} placeholder="••••••••" minLength={6} className="h-9 text-[13px]" />
                </div>
                <Button type="submit" className="w-full h-9 text-[13px]" disabled={loading}>
                  {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Creating…</> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;
