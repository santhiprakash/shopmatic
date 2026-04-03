import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");
  const token = searchParams.get("token");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setError("No verification token provided");
        return;
      }

      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Verification failed");
        }

        setStatus("success");
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 text-center">
          {status === "loading" && (
            <>
              <div className="mb-4 flex justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verifying Your Email</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your email address...
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-4 flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Email Verified!</h2>
              <p className="text-muted-foreground mb-6">
                Your email has been successfully verified. You can now access all features of your account.
              </p>
              <Link to="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-4 flex justify-center">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <div className="space-y-3">
                <Link to="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
                <p className="text-sm text-muted-foreground">
                  If you're having trouble, try requesting a new verification email.
                </p>
              </div>
            </>
          )}

          <div className="mt-6 pt-6 border-t">
            <Link to="/" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
              <Mail className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
