import { useState } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SimpleProductList from "@/components/products/SimpleProductList";
import CategoryManager from "@/components/products/CategoryManager";
import DemoBanner from "@/components/auth/DemoBanner";
import MinimalProductAdd from "@/components/products/MinimalProductAdd";
import { EmptyProductsState, EmptySearchState } from "@/components/ui/EmptyState";
import { toast } from "sonner";
import { getPlanLimits, getRemainingProductSlots, getPlanDisplayName } from "@/utils/featureGating";
import { getCategoryColors } from "@/utils/categoryColors";
import { Crown, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function MyProducts() {
  const { 
    products, 
    removeProduct, 
    categories
  } = useProducts();
  const { user } = useAuth();
  
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | undefined>(undefined);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const handleRemoveProduct = (id: string) => {
    removeProduct(id);
    toast.success("Product removed successfully");
  };

  // Plan limits
  const userPlan = user?.plan || 'free';
  const planLimits = getPlanLimits(userPlan);
  const remainingSlots = getRemainingProductSlots(userPlan, products.length);
  const isAtLimit = remainingSlots === 0;
  
  // Filter products by category if selected
  const filteredProducts = selectedCategoryFilter
    ? products.filter(p => p.categories?.includes(selectedCategoryFilter))
    : products;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 container max-w-7xl mx-auto py-6 px-4">
        <DemoBanner />
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Products</h1>
            <p className="text-muted-foreground">
              Manage your affiliate product listings
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryManager />
          </div>
        </div>

        {/* Plan Limit Alert */}
        {isAtLimit && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>You've reached your product limit ({products.length}/{planLimits.maxProducts === Infinity ? '∞' : planLimits.maxProducts} products) on your {getPlanDisplayName(userPlan)} plan.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="ml-2"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Upgrade Plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {!isAtLimit && remainingSlots !== Infinity && remainingSlots <= 10 && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>You have {remainingSlots} product slot{remainingSlots !== 1 ? 's' : ''} remaining on your {getPlanDisplayName(userPlan)} plan.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="ml-2"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Upgrade Plan
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Category Filter with Color-coded Options */}
        <div className="mb-6">
          <Select value={selectedCategoryFilter || "all"} onValueChange={(v) => setSelectedCategoryFilter(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>
                  All Categories
                </div>
              </SelectItem>
              {categories.map(cat => {
                const colors = getCategoryColors(cat, selectedCategoryFilter === cat);
                return (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors.bg.replace('bg-', 'bg-').split(' ')[0]}`}></div>
                      {cat}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {showAddForm && (
          <div id="add-product" className="mb-6">
            <MinimalProductAdd
              onSuccess={() => setShowAddForm(false)}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        )}

        {products.length === 0 && !showAddForm && (
          <EmptyProductsState onAddProduct={() => setShowAddForm(true)} />
        )}

        {products.length > 0 && filteredProducts.length === 0 && !showAddForm && (
          <EmptySearchState />
        )}

        {filteredProducts.length > 0 && (
          <SimpleProductList
            products={filteredProducts}
            categories={categories}
            onEdit={() => {
              toast.info("Edit feature coming soon!");
            }}
            onDelete={handleRemoveProduct}
            selectedCategory={selectedCategoryFilter}
          />
        )}
      </main>
      
      <Footer />
    </div>
  );
}
