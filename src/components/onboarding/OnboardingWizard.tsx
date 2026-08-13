import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useAuth } from "@/contexts/AuthContext";
import { useProducts } from "@/contexts/ProductContext";
import WelcomeStep from "./WelcomeStep";
import HandleSetupStep from "./HandleSetupStep";
import FirstProductStep from "./FirstProductStep";
import ThemeCustomizationStep from "./ThemeCustomizationStep";
import SharePageStep from "./SharePageStep";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getOnboardingStartStep, shouldShowOnboarding } from "@/utils/onboarding";

const STEP_NAMES = ["Welcome", "Public handle", "First product", "Theme", "Share"] as const;
const STEP_KEYS = ["welcome", "handle", "product", "theme", "share"] as const;

export default function OnboardingWizard() {
  const { isAuthenticated, isDemo, user } = useAuth();
  const { products } = useProducts();
  const {
    state,
    nextStep,
    previousStep,
    goToStep,
    completeStep,
    completeOnboarding,
    skipOnboarding,
  } = useOnboarding();

  const username = user?.username;
  const productCount = products.length;
  const inProgress =
    state.currentStep > 0 ||
    Object.values(state.progress).some(Boolean);
  const open = shouldShowOnboarding({
    isAuthenticated,
    isDemo,
    username,
    productCount,
    completed: state.completed,
    dismissed: state.skipped,
    inProgress,
  });

  useEffect(() => {
    if (!open) return;
    const target = getOnboardingStartStep({
      username,
      productCount,
      welcomeSeen: state.progress.welcome,
    });
    if (state.currentStep < target) {
      goToStep(target);
    }
    if (!username && state.currentStep > 1) {
      goToStep(1);
    }
  }, [open, username, productCount, state.progress.welcome, state.currentStep, goToStep]);

  if (!open) {
    return null;
  }

  const currentStepIndex = state.currentStep;
  const progress = ((currentStepIndex + 1) / STEP_NAMES.length) * 100;
  const canDismiss = Boolean(username);
  const canGoBack = currentStepIndex > 0 && !(currentStepIndex === 1 && !username);

  const handleNext = () => {
    completeStep(STEP_KEYS[currentStepIndex]);
    if (currentStepIndex === STEP_NAMES.length - 1) {
      completeOnboarding(username, productCount);
    } else {
      nextStep();
    }
  };

  const handleComplete = () => {
    completeOnboarding(username, productCount);
  };

  const handleRemindLater = () => {
    skipOnboarding(username);
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button.absolute]:hidden"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Step {currentStepIndex + 1} of {STEP_NAMES.length}: {STEP_NAMES[currentStepIndex]}
              </h2>
              {canDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleRemindLater}
                  className="h-8 w-8"
                  aria-label="Remind me on dashboard"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="min-h-[400px]">
            {currentStepIndex === 0 && (
              <WelcomeStep onNext={handleNext} />
            )}
            {currentStepIndex === 1 && (
              <HandleSetupStep onNext={handleNext} />
            )}
            {currentStepIndex === 2 && (
              <FirstProductStep onNext={handleNext} onRemindLater={handleRemindLater} />
            )}
            {currentStepIndex === 3 && (
              <ThemeCustomizationStep onComplete={handleNext} onSkip={handleNext} />
            )}
            {currentStepIndex === 4 && username && (
              <SharePageStep username={username} onComplete={handleComplete} />
            )}
          </div>

          {canGoBack && (
            <div className="flex justify-between">
              <Button variant="outline" onClick={previousStep}>
                Previous
              </Button>
              <div></div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
