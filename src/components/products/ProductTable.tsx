import { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  ExternalLink,
  Trash2,
  Edit,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { SecurityUtils } from "@/utils/security";

interface ProductTableProps {
  products: Product[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  categories: string[];
  selectedCategory?: string;
}

// Calculate performance score based on views, clicks, and conversions
function calculateScore(product: Product): { score: number; trend: 'up' | 'down' | 'neutral' } {
  // Mock data - in real app, this would come from analytics
  const views = Math.floor(Math.random() * 1000);
  const clicks = Math.floor(views * 0.1);
  const conversions = Math.floor(clicks * 0.05);
  
  // Simple scoring: views (10%) + clicks (30%) + conversions (60%)
  const score = Math.round((views * 0.1 + clicks * 3 + conversions * 6) / 10);
  const trend = score > 50 ? 'up' : score < 30 ? 'down' : 'neutral';
  
  return { score, trend };
}

export default function ProductTable({ 
  products, 
  onEdit, 
  onDelete,
  categories,
  selectedCategory 
}: ProductTableProps) {
  const [sortBy, setSortBy] = useState<'score' | 'date' | 'price'>('score');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter by category if selected
  const filteredProducts = selectedCategory
    ? products.filter(p => p.categories?.includes(selectedCategory))
    : products;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'score':
        const scoreA = calculateScore(a).score;
        const scoreB = calculateScore(b).score;
        comparison = scoreA - scoreB;
        break;
      case 'date':
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      case 'price':
        comparison = (a.price || 0) - (b.price || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSort = (field: 'score' | 'date' | 'price') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('score')}
                className="h-auto p-0 font-semibold"
              >
                Performance Score
                {sortBy === 'score' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            </TableHead>
            <TableHead>Category</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('price')}
                className="h-auto p-0 font-semibold"
              >
                Price
                {sortBy === 'price' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            </TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSort('date')}
                className="h-auto p-0 font-semibold"
              >
                Added
                {sortBy === 'date' && (
                  <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </Button>
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedProducts.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No products found
              </TableCell>
            </TableRow>
          ) : (
            sortedProducts.map((product) => {
              const { score, trend } = calculateScore(product);
              const scoreColor = 
                score >= 70 ? 'text-green-600' : 
                score >= 40 ? 'text-yellow-600' : 
                'text-red-600';
              
              return (
                <TableRow key={product.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={product.image} alt={product.title} />
                      <AvatarFallback>
                        {product.title.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium line-clamp-1">{product.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {product.description?.substring(0, 60)}...
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${scoreColor}`}>{score}</span>
                      {trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                      {trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      {trend === 'neutral' && <Minus className="h-4 w-4 text-gray-400" />}
                      <div className="text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {Math.floor(Math.random() * 1000)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MousePointerClick className="h-3 w-3" />
                          {Math.floor(Math.random() * 100)}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.categories?.slice(0, 2).map(cat => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                      {product.categories && product.categories.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{product.categories.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {product.currency} {product.price?.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{product.source}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(product.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Product actions">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          if (SecurityUtils.validateUrl(product.link)) {
                            window.open(product.link, '_blank');
                          }
                        }}>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Link
                        </DropdownMenuItem>
                        {onEdit && (
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem 
                            onClick={() => onDelete(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

