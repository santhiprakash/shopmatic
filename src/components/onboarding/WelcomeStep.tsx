import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ShoppingBag, TrendingUp, Palette, Zap } from "lucide-react";

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Welcome to Shopmatic!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Your all-in-one platform for showcasing affiliate products. Let's get you started in just a few simple steps.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-2">
              <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle>Add Products Easily</CardTitle>
            <CardDescription>
              Use AI-powered Quick Add or manually add your affiliate products
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-2">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Track Performance</CardTitle>
            <CardDescription>
              Monitor clicks, views, and conversions with detailed analytics
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center mb-2">
              <Palette className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <CardTitle>Customize Your Store</CardTitle>
            <CardDescription>
              Personalize colors and themes to match your brand
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-2">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Share Your Showcase</CardTitle>
            <CardDescription>
              Share your personalized product showcase with your audience
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex gap-3 justify-center">
        <Button onClick={onNext} size="lg" className="min-w-[120px]">
          Get Started
        </Button>
      </div>
    </div>
  );
}

