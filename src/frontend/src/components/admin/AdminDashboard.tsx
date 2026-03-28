import {
  Bell,
  CalendarDays,
  Clock,
  LayoutDashboard,
  Users,
} from "lucide-react";
import type { UserProfile } from "../../hooks/useQueries";
import { useAppointmentStats } from "../../hooks/useQueries";
import Sidebar from "../Sidebar";
import AppointmentsTab from "./AppointmentsTab";
import StatsOverview from "./StatsOverview";
import TimeSlots from "./TimeSlots";
import UserManagement from "./UserManagement";

interface Props {
  profile: UserProfile;
  activeSection: string;
  setActiveSection: (s: string) => void;
}

export default function AdminDashboard({
  profile,
  activeSection,
  setActiveSection,
}: Props) {
  const { data: stats } = useAppointmentStats();
  const pendingCount = stats ? Number(stats.pending) : 0;
  const isAdmin = profile.role === "admin";

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="size-4" />,
    },
    {
      id: "appointments",
      label: "Appointments",
      icon: <CalendarDays className="size-4" />,
      badge: pendingCount,
    },
    ...(isAdmin
      ? [
          {
            id: "users",
            label: "User Management",
            icon: <Users className="size-4" />,
          },
          {
            id: "timeslots",
            label: "Time Slots",
            icon: <Clock className="size-4" />,
          },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <StatsOverview profile={profile} onNavigate={setActiveSection} />
        );
      case "appointments":
        return <AppointmentsTab />;
      case "users":
        return isAdmin ? <UserManagement /> : null;
      case "timeslots":
        return isAdmin ? <TimeSlots /> : null;
      default:
        return (
          <StatsOverview profile={profile} onNavigate={setActiveSection} />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        items={navItems}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        profile={profile}
        notificationCount={pendingCount}
      />

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {/* Header */}
        <div className="sticky top-0 lg:top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground capitalize">
              {activeSection === "timeslots"
                ? "Time Slots"
                : activeSection === "users"
                  ? "User Management"
                  : activeSection.charAt(0).toUpperCase() +
                    activeSection.slice(1)}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button
                type="button"
                onClick={() => setActiveSection("appointments")}
                className="relative p-2 rounded-lg hover:bg-accent transition-colors"
                data-ocid="header.notification.button"
              >
                <Bell className="size-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 size-5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingCount}
                </span>
              </button>
            )}
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {profile.name}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {profile.role === "pa" ? "Personal Assistant" : profile.role}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">{renderContent()}</div>
      </main>
    </div>
  );
}
