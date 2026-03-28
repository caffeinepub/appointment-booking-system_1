import { Bell, CalendarDays, PlusCircle } from "lucide-react";
import type { UserProfile } from "../../hooks/useQueries";
import { useMyAppointments } from "../../hooks/useQueries";
import Sidebar from "../Sidebar";
import BookAppointment from "./BookAppointment";
import MyAppointments from "./MyAppointments";

interface Props {
  profile: UserProfile;
  activeSection: string;
  setActiveSection: (s: string) => void;
}

export default function CustomerDashboard({
  profile,
  activeSection,
  setActiveSection,
}: Props) {
  const { data: myAppointments = [] } = useMyAppointments();

  const now = Date.now();
  const lastSeen = Number(localStorage.getItem("appointmate_last_seen") ?? 0);
  const newUpdates = myAppointments.filter((a) => {
    const updated = Number(a.updatedAt) / 1_000_000;
    return (
      (a.status === "accepted" || a.status === "rejected") && updated > lastSeen
    );
  }).length;

  const navItems = [
    {
      id: "appointments",
      label: "My Appointments",
      icon: <CalendarDays className="size-4" />,
      badge: newUpdates,
    },
    {
      id: "book",
      label: "Book Appointment",
      icon: <PlusCircle className="size-4" />,
    },
  ];

  const handleSectionChange = (section: string) => {
    if (section === "appointments") {
      localStorage.setItem("appointmate_last_seen", String(now));
    }
    setActiveSection(section);
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        items={navItems}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        profile={profile}
        notificationCount={newUpdates}
      />

      <main className="flex-1 overflow-y-auto pt-14 lg:pt-0">
        {/* Header */}
        <div className="sticky top-0 lg:top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {activeSection === "book"
                ? "Book an Appointment"
                : "My Appointments"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {newUpdates > 0 && (
              <button
                type="button"
                onClick={() => handleSectionChange("appointments")}
                className="relative p-2 rounded-lg hover:bg-accent transition-colors"
                data-ocid="header.notification.button"
              >
                <Bell className="size-5 text-muted-foreground" />
                <span className="absolute -top-0.5 -right-0.5 size-5 bg-yellow-400 text-yellow-900 text-[10px] font-bold rounded-full flex items-center justify-center">
                  {newUpdates}
                </span>
              </button>
            )}
            <div className="h-8 w-px bg-border" />
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {profile.name}
              </p>
              {profile.customerNumber && (
                <p className="text-xs text-muted-foreground">
                  #{profile.customerNumber}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSection === "appointments" ? (
            <MyAppointments profile={profile} />
          ) : (
            <BookAppointment
              profile={profile}
              onSuccess={() => handleSectionChange("appointments")}
            />
          )}
        </div>
      </main>
    </div>
  );
}
