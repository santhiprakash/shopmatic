import { useMemo } from "react";
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
import { PlusCircle, Link2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

export default function Dashboard() {
  const { products, categories, tags } = useProducts();
  const { user } = useAuth();
  
  // Check if user is new (has less than 3 products)
  const isNewUser = products.length < 3;

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

  const monthlyData = [
    { name: "Jan", products: 4 },
    { name: "Feb", products: 7 },
    { name: "Mar", products: 5 },
    { name: "Apr", products: 10 },
    { name: "May", products: 8 },
    { name: "Jun", products: 12 },
    { name: "Jul", products: 14 },
    { name: "Aug", products: 9 },
    { name: "Sep", products: 11 },
    { name: "Oct", products: 13 },
    { name: "Nov", products: 15 },
    { name: "Dec", products: 17 },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container py-6">
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

        {/* Getting Started Section for New Users */}
        {isNewUser && (
          <Card className="mb-8 border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-blue-600" />
                Getting Started
              </CardTitle>
              <CardDescription>
                Complete these steps to set up your product showcase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border-2 ${products.length > 0 ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-start gap-3">
                    {products.length > 0 ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Add Your First Product</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {products.length > 0 
                          ? `Great! You've added ${products.length} product${products.length !== 1 ? 's' : ''}.`
                          : 'Start by adding your first affiliate product to your showcase.'
                        }
                      </p>
                      {products.length === 0 && (
                        <AddProductForm />
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Set Up Affiliate IDs</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add your affiliate IDs to automatically apply them to product links.
                      </p>
                      <AffiliateIdManager />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full border-2 border-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">Customize Your Theme</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Personalize your showcase page with custom colors.
                      </p>
                      <ThemeCustomizer />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Ready to share your showcase?</p>
                    <p className="text-xs text-muted-foreground">
                      Visit your profile page to see your public showcase URL
                    </p>
                  </div>
                  <Button asChild variant="outline">
                    <Link to="/profile">
                      View Profile
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
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
                +{products.length > 5 ? products.length - 5 : 0} since last month
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
                +{categories.length > 3 ? categories.length - 3 : 0} since last month
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
                +{tags.length > 5 ? tags.length - 5 : 0} since last month
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
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Products Added Over Time</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart
                    data={monthlyData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="products"
                      stroke="#3B82F6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
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
