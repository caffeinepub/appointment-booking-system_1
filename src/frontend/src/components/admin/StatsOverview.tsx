import { Skeleton } from "@/components/ui/skeleton";
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useAppointmentStats } from "../../hooks/useQueries";
import type { UserProfile } from "../../hooks/useQueries";

interface Props {
  profile: UserProfile;
  onNavigate: (section: string) => void;
}

export default function StatsOverview({ profile, onNavigate }: Props) {
  const { data: stats, isLoading } = useAppointmentStats();

  const cards = [
    {
      label: "Pending",
      value: stats ? Number(stats.pending) : 0,
      icon: CalendarDays,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      highlight: stats && Number(stats.pending) > 0,
    },
    {
      label: "Accepted",
      value: stats ? Number(stats.accepted) : 0,
      icon: CheckCircle2,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      highlight: false,
    },
    {
      label: "Completed",
      value: stats ? Number(stats.completed) : 0,
      icon: Archive,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      highlight: false,
    },
    {
      label: "Rejected",
      value: stats ? Number(stats.rejected) : 0,
      icon: XCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      highlight: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          Welcome back, {profile.name.split(" ")[0]} 👋
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Here's an overview of appointment activity.
        </p>
      </div>

      {/* Stats cards */}
      <div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        data-ocid="dashboard.stats.section"
      >
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <button
              type="button"
              key={card.label}
              data-ocid={`dashboard.stats.card.${i + 1}`}
              className={`bg-card rounded-xl p-5 card-shadow transition-all hover:card-shadow-md cursor-pointer text-left w-full ${
                card.highlight ? "ring-2 ring-yellow-400/60" : ""
              }`}
              onClick={() => onNavigate("appointments")}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </span>
                <div
                  className={`size-9 rounded-lg ${card.iconBg} flex items-center justify-center`}
                >
                  <Icon className={`size-4 ${card.iconColor}`} />
                </div>
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  {card.value}
                </p>
              )}
              {card.highlight && (
                <p className="text-xs text-yellow-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="size-3" /> Needs attention
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="bg-card rounded-xl p-6 card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onNavigate("appointments")}
            data-ocid="dashboard.appointments.button"
            className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
          >
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <CalendarDays className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Manage Appointments
              </p>
              <p className="text-xs text-muted-foreground">
                Review pending requests
              </p>
            </div>
          </button>
          {profile.role === "admin" && (
            <button
              type="button"
              onClick={() => onNavigate("users")}
              data-ocid="dashboard.users.button"
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors text-left"
            >
              <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="size-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  User Management
                </p>
                <p className="text-xs text-muted-foreground">
                  Add or edit users
                </p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
