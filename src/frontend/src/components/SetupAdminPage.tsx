import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";

interface SetupAdminPageProps {
  principalId: string;
}

export default function SetupAdminPage({ principalId }: SetupAdminPageProps) {
  const { actor } = useActor();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (!actor) return;
    setLoading(true);
    try {
      await actor.bootstrapAdmin(name.trim());
      toast.success("Admin account created! Welcome.");
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("Admin already set up")) {
        toast.error(
          "An admin already exists. Contact them to add your account.",
        );
      } else {
        toast.error("Setup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="max-w-md w-full mx-auto p-8 bg-card rounded-xl shadow-md space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="size-7 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">
            First-Time Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            No admin account exists yet. Set yourself up as the first admin.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="admin-name">Your Full Name</Label>
            <Input
              id="admin-name"
              placeholder="e.g. John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSetup()}
            />
          </div>
          <div className="space-y-1 bg-muted/40 rounded-lg p-3">
            <p className="text-xs font-medium text-muted-foreground">
              Your Principal ID
            </p>
            <p className="text-xs font-mono text-foreground break-all">
              {principalId}
            </p>
          </div>
          <Button
            className="w-full"
            onClick={handleSetup}
            disabled={loading || !name.trim()}
            style={{ backgroundColor: "oklch(0.30 0.09 249)", color: "white" }}
          >
            {loading ? <Loader2 className="size-4 animate-spin mr-2" /> : null}
            Create Admin Account
          </Button>
        </div>
      </div>
    </div>
  );
}
