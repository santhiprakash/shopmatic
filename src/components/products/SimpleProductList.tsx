import { useState } from "react";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  ExternalLink,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import MinimalProductAdd from "./MinimalProductAdd";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { getCategoryBadgeColor, getTagColors } from "@/utils/categoryColors";

interface SimpleProductListProps {
  products: Product[];
  categories: string[];
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
  selectedCategory?: string;
}

export default function SimpleProductList({ 
  products, 
  categories,
  onEdit, 
  onDelete,
  selectedCategory 
}: SimpleProductListProps) {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Filter by category if selected
  const filteredProducts = selectedCategory
    ? products.filter(p => p.categories?.includes(selectedCategory))
    : products;

  // Calculate simple performance metrics (mock data for now)
  const getPerformance = (product: Product) => {
    // In real app, this would come from analytics
    const views = Math.floor(Math.random() * 1000);
    const clicks = Math.floor(views * 0.1);
    return { views, clicks };
  };

  return (
    <div className="space-y-4">
      {/* Add Product Button */}
      {!showAddForm && (
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Your Products</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory && ` in ${selectedCategory}`}
            </p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      )}

      {/* Add Product Form */}
      {showAddForm && (
        <MinimalProductAdd
          onSuccess={() => {
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Products Table */}
      {!showAddForm && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Image</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="space-y-2">
                      <p className="text-muted-foreground">No products yet</p>
                      <Button variant="outline" onClick={() => setShowAddForm(true)}>
                        Add Your First Product
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => {
                  const { views, clicks } = getPerformance(product);
                  
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
                            {product.description?.substring(0, 80)}
                            {product.description && product.description.length > 80 ? '...' : ''}
                          </div>
                          <a
                            href={product.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View Product
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.categories?.slice(0, 2).map(cat => (
                            <Badge 
                              key={cat} 
                              variant="secondary" 
                              className={`text-xs border ${getCategoryBadgeColor(cat)}`}
                            >
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
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{views}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MousePointerClick className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">{clicks}</span>
                          </div>
                        </div>
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
                            <DropdownMenuItem onClick={() => setEditingProduct(product)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => window.open(product.link, '_blank')}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Link
                            </DropdownMenuItem>
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
      )}

      {/* Edit Product Dialog */}
      {editingProduct && (
        <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <MinimalProductAdd
              editingProduct={editingProduct}
              onSuccess={() => {
                setEditingProduct(null);
                onEdit?.(editingProduct);
              }}
              onCancel={() => setEditingProduct(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

