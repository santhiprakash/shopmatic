import { useMemo, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";
import DemoBanner from "@/components/auth/DemoBanner";
import AddProductForm from "@/components/products/AddProductForm";
import AffiliateIdManager from "@/components/affiliate/AffiliateIdManager";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Copy, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublicPageUrl } from "@/utils/username";
import { generateShareUrl, recordShare } from "@/utils/shareTracking";
import { hasSharedPage, markPageShared } from "@/components/onboarding/SharePageStep";
import { toast } from "sonner";

export default function Dashboard() {
  const { products, categories, tags } = useProducts();
  const { user } = useAuth();
  const [shared, setShared] = useState(hasSharedPage());

  const hasHandle = Boolean(user?.username);
  const hasProduct = products.length >= 1;
  const pageUrl = user?.username ? getPublicPageUrl(user.username) : null;

  const copyShareLink = async () => {
    if (!pageUrl || !user?.username) return;
    const shareUrl = generateShareUrl(pageUrl, "copy", user.username);
    try {
      await navigator.clipboard.writeText(shareUrl);
      recordShare({ sharerUsername: user.username, source: "copy" });
      markPageShared();
      setShared(true);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  const categoryCounts = useMemo(() => categories.map((category) => ({
    name: category,
    count: products.filter((p) => p.categories.includes(category)).length,
  })), [categories, products]);

  const tagCounts = useMemo(() => tags.map((tag) => ({
    name: tag,
    count: products.filter((p) => p.tags.includes(tag)).length,
  })), [tags, products]);

  const COLORS = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#8B5CF6", // violet-500
    "#EC4899", // pink-500
    "#6366F1", // indigo-500
    "#EF4444", // red-500
    "#14B8A6", // teal-500
    "#F97316", // orange-500
    "#6B7280", // gray-500
  ];

  const currencyData = useMemo(() => {
    const currencyCounts = products.reduce((acc, product) => {
      acc[product.currency] = (acc[product.currency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(currencyCounts).map(([currency, count]) => ({
      name: currency,
      value: count,
    }));
  }, [products]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main id="main-content" className="flex-1 container py-6">
        <DemoBanner />
        
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Track your affiliate marketing performance
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ThemeCustomizer />
          </div>
        </div>

        <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Getting started
            </CardTitle>
            <CardDescription>
              Handle, one product, then share your page. Affiliate IDs and theme are optional.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border-2 ${hasHandle ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-start gap-3">
                  {hasHandle ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Choose public handle</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasHandle
                        ? `Your page is /@${user?.username}`
                        : 'Pick the URL people will share.'}
                    </p>
                    {!hasHandle && (
                      <Button asChild size="sm">
                        <Link to="/profile">Choose your public handle</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${hasProduct ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-start gap-3">
                  {hasProduct ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Add first product</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasProduct
                        ? `${products.length} product${products.length === 1 ? '' : 's'} in your catalog.`
                        : 'Add one product so the page is not empty.'}
                    </p>
                    {!hasProduct && <AddProductForm />}
                  </div>
                </div>
              </div>

              <div className={`p-4 rounded-lg border-2 ${shared && hasHandle ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                <div className="flex items-start gap-3">
                  {shared && hasHandle ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Share your page</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {hasHandle
                        ? pageUrl
                        : 'Available after you pick a handle.'}
                    </p>
                    {hasHandle && pageUrl && (
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={copyShareLink}>
                          <Copy className="mr-2 h-3.5 w-3.5" />
                          Copy link
                        </Button>
                        <Button size="sm" variant="outline" asChild>
                          <a href={pageUrl} target="_blank" rel="noreferrer">
                            <ExternalLink className="mr-2 h-3.5 w-3.5" />
                            Open
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">Optional: affiliate IDs</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Auto-apply Amazon / Flipkart / Myntra / Nykaa tags.
                </p>
                <AffiliateIdManager />
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Optional: theme</p>
                <p className="text-xs text-muted-foreground mb-2">
                  Default theme already looks finished.
                </p>
                <ThemeCustomizer />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button asChild variant="ghost" size="sm">
                <Link to="/profile">
                  Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Products
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-muted-foreground">
                {products.length === 0 ? 'Add your first product to get started' : 'In your catalog'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Categories
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">
                From your products
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tags</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tags.length}</div>
              <p className="text-xs text-muted-foreground">
                From your products
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="analytics" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="tags">Tags</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analytics" className="space-y-4">
            {products.length === 0 ? (
              <Card className="mt-6">
                <CardContent className="py-16">
                  <EmptyState
                    icon="analytics"
                    title="No analytics yet"
                    description="Add a product and share your page to start tracking views and clicks."
                    action={
                      hasHandle
                        ? { label: "Add your first product", href: "/my-products" }
                        : { label: "Choose your public handle", href: "/profile" }
                    }
                  />
                </CardContent>
              </Card>
            ) : (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Products by Currency</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div style={{ width: 350, height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={currencyData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {currencyData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Legend />
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>
          
          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Products by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={categoryCounts}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Number of Products"
                      fill="#3B82F6"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tags">
            <Card>
              <CardHeader>
                <CardTitle>Products by Tag</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={tagCounts}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={100}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      name="Number of Products"
                      fill="#10B981"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <Footer />
    </div>
  );
}
