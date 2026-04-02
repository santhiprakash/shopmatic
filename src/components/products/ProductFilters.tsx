
import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter
} from "@/components/ui/sheet";
import { Filter, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import ProductControls from "@/components/products/ProductControls";

export default function ProductFilters() {
  const {
    tags,
    filterOptions,
    setFilterOptions,
    filteredProducts,
    products
  } = useProducts();
  
  const [tempFilters, setTempFilters] = useState(filterOptions);
  const [priceValues, setPriceValues] = useState<[number, number]>(filterOptions.priceRange);
  
  const handleTagChange = (tag: string, checked: boolean) => {
    setTempFilters(prev => {
      if (checked) {
        return { 
          ...prev, 
          tags: [...prev.tags, tag] 
        };
      } else {
        return { 
          ...prev, 
          tags: prev.tags.filter(t => t !== tag) 
        };
      }
    });
    
    // Apply tag filters immediately
    if (checked) {
      const newTags = [...filterOptions.tags, tag];
      setFilterOptions({
        ...filterOptions,
        tags: newTags
      });
    } else {
      const newTags = filterOptions.tags.filter(t => t !== tag);
      setFilterOptions({
        ...filterOptions,
        tags: newTags
      });
    }
  };
  
  const handleRatingChange = (rating: number) => {
    setTempFilters(prev => ({ ...prev, rating }));
  };
  
  const handlePriceChange = (values: number[]) => {
    const priceTuple: [number, number] = [values[0], values[1]];
    setPriceValues(priceTuple);
    setTempFilters(prev => ({ ...prev, priceRange: priceTuple }));
  };
  
  const handleApplyFilters = () => {
    setFilterOptions(tempFilters);
  };
  
  const handleClearFilters = () => {
    const clearedFilters = {
      categories: [],
      tags: [],
      priceRange: [0, 10000] as [number, number],
      rating: 0,
    };
    setTempFilters(clearedFilters);
    setPriceValues(clearedFilters.priceRange);
    setFilterOptions(clearedFilters);
  };

  const removeFilter = (type: 'tag', value: string) => {
    handleTagChange(value, false);
  };
  
  const maxPrice = products.length > 0
    ? Math.max(...products.map(p => p.price), 10000)
    : 10000;
  
  // Simplified filters without duplicate categories
  return (
    <div className="space-y-6">
      {/* Active filters with clear option */}
      {(filterOptions.categories.length > 0 || filterOptions.tags.length > 0) && (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Active Filters</h3>
            <Button 
              variant="ghost" 
              size="sm"
              className="h-8 text-xs"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filterOptions.categories.map(category => (
              <Badge 
                key={`active-${category}`}
                variant="secondary"
                className="px-3 py-1 rounded-full"
              >
                {category}
              </Badge>
            ))}
            {filterOptions.tags.map(tag => (
              <Badge 
                key={`active-${tag}`}
                variant="outline"
                className="px-3 py-1 rounded-full"
              >
                {tag}
                <button 
                  className="ml-1 h-3 w-3 cursor-pointer" 
                  onClick={() => removeFilter('tag', tag)}
                  aria-label={`Remove ${tag} filter`}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Advanced filters sheet for mobile */}
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-3">
          <ProductControls />
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Advanced Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Advanced Filters</SheetTitle>
              </SheetHeader>
              
              <div className="py-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium">Price Range</h3>
                    <div className="text-sm">
                      ₹{priceValues[0]} - ₹{priceValues[1]}
                    </div>
                  </div>
                  <Slider
                    min={0}
                    max={maxPrice}
                    step={100}
                    value={priceValues}
                    onValueChange={handlePriceChange}
                    className="mb-6"
                  />
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Minimum Rating</h3>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <Button
                        key={rating}
                        variant={tempFilters.rating === rating ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleRatingChange(rating)}
                        className="flex-1 px-0"
                      >
                        {rating}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-sm font-medium mb-4">Active Filters</h3>
                  <div className="space-y-3">
                    {filterOptions.rating > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1 px-3 py-1 w-fit">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {filterOptions.rating}+
                        <button 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => setFilterOptions({...filterOptions, rating: 0})}
                          aria-label="Clear rating filter"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                    
                    {(filterOptions.priceRange[0] > 0 || filterOptions.priceRange[1] < maxPrice) && (
                      <Badge variant="outline" className="px-3 py-1 w-fit">
                        ₹{filterOptions.priceRange[0]} - ₹{filterOptions.priceRange[1]}
                        <button 
                          className="ml-1 h-3 w-3 cursor-pointer" 
                          onClick={() => setFilterOptions({...filterOptions, priceRange: [0, maxPrice] as [number, number]})}
                          aria-label="Clear price filter"
                        >
                          ×
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between pt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleClearFilters}
                  >
                    Reset
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={handleApplyFilters}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
