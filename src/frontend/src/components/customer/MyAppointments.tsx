import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  CalendarDays,
  Clock,
  FileText,
  Sparkles,
} from "lucide-react";
import { useMyAppointments } from "../../hooks/useQueries";
import type { UserProfile } from "../../hooks/useQueries";
import StatusBadge from "../StatusBadge";

interface Props {
  profile: UserProfile;
}

export default function MyAppointments({ profile }: Props) {
  const { data: appointments = [], isLoading } = useMyAppointments();

  const lastSeen = Number(localStorage.getItem("appointmate_last_seen") ?? 0);
  const sorted = [...appointments].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  const isNew = (appt: (typeof sorted)[0]) => {
    const updated = Number(appt.updatedAt) / 1_000_000;
    return (
      (appt.status === "accepted" || appt.status === "rejected") &&
      updated > lastSeen
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Hello, {profile.name.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Track all your appointment requests here.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="text-center py-16 bg-card rounded-xl card-shadow"
          data-ocid="myappointments.empty_state"
        >
          <CalendarDays className="size-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-base font-semibold text-foreground">
            No appointments yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Book your first appointment to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="myappointments.list">
          {sorted.map((appt, idx) => (
            <div
              key={String(appt.id)}
              data-ocid={`myappointments.item.${idx + 1}`}
              className={`bg-card rounded-xl p-5 card-shadow transition-all ${
                isNew(appt) ? "ring-2 ring-yellow-400/60" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={appt.status} />
                    {isNew(appt) && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                        <Sparkles className="size-3" />
                        Updated
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" />
                      <span className="text-sm">{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      <span className="text-sm">{appt.time}</span>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground mt-2 bg-muted/50 rounded-lg p-2">
                      <FileText className="size-3.5 shrink-0 mt-0.5" />
                      <span>{appt.notes}</span>
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <p className="text-xs text-muted-foreground">
                    #{appt.id.toString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
