import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AtSign, Check, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkUsernameAvailability,
  getPublicPageUrl,
  normalizeUsername,
  USERNAME_HINT,
  validateUsername,
} from "@/utils/username";

interface HandleSetupStepProps {
  onNext: () => void;
}

export default function HandleSetupStep({ onNext }: HandleSetupStepProps) {
  const { user, updateProfile } = useAuth();
  const [handle, setHandle] = useState(user?.username || "");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const username = normalizeUsername(handle);
    if (!username) {
      setStatus("idle");
      setMessage("");
      return;
    }

    if (user?.username && username === user.username) {
      setStatus("available");
      setMessage("This is your current handle");
      return;
    }

    const local = validateUsername(username);
    if (!local.valid) {
      setStatus("invalid");
      setMessage(local.error || USERNAME_HINT);
      return;
    }

    let cancelled = false;
    setStatus("checking");
    const timer = window.setTimeout(async () => {
      const result = await checkUsernameAvailability(username);
      if (cancelled) return;
      if (result.available) {
        setStatus("available");
        setMessage("Available");
      } else {
        setStatus("taken");
        setMessage(result.reason || "Not available");
      }
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [handle, user?.username]);

  const handleSave = async () => {
    const username = normalizeUsername(handle);
    const local = validateUsername(username);
    if (!local.valid) {
      setStatus("invalid");
      setMessage(local.error || USERNAME_HINT);
      return;
    }

    if (user?.username === username) {
      onNext();
      return;
    }

    if (status !== "available") {
      return;
    }

    setSaving(true);
    try {
      await updateProfile({ username });
      onNext();
    } catch {
      setStatus("taken");
      setMessage("Could not save this handle. Try another.");
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = handle.trim() ? getPublicPageUrl(handle) : null;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <AtSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">Choose your public handle</h2>
        <p className="text-muted-foreground">
          This is your shop URL. You need one before you can share your page.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Public handle</CardTitle>
          <CardDescription>
            {USERNAME_HINT}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="public-handle">Handle</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="public-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="your-name"
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="flex items-center gap-2 min-h-[1.25rem] text-sm">
              {status === "checking" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground">Checking availability…</span>
                </>
              )}
              {status === "available" && (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-700 dark:text-green-400">{message}</span>
                </>
              )}
              {(status === "taken" || status === "invalid") && (
                <>
                  <X className="h-3.5 w-3.5 text-destructive" />
                  <span className="text-destructive">{message}</span>
                </>
              )}
            </div>
          </div>

          {previewUrl && (
            <div className="rounded-md border bg-muted/50 px-3 py-2 text-sm">
              <p className="text-muted-foreground">Your public page</p>
              <p className="font-medium break-all">{previewUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button
          onClick={handleSave}
          size="lg"
          className="min-w-[120px]"
          disabled={saving || status !== "available"}
        >
          {saving ? "Saving…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
