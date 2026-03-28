import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { useState } from "react";
import LoginPage from "./components/LoginPage";
import SetupAdminPage from "./components/SetupAdminPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import CustomerDashboard from "./components/customer/CustomerDashboard";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useCallerProfile } from "./hooks/useQueries";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: profile, isLoading: profileLoading } = useCallerProfile();
  const { actor, isFetching: actorFetching } = useActor();
  const [activeSection, setActiveSection] = useState("dashboard");

  // Check if admin has been bootstrapped (only when user is logged in but has no profile)
  const { data: adminBootstrapped, isLoading: bootstrapLoading } = useQuery({
    queryKey: ["isAdminBootstrapped"],
    queryFn: async () => {
      if (!actor) return true; // default to true to avoid showing setup unnecessarily
      return actor.isAdminBootstrapped();
    },
    enabled: !!actor && !actorFetching && !profileLoading && profile === null,
  });

  if (
    isInitializing ||
    (identity && (profileLoading || (profile === null && bootstrapLoading)))
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
              <div className="size-4 rounded-full bg-primary animate-pulse" />
            </div>
            <span className="text-lg font-semibold text-foreground">
              AppointMate
            </span>
          </div>
          <Skeleton className="h-2 w-32" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster />
      </>
    );
  }

  if (!profile) {
    // No admin yet -- show first-run setup
    if (adminBootstrapped === false) {
      return (
        <>
          <SetupAdminPage principalId={identity.getPrincipal().toString()} />
          <Toaster />
        </>
      );
    }

    // Admin exists but this user has no account
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="max-w-md mx-auto text-center p-8 bg-card rounded-lg card-shadow">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <User className="size-8 text-primary" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Account Not Found
          </h2>
          <p className="text-muted-foreground text-sm">
            Your account has not been set up yet. Please contact an
            administrator to have your account created.
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            Principal: {identity.getPrincipal().toString().slice(0, 20)}...
          </p>
        </div>
      </div>
    );
  }

  const role = profile.role;

  if (role === "customer") {
    return (
      <>
        <CustomerDashboard
          profile={profile}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <AdminDashboard
        profile={profile}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <Toaster />
    </>
  );
}
