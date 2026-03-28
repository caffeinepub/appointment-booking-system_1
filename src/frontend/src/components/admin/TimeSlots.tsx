import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useAddTimeSlot,
  useAllTimeSlots,
  useRemoveTimeSlot,
} from "../../hooks/useQueries";

export default function TimeSlots() {
  const { data: slots = [], isLoading } = useAllTimeSlots();
  const addSlot = useAddTimeSlot();
  const removeSlot = useRemoveTimeSlot();

  const [modalOpen, setModalOpen] = useState(false);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<bigint | null>(null);

  const handleAdd = async () => {
    if (!date || !time) {
      toast.error("Date and time are required");
      return;
    }
    try {
      await addSlot.mutateAsync({ date, time });
      toast.success("Time slot added");
      setDate("");
      setTime("");
      setModalOpen(false);
    } catch {
      toast.error("Failed to add slot");
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await removeSlot.mutateAsync(id);
      toast.success("Time slot removed");
      setDeleteConfirm(null);
    } catch {
      toast.error("Failed to remove slot");
    }
  };

  // Group slots by date
  const grouped: Record<string, typeof slots> = {};
  for (const slot of slots) {
    if (!grouped[slot.date]) grouped[slot.date] = [];
    grouped[slot.date].push(slot);
  }
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {slots.length} slots total
          </span>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          size="sm"
          data-ocid="timeslots.add_button"
          style={{ backgroundColor: "oklch(0.30 0.09 249)", color: "white" }}
        >
          <Plus className="size-4 mr-1" />
          Add Slot
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div
          className="text-center py-12 bg-card rounded-xl card-shadow"
          data-ocid="timeslots.empty_state"
        >
          <Clock className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">
            No time slots yet
          </p>
          <p className="text-xs text-muted-foreground">
            Add your first availability slot
          </p>
        </div>
      ) : (
        <div className="space-y-4" data-ocid="timeslots.list">
          {sortedDates.map((d) => (
            <div
              key={d}
              className="bg-card rounded-xl card-shadow overflow-hidden"
            >
              <div className="px-4 py-3 bg-muted/40 border-b border-border flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">
                  {d}
                </span>
              </div>
              <div className="p-3 flex flex-wrap gap-2">
                {grouped[d]
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((slot, idx) => (
                    <div
                      key={String(slot.id)}
                      data-ocid={`timeslots.item.${idx + 1}`}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${
                        slot.isBooked
                          ? "bg-muted/50 border-border text-muted-foreground"
                          : "bg-green-50 border-green-200 text-green-800"
                      }`}
                    >
                      <Clock className="size-3.5" />
                      <span>{slot.time}</span>
                      {slot.isBooked && (
                        <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                          Booked
                        </span>
                      )}
                      {!slot.isBooked && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(slot.id)}
                          data-ocid={`timeslots.delete_button.${idx + 1}`}
                          className="ml-1 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label="Remove slot"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Slot Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm" data-ocid="timeslots.dialog">
          <DialogHeader>
            <DialogTitle>Add Time Slot</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="slot-date">Date</Label>
              <Input
                id="slot-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                data-ocid="timeslots.date.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="slot-time">Time</Label>
              <Input
                id="slot-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                data-ocid="timeslots.time.input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              data-ocid="timeslots.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={addSlot.isPending}
              data-ocid="timeslots.submit_button"
              style={{
                backgroundColor: "oklch(0.30 0.09 249)",
                color: "white",
              }}
            >
              {addSlot.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Add Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent
          className="sm:max-w-sm"
          data-ocid="timeslots.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle>Remove Time Slot</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Remove this time slot? This cannot be undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              data-ocid="timeslots.delete.cancel_button"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                deleteConfirm !== null && handleDelete(deleteConfirm)
              }
              disabled={removeSlot.isPending}
              data-ocid="timeslots.delete.confirm_button"
            >
              {removeSlot.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
