import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SocialMediaManager from "@/components/profile/SocialMediaManager";
import PublicHandleCard from "@/components/profile/PublicHandleCard";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Calendar, Crown, Sparkles, Settings, Link2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DemoBanner from "@/components/auth/DemoBanner";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Link } from "react-router-dom";

function ProfileContent() {
  const { user, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("profile");

  const profileTabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "social", label: "Social Media", icon: Link2 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto py-8 px-4">
        <DemoBanner />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your profile information and social media links
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-2">
                <nav className="space-y-1">
                  {profileTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.id
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                  <Link
                    to="/settings"
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <>
                {/* User Info Card */}
                <Card className="mb-6">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold">
                          {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {user?.name || 'User'}
                            {isDemo && <Sparkles className="h-4 w-4 text-blue-500" />}
                            {user?.plan === 'pro' && <Crown className="h-4 w-4 text-yellow-500" />}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user?.email}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      {user?.plan && (
                        <Badge variant={user.plan === 'pro' ? 'default' : 'secondary'}>
                          {user.plan.toUpperCase()} Plan
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Member since:</span>
                        <span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Last login:</span>
                        <span>{user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <PublicHandleCard />
              </>
            )}

            {activeTab === "social" && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Profiles</CardTitle>
                  <CardDescription>
                    Connect your social media accounts to display them on your showcase page
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SocialMediaManager externalOpen={undefined} />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
