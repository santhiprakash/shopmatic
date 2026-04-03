import { Button } from "@/components/ui/button";

interface SkipLinkProps {
  targetId: string;
  children?: React.ReactNode;
}

export function SkipLink({ targetId, children = "Skip to main content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      {children}
    </a>
  );
}

export function SkipLinks() {
  return (
    <>
      <SkipLink targetId="main-content">Skip to main content</SkipLink>
      <SkipLink targetId="main-nav">Skip to navigation</SkipLink>
    </>
  );
}
