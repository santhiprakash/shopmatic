import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Sparkles } from "lucide-react";
import ThemeCustomizer from "@/components/theme/ThemeCustomizer";

interface ThemeCustomizationStepProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function ThemeCustomizationStep({ onComplete, onSkip }: ThemeCustomizationStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center">
          <Palette className="h-8 w-8 text-pink-600 dark:text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold">Customize Your Theme</h2>
        <p className="text-muted-foreground">
          Make your showcase page reflect your personal style
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Theme Customization</CardTitle>
          <CardDescription>
            Choose colors that match your brand or personal preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Customize Colors</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Adjust primary, secondary, accent, text, and background colors to create a unique look for your showcase.
            </p>
            
            <div className="pt-2">
              <ThemeCustomizer />
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Pro Tip</p>
                <p className="text-sm text-muted-foreground">
                  You can always change your theme later from the theme customizer button in the header. 
                  Experiment with different color combinations to find what works best for your brand!
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 justify-center">
        <Button onClick={onComplete} size="lg" className="min-w-[120px]">
          Continue
        </Button>
        <Button onClick={onSkip} variant="ghost" size="lg">
          Skip for now
        </Button>
      </div>
    </div>
  );
}

