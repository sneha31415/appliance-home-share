import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Upload, Loader2, Star } from "lucide-react";

const ListItem = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [formData, setFormData] = useState({
    title: "", description: "", category: "", price_per_day: "", price_per_week: "", price_per_month: "", condition: "", location: "",
  });

  useEffect(() => { checkUser(); }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Please sign in to list an item"); navigate("/auth"); } else { setUser(user); }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const fileExt = imageFile.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage.from("products").upload(filePath, imageFile);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(filePath);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let imageUrl = null;
      if (imageFile) imageUrl = await uploadImage();
      const { error } = await supabase.from("products").insert({
        owner_id: user.id, title: formData.title, description: formData.description, category: formData.category,
        price_per_day: parseFloat(formData.price_per_day),
        price_per_week: formData.price_per_week ? parseFloat(formData.price_per_week) : null,
        price_per_month: formData.price_per_month ? parseFloat(formData.price_per_month) : null,
        condition: formData.condition, location: formData.location, image_url: imageUrl, is_featured: isFeatured,
      });
      if (error) throw error;
      toast.success("Item listed successfully!");
      navigate("/browse");
    } catch (error: any) {
      toast.error(error.message || "Failed to list item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-foreground tracking-tight">List Your Item</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Fill in the details to list your item for rent.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Image Upload */}
          <div>
            <Label className="text-[13px]">Product Image</Label>
            <div className="mt-1.5">
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg border border-border" />
                  <Button type="button" variant="outline" size="sm" className="absolute top-2 right-2 h-7 text-[12px]" onClick={() => { setImageFile(null); setImagePreview(""); }}>
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-48 border border-dashed border-border rounded-lg cursor-pointer hover:border-foreground/30 transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-[12px] text-muted-foreground">Click to upload</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[13px]">Title *</Label>
            <Input id="title" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="e.g., Modern Sofa Set" className="h-9 text-[13px]" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[13px]">Description *</Label>
            <Textarea id="description" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your item…" rows={3} className="text-[13px]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Category *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="furniture">Furniture</SelectItem>
                  <SelectItem value="appliances">Appliances</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Condition *</Label>
              <Select value={formData.condition} onValueChange={(v) => setFormData({ ...formData, condition: v })}>
                <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-[13px]">Location *</Label>
            <Input id="location" required value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="City, State" className="h-9 text-[13px]" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[13px]">Price/Day *</Label>
              <Input type="number" step="0.01" required value={formData.price_per_day} onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })} placeholder="0.00" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Price/Week</Label>
              <Input type="number" step="0.01" value={formData.price_per_week} onChange={(e) => setFormData({ ...formData, price_per_week: e.target.value })} placeholder="0.00" className="h-9 text-[13px]" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[13px]">Price/Month</Label>
              <Input type="number" step="0.01" value={formData.price_per_month} onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })} placeholder="0.00" className="h-9 text-[13px]" />
            </div>
          </div>

          {/* Featured listing */}
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Checkbox id="featured" checked={isFeatured} onCheckedChange={(c) => setIsFeatured(c === true)} className="mt-0.5" />
              <div>
                <Label htmlFor="featured" className="text-[13px] font-medium cursor-pointer flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-[hsl(var(--featured))] fill-[hsl(var(--featured))]" />
                  Featured Listing — ₹200
                </Label>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Your item appears at the top of browse results.
                </p>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full h-9 text-[13px]" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Listing…</> : "List Item"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ListItem;
