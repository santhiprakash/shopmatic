import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Copy, ExternalLink, Loader2, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  checkUsernameAvailability,
  getPublicPageUrl,
  normalizeUsername,
  USERNAME_HINT,
  validateUsername,
} from "@/utils/username";
import { generateShareUrl, recordShare } from "@/utils/shareTracking";
import { markPageShared } from "@/components/onboarding/SharePageStep";
import { toast } from "sonner";

export default function PublicHandleCard() {
  const { user, updateProfile, isDemo } = useAuth();
  const [editing, setEditing] = useState(!user?.username);
  const [handle, setHandle] = useState(user?.username || "");
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setHandle(user?.username || "");
    if (!user?.username) {
      setEditing(true);
    }
  }, [user?.username]);

  useEffect(() => {
    if (!editing) return;
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
    if (isDemo) {
      setStatus("available");
      setMessage("Available in this demo session");
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
  }, [handle, editing, user?.username, isDemo]);

  const saveHandle = async () => {
    const username = normalizeUsername(handle);
    const local = validateUsername(username);
    if (!local.valid || status !== "available") return;
    if (user?.username === username) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ username });
      setEditing(false);
    } catch {
      setStatus("taken");
      setMessage("Could not save this handle. Try another.");
    } finally {
      setSaving(false);
    }
  };

  const pageUrl = user?.username ? getPublicPageUrl(user.username) : null;

  const copyLink = async () => {
    if (!pageUrl || !user?.username) return;
    const shareUrl = generateShareUrl(pageUrl, "copy", user.username);
    try {
      await navigator.clipboard.writeText(shareUrl);
      recordShare({ sharerUsername: user.username, source: "copy" });
      markPageShared();
      setCopied(true);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const shareWhatsApp = () => {
    if (!pageUrl || !user?.username) return;
    const shareUrl = generateShareUrl(pageUrl, "whatsapp", user.username);
    recordShare({ sharerUsername: user.username, source: "whatsapp" });
    markPageShared();
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Check out my recommendations: ${shareUrl}`)}`,
      "_blank"
    );
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Public page</CardTitle>
        <CardDescription>
          Your handle is the URL people share: shopmatic.cc/@your-name
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pageUrl && !editing && (
          <div className="space-y-3">
            <div className="rounded-md border bg-muted/50 px-3 py-2 font-medium break-all">
              {pageUrl}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={copyLink} variant="outline" size="sm">
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
              <Button onClick={shareWhatsApp} variant="outline" size="sm">
                WhatsApp
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={pageUrl} target="_blank" rel="noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open
                </a>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                Change handle
              </Button>
            </div>
          </div>
        )}

        {editing && (
          <div className="space-y-3">
            {isDemo && (
              <p className="text-sm text-muted-foreground">
                Demo mode saves the handle only in this session.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="profile-handle">Public handle</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                <Input
                  id="profile-handle"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="your-name"
                  autoComplete="off"
                />
              </div>
              <p className="text-xs text-muted-foreground">{USERNAME_HINT}</p>
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
            <div className="flex gap-2">
              <Button onClick={saveHandle} disabled={saving || status !== "available"}>
                {saving ? "Saving…" : "Save handle"}
              </Button>
              {user?.username && (
                <Button variant="ghost" onClick={() => { setEditing(false); setHandle(user.username || ""); }}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
