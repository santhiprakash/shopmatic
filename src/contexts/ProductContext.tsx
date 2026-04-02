
import React, { createContext, useState, useContext, useEffect, useMemo } from "react";
import { Product, FilterOptions, ViewMode, SortOption, ProductFormData } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { InputSanitizer } from "@/utils/validation";
import { toast } from "sonner";

// Mock data for sample products
import { sampleProducts } from "@/data/sampleProducts";

type ProductContextType = {
  products: Product[];
  viewMode: ViewMode;
  sortOption: SortOption;
  filterOptions: FilterOptions;
  filteredProducts: Product[];
  searchQuery: string;
  addProduct: (product: ProductFormData) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortOption: (option: SortOption) => void;
  setFilterOptions: (filters: Partial<FilterOptions>) => void;
  setSearchQuery: (query: string) => void;
  categories: string[];
  tags: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
};

const defaultFilterOptions: FilterOptions = {
  categories: [],
  tags: [],
  priceRange: [0, 10000],
  rating: 0,
};

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const savedProducts = localStorage.getItem("shopmatic-products");
    return savedProducts ? JSON.parse(savedProducts) : sampleProducts;
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);
  const [searchQuery, setSearchQuery] = useState("");

  // Save products to localStorage
  useEffect(() => {
    localStorage.setItem("shopmatic-products", JSON.stringify(products));
  }, [products]);

  // Get all unique categories and tags from products
  const productCategories = useMemo(
    () => Array.from(new Set(products.flatMap(p => p.categories))),
    [products]
  );
  const productTags = useMemo(
    () => Array.from(new Set(products.flatMap(p => p.tags))),
    [products]
  );
  
  // Store custom categories separately (in real app, this would be in database)
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem("shopmatic-custom-categories");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Combine product categories with custom categories
  const categories = Array.from(new Set([...productCategories, ...customCategories]));
  const tags = productTags;
  
  // Save custom categories to localStorage
  useEffect(() => {
    localStorage.setItem("shopmatic-custom-categories", JSON.stringify(customCategories));
  }, [customCategories]);
  
  const addCategory = (category: string) => {
    if (!customCategories.includes(category)) {
      setCustomCategories(prev => [...prev, category]);
    }
  };
  
  const removeCategory = (category: string) => {
    // Only remove if no products are using it
    const productsUsingCategory = products.filter(p => p.categories?.includes(category));
    if (productsUsingCategory.length === 0) {
      setCustomCategories(prev => prev.filter(c => c !== category));
    }
  };

  // Apply filters and sorting to products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        // Search query
        if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Categories
        if (filterOptions.categories.length > 0 && 
            !product.categories.some(cat => filterOptions.categories.includes(cat))) {
          return false;
        }
        
        // Tags
        if (filterOptions.tags.length > 0 && 
            !product.tags.some(tag => filterOptions.tags.includes(tag))) {
          return false;
        }
        
        // Price range
        if (product.price < filterOptions.priceRange[0] || 
            product.price > filterOptions.priceRange[1]) {
          return false;
        }
        
        // Rating
        if (product.rating < filterOptions.rating) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        switch (sortOption) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "price-low-high":
            return a.price - b.price;
          case "price-high-low":
            return b.price - a.price;
          case "rating":
            return b.rating - a.rating;
          default:
            return 0;
        }
      });
  }, [products, searchQuery, filterOptions, sortOption]);

  const addProduct = (productData: ProductFormData) => {
    // Validate and sanitize product data
    const validation = InputSanitizer.validateProduct(productData);
    
    if (!validation.success) {
      toast.error(`Validation failed: ${validation.errors?.join(', ')}`);
      return;
    }
    
    const newProduct: Product = {
      ...(validation.data as Product),
      id: uuidv4(),
      rating: 0,
      createdAt: new Date(),
    };
    
    setProducts([...products, newProduct]);
    toast.success('Product added successfully!');
  };

  const removeProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const updateProduct = (id: string, updatedData: Partial<Product>) => {
    // Validate and sanitize updated data
    const validation = InputSanitizer.validateProduct(updatedData);
    
    if (!validation.success) {
      toast.error(`Validation failed: ${validation.errors?.join(', ')}`);
      return;
    }
    
    setProducts(products.map(p => 
      p.id === id ? { ...p, ...(validation.data as Partial<Product>) } : p
    ));
    toast.success('Product updated successfully!');
  };

  const handleSetFilterOptions = (newFilters: Partial<FilterOptions>) => {
    setFilterOptions(prev => ({ ...prev, ...newFilters }));
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        viewMode,
        sortOption,
        filterOptions,
        filteredProducts,
        searchQuery,
        addProduct,
        removeProduct,
        updateProduct,
        setViewMode,
        setSortOption,
        setFilterOptions: handleSetFilterOptions,
        setSearchQuery,
        categories,
        tags,
        addCategory,
        removeCategory,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};
