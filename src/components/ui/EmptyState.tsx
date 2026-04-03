import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Package, Plus, BarChart3, Users, Share2, SearchX } from "lucide-react";

interface EmptyStateProps {
  icon?: "products" | "analytics" | "team" | "share" | "search";
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const iconMap = {
  products: Package,
  analytics: BarChart3,
  team: Users,
  share: Share2,
  search: SearchX,
};

export function EmptyState({ 
  icon = "products", 
  title, 
  description, 
  action,
  secondaryAction 
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      <div className="flex flex-col sm:flex-row gap-3">
        {action && (
          action.href ? (
            <Button asChild>
              <Link to={action.href}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>
              <Plus className="mr-2 h-4 w-4" />
              {action.label}
            </Button>
          )
        )}
        {secondaryAction && (
          secondaryAction.href ? (
            <Button variant="outline" asChild>
              <Link to={secondaryAction.href}>
                {secondaryAction.label}
              </Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )
        )}
      </div>
    </div>
  );
}

export function EmptyProductsState({ onAddProduct }: { onAddProduct?: () => void }) {
  return (
    <EmptyState
      icon="products"
      title="No products yet"
      description="Start building your product showcase by adding your first product. You can add products manually or use our AI-powered extraction from product URLs."
      action={{
        label: "Add Your First Product",
        onClick: onAddProduct,
      }}
      secondaryAction={{
        label: "Learn More",
        href: "/help-center",
      }}
    />
  );
}

export function EmptyAnalyticsState() {
  return (
    <EmptyState
      icon="analytics"
      title="No analytics data yet"
      description="Once your products are live and being viewed, you'll see analytics here. Share your showcase page to start tracking engagement."
      action={{
        label: "Share Your Showcase",
        href: "/profile",
      }}
      secondaryAction={{
        label: "View Products",
        href: "/my-products",
      }}
    />
  );
}

export function EmptyTeamState() {
  return (
    <EmptyState
      icon="team"
      title="No team members yet"
      description="Collaborate with others by inviting team members to help manage your pages. Team features are available on Pro and Enterprise plans."
      action={{
        label: "Invite Team Member",
        href: "/settings",
      }}
    />
  );
}

export function EmptyShareState() {
  return (
    <EmptyState
      icon="share"
      title="No shares yet"
      description="Share your collections with friends and track how many people click your links. Your share history will appear here."
      action={{
        label: "Go to Dashboard",
        href: "/dashboard",
      }}
    />
  );
}

export function EmptySearchState() {
  return (
    <EmptyState
      icon="search"
      title="No results found"
      description="We couldn't find anything matching your search. Try different keywords or browse all products."
      action={{
        label: "Clear Search",
        href: "/my-products",
      }}
    />
  );
}
