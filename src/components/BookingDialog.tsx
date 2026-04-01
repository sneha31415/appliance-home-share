import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, MapPin, Loader2 } from "lucide-react";
import { format, differenceInDays, differenceInMonths } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: {
    id: string;
    title: string;
    price_per_day: number;
    price_per_week: number | null;
    price_per_month: number | null;
    owner_id: string;
  };
  userId: string;
}

type PricingPlan = "day" | "week" | "month";

const BookingDialog = ({ open, onOpenChange, product, userId }: BookingDialogProps) => {
  const [plan, setPlan] = useState<PricingPlan>("day");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const availablePlans = useMemo(() => {
    const plans: { value: PricingPlan; label: string; price: number; unit: string }[] = [
      { value: "day", label: "Daily", price: product.price_per_day, unit: "/day" },
    ];
    if (product.price_per_week) plans.push({ value: "week", label: "Weekly", price: product.price_per_week, unit: "/week" });
    if (product.price_per_month) plans.push({ value: "month", label: "Monthly", price: product.price_per_month, unit: "/month" });
    return plans;
  }, [product]);

  const totalPrice = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(endDate, startDate);
    if (days <= 0) return 0;
    if (plan === "day") return days * product.price_per_day;
    if (plan === "week") { const weeks = Math.ceil(days / 7); return weeks * (product.price_per_week || product.price_per_day * 7); }
    if (plan === "month") { const months = Math.max(1, differenceInMonths(endDate, startDate)); return months * (product.price_per_month || product.price_per_day * 30); }
    return 0;
  }, [startDate, endDate, plan, product]);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "";
    const days = differenceInDays(endDate, startDate);
    if (days <= 0) return "";
    if (plan === "day") return `${days} day${days > 1 ? "s" : ""}`;
    if (plan === "week") { const w = Math.ceil(days / 7); return `${w} week${w > 1 ? "s" : ""}`; }
    const m = Math.max(1, differenceInMonths(endDate, startDate));
    return `${m} month${m > 1 ? "s" : ""}`;
  }, [startDate, endDate, plan]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) { toast.error("Please select start and end dates"); return; }
    if (differenceInDays(endDate, startDate) <= 0) { toast.error("End date must be after start date"); return; }
    if (!address.trim() || !city.trim()) { toast.error("Please enter your delivery address"); return; }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        product_id: product.id, renter_id: userId,
        start_date: format(startDate, "yyyy-MM-dd"), end_date: format(endDate, "yyyy-MM-dd"),
        total_price: totalPrice, status: "pending",
      });
      if (error) throw error;
      toast.success("Booking request submitted!", { description: `Your booking for "${product.title}" has been placed.` });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error("Failed to create booking", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => { setPlan("day"); setStartDate(undefined); setEndDate(undefined); setAddress(""); setCity(""); setZipCode(""); setNotes(""); };

  const isOwnProduct = userId === product.owner_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Book "{product.title}"</DialogTitle>
          <DialogDescription className="text-[13px]">Choose a plan and delivery details.</DialogDescription>
        </DialogHeader>

        {isOwnProduct ? (
          <p className="text-[13px] text-muted-foreground py-4">You cannot book your own product.</p>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Plan */}
            <div className="space-y-2">
              <Label className="text-[13px]">Rental Plan</Label>
              <RadioGroup value={plan} onValueChange={(v) => setPlan(v as PricingPlan)} className="space-y-1.5">
                {availablePlans.map((p) => (
                  <label
                    key={p.value}
                    className={cn(
                      "flex items-center justify-between rounded-md border p-3 cursor-pointer transition-colors text-[13px]",
                      plan === p.value ? "border-foreground bg-secondary" : "border-border hover:border-foreground/20"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <RadioGroupItem value={p.value} />
                      <span className="font-medium">{p.label}</span>
                    </div>
                    <span className="font-semibold">₹{p.price}{p.unit}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[13px]">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left h-9 text-[13px]", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(d) => d < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[13px]">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left h-9 text-[13px]", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(d) => d < (startDate || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label className="text-[13px] flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> Delivery Address
              </Label>
              <Input placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} className="h-9 text-[13px]" />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} className="h-9 text-[13px]" />
                <Input placeholder="ZIP" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={10} className="h-9 text-[13px]" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="text-[13px]">Notes (optional)</Label>
              <Textarea placeholder="Special delivery instructions…" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} maxLength={500} className="text-[13px]" />
            </div>

            {/* Summary */}
            {startDate && endDate && differenceInDays(endDate, startDate) > 0 && (
              <div className="rounded-md border border-border p-4 space-y-2 text-[13px]">
                <p className="font-medium text-foreground">Summary</p>
                <div className="flex justify-between text-muted-foreground">
                  <span>Duration</span><span>{duration}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Plan</span><span className="capitalize">{plan}ly</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-foreground">
                  <span>Total</span><span>₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button className="w-full h-9 text-[13px]" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> Processing…</> : `Confirm — $${totalPrice.toFixed(2)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
