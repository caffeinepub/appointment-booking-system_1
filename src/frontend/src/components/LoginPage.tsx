import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Clock, Loader2, Shield } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  return (
    <div className="min-h-screen flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 sidebar-gradient flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center">
            <Shield className="size-5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">
            AppointMate
          </span>
        </div>

        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              Streamline Your
              <br />
              <span className="text-yellow-300">Appointment</span>
              <br />
              Workflow
            </h1>
            <p className="text-white/70 text-lg">
              Professional scheduling for teams who value their time.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Calendar, text: "Manage bookings effortlessly" },
              { icon: Clock, text: "Real-time status updates" },
              { icon: CheckCircle, text: "Role-based access control" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-white/15 flex items-center justify-center">
                  <Icon className="size-4 text-white" />
                </div>
                <span className="text-white/80 text-sm">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} AppointMate. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="underline"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="size-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">
              AppointMate
            </span>
          </div>

          <div className="bg-card rounded-2xl card-shadow-md p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Welcome back
              </h2>
              <p className="text-muted-foreground text-sm">
                Sign in with Internet Identity to access your dashboard.
              </p>
            </div>

            {isLoginError && (
              <div
                className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive"
                data-ocid="login.error_state"
              >
                {loginError?.message ?? "Login failed. Please try again."}
              </div>
            )}

            <Button
              onClick={login}
              disabled={isLoggingIn}
              className="w-full h-12 text-base font-semibold rounded-xl"
              style={{
                backgroundColor: "oklch(0.30 0.09 249)",
                color: "white",
              }}
              data-ocid="login.primary_button"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="mr-2 size-4" />
                  Sign in with Internet Identity
                </>
              )}
            </Button>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Secure, decentralized authentication via the Internet Computer
            </p>
          </div>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              className="underline hover:text-foreground transition-colors"
              target="_blank"
              rel="noreferrer"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
