import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";
import { generateShareUrl, recordShare } from "@/utils/shareTracking";
import { getPublicPageUrl } from "@/utils/username";
import { toast } from "sonner";

const SHARED_FLAG_KEY = "shopmatic-page-shared";

interface SharePageStepProps {
  username: string;
  onComplete: () => void;
}

export function markPageShared() {
  localStorage.setItem(SHARED_FLAG_KEY, "true");
}

export function hasSharedPage(): boolean {
  return localStorage.getItem(SHARED_FLAG_KEY) === "true";
}

export default function SharePageStep({ username, onComplete }: SharePageStepProps) {
  const [copied, setCopied] = useState(false);
  const pageUrl = getPublicPageUrl(username);

  const copyLink = async () => {
    const shareUrl = generateShareUrl(pageUrl, "copy", username);
    try {
      await navigator.clipboard.writeText(shareUrl);
      recordShare({ sharerUsername: username, source: "copy" });
      markPageShared();
      setCopied(true);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const shareWhatsApp = () => {
    const shareUrl = generateShareUrl(pageUrl, "whatsapp", username);
    recordShare({ sharerUsername: username, source: "whatsapp" });
    markPageShared();
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`Check out my recommendations: ${shareUrl}`)}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <Share2 className="h-8 w-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="text-2xl font-bold">Your page is live</h2>
        <p className="text-muted-foreground">
          Copy the link and share it. That is your storefront.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Share link</CardTitle>
          <CardDescription>Anyone with this URL can view your recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/50 px-3 py-2 font-medium break-all">
            {pageUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={copyLink} variant="outline">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button onClick={shareWhatsApp} variant="outline">
              WhatsApp
            </Button>
            <Button asChild variant="outline">
              <a href={pageUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open page
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={onComplete} size="lg" className="min-w-[120px]">
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
