import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "../backend.d";

interface StatusBadgeProps {
  status: AppointmentStatus | string;
  className?: string;
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles: Record<string, string> = {
    pending: "status-pending",
    accepted: "status-accepted",
    rejected: "status-rejected",
    completed: "status-completed",
  };

  const labels: Record<string, string> = {
    pending: "PENDING",
    accepted: "ACCEPTED",
    rejected: "REJECTED",
    completed: "COMPLETED",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide",
        styles[status] ?? "status-completed",
        className,
      )}
    >
      {labels[status] ?? status}
    </span>
  );
}
