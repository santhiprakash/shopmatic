import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getShareStats, getShareHistory, ShareTrackingData } from "@/utils/shareTracking";
import { Share2, ExternalLink, Copy, BarChart3, Trash2, MessageCircle, Share as ShareIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const sourceIcons: Record<string, React.ReactNode> = {
  whatsapp: <MessageCircle className="h-4 w-4 text-green-500" />,
  twitter: <ShareIcon className="h-4 w-4 text-blue-400" />,
  facebook: <ShareIcon className="h-4 w-4 text-blue-600" />,
  linkedin: <ShareIcon className="h-4 w-4 text-blue-700" />,
  copy: <Copy className="h-4 w-4 text-gray-500" />,
};

const sourceLabels: Record<string, string> = {
  whatsapp: "WhatsApp",
  twitter: "Twitter/X",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  copy: "Copy Link",
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export default function SharedByMe() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReturnType<typeof getShareStats> | null>(null);
  const [history, setHistory] = useState<ShareTrackingData[]>([]);

  useEffect(() => {
    setStats(getShareStats());
    setHistory(getShareHistory());
  }, []);

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear your share history?")) {
      localStorage.removeItem('shopmatic-share-tracking');
      setStats(getShareStats());
      setHistory([]);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6 text-center">
              <Share2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Sign in to track your shares</h2>
              <p className="text-muted-foreground mb-6">
                Track how your shared links perform
              </p>
              <Link to="/login">
                <Button>Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Shared by Me</h1>
              <p className="text-muted-foreground">
                Track how your shared links are performing
              </p>
            </div>
            <Button variant="outline" onClick={handleClearHistory} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Clear History
            </Button>
          </div>

          {stats && stats.totalShares > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Shares
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{stats.totalShares}</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      All time shares
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Top Platform
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold flex items-center gap-2">
                      {Object.entries(stats.sharesBySource).sort(([, a], [, b]) => b - a)[0]?.[0] && (
                        <>
                          {sourceIcons[Object.entries(stats.sharesBySource).sort(([, a], [, b]) => b - a)[0][0]]}
                          {sourceLabels[Object.entries(stats.sharesBySource).sort(([, a], [, b]) => b - a)[0][0]]}
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Most used platform
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {history.filter(s => Date.now() - s.timestamp < 7 * 24 * 60 * 60 * 1000).length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Shares in last 7 days
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Share History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.slice().reverse().map((share, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background">
                            {sourceIcons[share.source] || <Share2 className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">
                              {share.collectionName || "Profile Link"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              via {sourceLabels[share.source] || share.source}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {formatTimeAgo(share.timestamp)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{share.sharerUsername}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Share by Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.sharesBySource)
                      .sort(([, a], [, b]) => b - a)
                      .map(([source, count]) => (
                        <div key={source} className="flex items-center gap-3">
                          <div className="w-24 flex items-center gap-2">
                            {sourceIcons[source]}
                            <span className="text-sm">{sourceLabels[source]}</span>
                          </div>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full"
                              style={{ width: `${(count / stats.totalShares) * 100}%` }}
                            />
                          </div>
                          <div className="w-12 text-right text-sm font-medium">
                            {count}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-12 pb-12 text-center">
                <Share2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-2">No shares yet</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Share your collections with friends and track how many people click your links.
                  When you share, the links will include your username so you get credit.
                </p>
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              </CardContent>
            </Card>
          )}

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>How Attribution Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                When you share a collection, your username is automatically added to the link as a ref parameter.
                For example: <code className="bg-muted px-1 py-0.5 rounded">https://shopmatic.cc/@username/collection?ref=yourusername</code>
              </p>
              <p>
                When someone clicks your link, they see your username as the sharer. This helps creators
                understand which sharers are driving the most engagement.
              </p>
              <p>
                Note: This tracks your shares locally. For full analytics with the collection owner seeing
                your attribution, a backend integration is needed.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
