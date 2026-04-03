
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { ExternalLink, Star } from "lucide-react";
import { getTagColors, getCategoryBadgeColor } from "@/utils/categoryColors";
import { SecurityUtils } from "@/utils/security";

interface ProductCardProps {
  product: Product;
  onRemove?: (id: string) => void;
}

export default function ProductCard({ product, onRemove }: ProductCardProps) {
  const isValidLink = SecurityUtils.validateUrl(product.link);
  const safeLink = isValidLink ? product.link : "#invalid-link";

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md group">
      <div className="relative overflow-hidden">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-52 w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/placeholder.svg";
          }}
        />
        <Badge className="absolute right-3 top-3 bg-white/90 dark:bg-gray-800/90 text-primary shadow-sm backdrop-blur-sm">
          {product.source}
        </Badge>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <Button asChild className="w-full bg-white/90 text-gray-900 hover:bg-white">
            <a 
              href={safeLink} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-1"
              onClick={isValidLink ? undefined : (e) => e.preventDefault()}
            >
              View Product
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </div>
      
      <CardContent className="pt-4">
        <div className="flex items-center gap-1 mb-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{product.rating}</span>
        </div>
        
        <h3 className="font-semibold line-clamp-1 text-base">{product.title}</h3>
        
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        
        <div className="mt-3">
          <span className="font-bold text-lg">{product.currency === "INR" ? "₹" : "$"}{product.price.toLocaleString()}</span>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-1.5">
          {product.categories?.slice(0, 1).map(category => (
            <Badge
              key={category}
              variant="secondary"
              className={`text-xs px-2.5 py-1 rounded-full border ${getCategoryBadgeColor(category)}`}
            >
              {category}
            </Badge>
          ))}
          {product.tags.slice(0, 2).map(tag => (
            <Badge
              key={tag}
              variant="secondary"
              className={`text-xs px-2.5 py-1 rounded-full ${getTagColors(tag)}`}
            >
              {tag}
            </Badge>
          ))}
          {(product.tags.length > 2 || (product.categories && product.categories.length > 1)) && (
            <Badge
              variant="outline"
              className="text-xs px-2.5 py-1 rounded-full text-muted-foreground hover:text-primary hover:border-primary/50"
            >
              +{(product.tags.length - 2) + (product.categories && product.categories.length > 1 ? product.categories.length - 1 : 0)}
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 pt-0 pb-4">
        <Button 
          asChild 
          variant="outline" 
          className="flex-1 hidden group-hover:flex"
        >
          <a 
            href={safeLink} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-1"
            onClick={isValidLink ? undefined : (e) => e.preventDefault()}
          >
            View Product
            <ExternalLink className="h-3 w-3 ml-1" />
          </a>
        </Button>
        
        {onRemove && (
          <Button 
            variant="outline" 
            size="sm"
            className="flex-shrink-0"
            onClick={() => onRemove(product.id)}
          >
            Remove
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
