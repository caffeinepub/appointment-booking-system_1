import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  Calendar,
  CalendarOff,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAvailableTimeSlots,
  useCreateAppointment,
} from "../../hooks/useQueries";
import type { UserProfile } from "../../hooks/useQueries";

interface Props {
  profile: UserProfile;
  onSuccess: () => void;
}

export default function BookAppointment({ profile, onSuccess }: Props) {
  const { data: slots = [], isLoading } = useAvailableTimeSlots();
  const createAppointment = useCreateAppointment();

  const [selectedSlotId, setSelectedSlotId] = useState<bigint | null>(null);
  const [notes, setNotes] = useState("");
  const [success, setSuccess] = useState(false);

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;

  // Group by date
  const grouped: Record<string, typeof slots> = {};
  for (const slot of slots) {
    if (!grouped[slot.date]) grouped[slot.date] = [];
    grouped[slot.date].push(slot);
  }
  const sortedDates = Object.keys(grouped).sort();

  const handleSubmit = async () => {
    if (!selectedSlot) {
      toast.error("Please select a time slot");
      return;
    }
    if (!profile.customerNumber) {
      toast.error("Your account is missing a customer number. Contact admin.");
      return;
    }
    try {
      await createAppointment.mutateAsync({
        customerName: profile.name,
        customerNumber: profile.customerNumber,
        date: selectedSlot.date,
        time: selectedSlot.time,
        notes: notes.trim(),
      });
      setSuccess(true);
      toast.success("Appointment booked successfully!");
      setTimeout(() => {
        setSuccess(false);
        setSelectedSlotId(null);
        setNotes("");
        onSuccess();
      }, 2000);
    } catch {
      toast.error("Failed to book appointment");
    }
  };

  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20"
        data-ocid="book.success_state"
      >
        <div className="size-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <CheckCircle className="size-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          Booking Submitted!
        </h3>
        <p className="text-sm text-muted-foreground">
          Your appointment request has been sent for review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Book an Appointment
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Select an available time slot and submit your request.
        </p>
      </div>

      {/* Slot selection */}
      <div className="bg-card rounded-xl p-5 card-shadow">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Available Time Slots
        </h3>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8" data-ocid="book.empty_state">
            <CalendarOff className="size-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">
              No available slots
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Check back later or contact the office
            </p>
          </div>
        ) : (
          <div className="space-y-4" data-ocid="book.slots.list">
            {sortedDates.map((dateKey) => (
              <div key={dateKey}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="size-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground">
                    {dateKey}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {grouped[dateKey]
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((slot, idx) => (
                      <button
                        type="button"
                        key={String(slot.id)}
                        onClick={() => setSelectedSlotId(slot.id)}
                        data-ocid={`book.slot.${idx + 1}`}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                          selectedSlotId === slot.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/40 hover:bg-accent text-foreground",
                        )}
                      >
                        <Clock className="size-3.5" />
                        {slot.time}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {selectedSlot && (
        <div className="bg-card rounded-xl p-5 card-shadow space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">
              Your Selection
            </h3>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {selectedSlot.date}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="size-3.5" />
                {selectedSlot.time}
              </span>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information for your appointment..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-ocid="book.notes.textarea"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createAppointment.isPending}
            className="w-full h-11 font-semibold"
            data-ocid="book.submit_button"
            style={{ backgroundColor: "oklch(0.30 0.09 249)", color: "white" }}
          >
            {createAppointment.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Appointment Request"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
