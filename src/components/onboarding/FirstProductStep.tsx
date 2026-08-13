import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, PlusCircle, Sparkles } from "lucide-react";
import AddProductForm from "@/components/products/AddProductForm";
import { useProducts } from "@/contexts/ProductContext";

interface FirstProductStepProps {
  onNext: () => void;
  onRemindLater?: () => void;
}

export default function FirstProductStep({ onNext, onRemindLater }: FirstProductStepProps) {
  const { products } = useProducts();
  const hasProduct = products.length >= 1;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold">Add your first product</h2>
        <p className="text-muted-foreground">
          Paste a product URL or fill in a short form. You need one product before your page is useful.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick start</CardTitle>
          <CardDescription>
            Two ways to add a product:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Quick Add (AI-powered)</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Paste a product URL and let AI extract the details. Needs an OpenAI API key.
              </p>
            </div>

            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Manual entry</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Fill in title, link, image, and a short description yourself.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-3">Add one now:</p>
            <AddProductForm />
            {hasProduct && (
              <p className="mt-3 text-sm text-green-700 dark:text-green-400">
                {products.length} product{products.length === 1 ? "" : "s"} added. You can continue.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNext} size="lg" className="min-w-[120px]" disabled={!hasProduct}>
          Continue
        </Button>
        {onRemindLater && (
          <Button onClick={onRemindLater} variant="ghost" size="lg">
            Remind me on dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
