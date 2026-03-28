import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Check,
  CheckCircle,
  Clock,
  FileText,
  Loader2,
  User,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppointmentStatus } from "../../backend.d";
import {
  useAcceptAppointment,
  useAllAppointments,
  useCompleteAppointment,
  useRejectAppointment,
} from "../../hooks/useQueries";
import type { Appointment } from "../../hooks/useQueries";
import StatusBadge from "../StatusBadge";

function AppointmentCard({
  appointment,
  showActions,
  showComplete,
  index,
}: {
  appointment: Appointment;
  showActions?: boolean;
  showComplete?: boolean;
  index: number;
}) {
  const accept = useAcceptAppointment();
  const reject = useRejectAppointment();
  const complete = useCompleteAppointment();

  const handleAccept = async () => {
    try {
      await accept.mutateAsync(appointment.id);
      toast.success(`Appointment accepted for ${appointment.customerName}`);
    } catch {
      toast.error("Failed to accept appointment");
    }
  };

  const handleReject = async () => {
    try {
      await reject.mutateAsync(appointment.id);
      toast.success("Appointment rejected");
    } catch {
      toast.error("Failed to reject appointment");
    }
  };

  const handleComplete = async () => {
    try {
      await complete.mutateAsync(appointment.id);
      toast.success("Appointment marked as completed");
    } catch {
      toast.error("Failed to complete appointment");
    }
  };

  const isBusy = accept.isPending || reject.isPending || complete.isPending;

  return (
    <div
      className="bg-card rounded-xl p-5 card-shadow hover:card-shadow-md transition-all"
      data-ocid={`appointments.item.${index}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <User className="size-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground text-sm">
              {appointment.customerName}
            </p>
            <p className="text-xs text-muted-foreground">
              #{appointment.customerNumber}
            </p>
          </div>
        </div>
        <StatusBadge status={appointment.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          <span>{appointment.date}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="size-3.5 shrink-0" />
          <span>{appointment.time}</span>
        </div>
      </div>

      {appointment.notes && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg p-2">
          <FileText className="size-3.5 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{appointment.notes}</span>
        </div>
      )}

      {showActions && (
        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isBusy}
            data-ocid={`appointments.accept_button.${index}`}
            className="flex-1 h-8 text-xs"
            style={{ backgroundColor: "oklch(0.30 0.09 249)", color: "white" }}
          >
            {accept.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <CheckCircle className="size-3 mr-1" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isBusy}
            data-ocid={`appointments.reject_button.${index}`}
            className="flex-1 h-8 text-xs border-destructive text-destructive hover:bg-destructive/10"
          >
            {reject.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <XCircle className="size-3 mr-1" />
            )}
            Reject
          </Button>
        </div>
      )}

      {showComplete && (
        <div className="pt-2 border-t border-border">
          <Button
            size="sm"
            variant="outline"
            onClick={handleComplete}
            disabled={isBusy}
            data-ocid={`appointments.complete_button.${index}`}
            className="w-full h-8 text-xs"
          >
            {complete.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Check className="size-3 mr-1" />
            )}
            Mark as Completed
          </Button>
        </div>
      )}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div
      className="text-center py-12"
      data-ocid={`appointments.${label.toLowerCase()}.empty_state`}
    >
      <div className="size-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
        <Calendar className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">
        No {label} appointments
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        They'll appear here when available
      </p>
    </div>
  );
}

export default function AppointmentsTab() {
  const [activeTab, setActiveTab] = useState("pending");
  const { data: appointments = [], isLoading } = useAllAppointments();

  const sorted = [...appointments].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const byStatus = (status: AppointmentStatus) =>
    sorted.filter((a) => a.status === status);

  const pending = byStatus(AppointmentStatus.pending);
  const accepted = byStatus(AppointmentStatus.accepted);
  const completed = byStatus(AppointmentStatus.completed);
  const rejected = byStatus(AppointmentStatus.rejected);

  const tabDef = [
    {
      value: "pending",
      label: "Pending",
      count: pending.length,
      items: pending,
      showActions: true,
      showComplete: false,
    },
    {
      value: "accepted",
      label: "Accepted",
      count: accepted.length,
      items: accepted,
      showActions: false,
      showComplete: true,
    },
    {
      value: "completed",
      label: "Completed",
      count: completed.length,
      items: completed,
      showActions: false,
      showComplete: false,
    },
    {
      value: "rejected",
      label: "Rejected",
      count: rejected.length,
      items: rejected,
      showActions: false,
      showComplete: false,
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList
          className="bg-card border border-border rounded-xl p-1 h-auto"
          data-ocid="appointments.tabs"
        >
          {tabDef.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              data-ocid={`appointments.${tab.value}.tab`}
              className="rounded-lg px-4 py-1.5 text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-white"
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1.5 text-[10px] bg-current/10 rounded-full px-1.5 py-0.5">
                  {tab.count}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabDef.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : tab.items.length === 0 ? (
              <EmptyState label={tab.label} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {tab.items.map((appt, idx) => (
                  <AppointmentCard
                    key={String(appt.id)}
                    appointment={appt}
                    showActions={tab.showActions}
                    showComplete={tab.showComplete}
                    index={idx + 1}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
