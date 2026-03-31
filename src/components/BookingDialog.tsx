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
import { format, differenceInDays, differenceInWeeks, differenceInMonths, addDays } from "date-fns";
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
    if (product.price_per_week) {
      plans.push({ value: "week", label: "Weekly", price: product.price_per_week, unit: "/week" });
    }
    if (product.price_per_month) {
      plans.push({ value: "month", label: "Monthly", price: product.price_per_month, unit: "/month" });
    }
    return plans;
  }, [product]);

  const totalPrice = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(endDate, startDate);
    if (days <= 0) return 0;

    if (plan === "day") return days * product.price_per_day;
    if (plan === "week") {
      const weeks = Math.ceil(days / 7);
      return weeks * (product.price_per_week || product.price_per_day * 7);
    }
    if (plan === "month") {
      const months = Math.max(1, differenceInMonths(endDate, startDate));
      return months * (product.price_per_month || product.price_per_day * 30);
    }
    return 0;
  }, [startDate, endDate, plan, product]);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return "";
    const days = differenceInDays(endDate, startDate);
    if (days <= 0) return "";
    if (plan === "day") return `${days} day${days > 1 ? "s" : ""}`;
    if (plan === "week") {
      const weeks = Math.ceil(days / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""}`;
    }
    const months = Math.max(1, differenceInMonths(endDate, startDate));
    return `${months} month${months > 1 ? "s" : ""}`;
  }, [startDate, endDate, plan]);

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates");
      return;
    }
    if (differenceInDays(endDate, startDate) <= 0) {
      toast.error("End date must be after start date");
      return;
    }
    if (!address.trim() || !city.trim()) {
      toast.error("Please enter your delivery address");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        product_id: product.id,
        renter_id: userId,
        start_date: format(startDate, "yyyy-MM-dd"),
        end_date: format(endDate, "yyyy-MM-dd"),
        total_price: totalPrice,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Booking request submitted!", {
        description: `Your booking for "${product.title}" has been placed.`,
      });
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast.error("Failed to create booking", { description: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setPlan("day");
    setStartDate(undefined);
    setEndDate(undefined);
    setAddress("");
    setCity("");
    setZipCode("");
    setNotes("");
  };

  const isOwnProduct = userId === product.owner_id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Book "{product.title}"</DialogTitle>
          <DialogDescription>Choose your rental plan and delivery details.</DialogDescription>
        </DialogHeader>

        {isOwnProduct ? (
          <p className="text-sm text-muted-foreground py-4">You cannot book your own product.</p>
        ) : (
          <div className="space-y-6 pt-2">
            {/* Pricing Plan */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Rental Plan</Label>
              <RadioGroup value={plan} onValueChange={(v) => setPlan(v as PricingPlan)} className="grid gap-2">
                {availablePlans.map((p) => (
                  <label
                    key={p.value}
                    className={cn(
                      "flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors",
                      plan === p.value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <RadioGroupItem value={p.value} />
                      <span className="font-medium">{p.label}</span>
                    </div>
                    <span className="font-semibold">${p.price}{p.unit}</span>
                  </label>
                ))}
              </RadioGroup>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={startDate} onSelect={setStartDate} disabled={(date) => date < new Date()} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "MMM d, yyyy") : "Pick date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={endDate} onSelect={setEndDate} disabled={(date) => date < (startDate || new Date())} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Delivery Address
              </Label>
              <Input placeholder="Street address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} />
                <Input placeholder="ZIP code" value={zipCode} onChange={(e) => setZipCode(e.target.value)} maxLength={10} />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Additional Notes (optional)</Label>
              <Textarea placeholder="Any special instructions for delivery..." value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} maxLength={500} />
            </div>

            {/* Summary */}
            {startDate && endDate && differenceInDays(endDate, startDate) > 0 && (
              <div className="rounded-lg bg-secondary/50 p-4 space-y-2">
                <h4 className="font-medium text-sm">Booking Summary</h4>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Duration</span>
                  <span>{duration}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Plan</span>
                  <span className="capitalize">{plan}ly</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button className="w-full" size="lg" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : `Confirm Booking — $${totalPrice.toFixed(2)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDialog;
