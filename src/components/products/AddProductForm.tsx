import { useState, useEffect } from "react";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ProductFormData, Currency } from "@/types";
import { toast } from "sonner";
import { PlusCircle, X, Zap, Settings, Crown, AlertCircle, HelpCircle } from "lucide-react";
import { APIKeyManager } from "@/utils/apiKeyManager";
import QuickAddForm from "./QuickAddForm";
import APIKeySetup from "./APIKeySetup";
import BulkProductImport from "./BulkProductImport";
import AffiliateIdManager from "@/components/affiliate/AffiliateIdManager";
import { AffiliateUrlService } from "@/services/AffiliateUrlService";
import { canAddProduct, getRemainingProductSlots, getUpgradeMessage, getPlanDisplayName } from "@/utils/featureGating";

const INITIAL_FORM_DATA: ProductFormData = {
  title: "",
  description: "",
  price: 0,
  currency: "INR",
  image: "",
  link: "",
  source: "",
  tags: [],
  categories: [],
};

const SAMPLE_SOURCES = ["Amazon", "Flipkart", "Myntra", "Nykaa", "Other"];

type AddMode = 'quick' | 'advanced';

export default function AddProductForm() {
  const { addProduct, categories: existingCategories, tags: existingTags, products } = useProducts();
  const { user } = useAuth();
  const [formData, setFormData] = useState<ProductFormData>({ ...INITIAL_FORM_DATA });
  const [open, setOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [currentCategory, setCurrentCategory] = useState("");
  const [addMode, setAddMode] = useState<AddMode>('quick');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiSetup, setShowApiSetup] = useState(false);

  useEffect(() => {
    APIKeyManager.hasValidKey('openai').then(setHasApiKey);
  }, []);

  // Check if user can add more products
  const userPlan = user?.plan || 'free';
  const canAdd = canAddProduct(userPlan, products.length);
  const remainingSlots = getRemainingProductSlots(userPlan, products.length);

  const extractAmazonASIN = (url: string): string => {
    const asinRegex = /(?:\/dp\/|\/gp\/product\/|\/ASIN\/|\/asin\/)([A-Z0-9]{10})/i;
    const match = url.match(asinRegex);
    return match ? match[1] : "";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "link" && value.includes("amazon")) {
      const asin = extractAmazonASIN(value);
      if (asin) {
        setFormData((prev) => ({ 
          ...prev, 
          [name]: value,
          source: "Amazon",
          image: prev.image || `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`,
        }));
        return;
      }
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleAddCategory = () => {
    if (currentCategory && !formData.categories.includes(currentCategory)) {
      setFormData((prev) => ({
        ...prev,
        categories: [...prev.categories, currentCategory],
      }));
      setCurrentCategory("");
    }
  };

  const handleRemoveCategory = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.filter((c) => c !== category),
    }));
  };

  const handleQuickAddExtraction = (extractedData: Partial<ProductFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...extractedData,
      title: extractedData.title || prev.title,
      description: extractedData.description || prev.description,
      price: extractedData.price || prev.price,
      currency: extractedData.currency || prev.currency,
      image: extractedData.image || prev.image,
      link: extractedData.link || prev.link,
      source: extractedData.source || prev.source,
      categories: extractedData.categories?.length ? extractedData.categories : prev.categories,
      tags: extractedData.tags?.length ? extractedData.tags : prev.tags,
    }));
    
    setAddMode('advanced');
    toast.success("Product data extracted! Please review and save.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check plan limits
    if (!canAdd) {
      toast.error(`You've reached your product limit. ${getUpgradeMessage(userPlan, 'unlimited products')}`);
      return;
    }

    if (!formData.title || !formData.description || !formData.link || !formData.image) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.categories.length === 0) {
      toast.error("Please add at least one category");
      return;
    }

    if (formData.tags.length === 0) {
      toast.error("Please add at least one tag");
      return;
    }

    try {
      let finalFormData = { ...formData };

      // Inject affiliate ID if user is authenticated and not in demo mode
      if (user && !user.isDemo) {
        const affiliateResult = await AffiliateUrlService.injectAffiliateId(user.id, formData.link);
        if (affiliateResult.affiliateUrl !== formData.link) {
          finalFormData.link = affiliateResult.affiliateUrl;
          toast.success("Affiliate ID applied to product link!");
        }
      }

      addProduct(finalFormData);
      
      toast.success("Product added successfully!", {
        action: {
          label: "Add Another",
          onClick: () => {
            setFormData({ ...INITIAL_FORM_DATA });
            setAddMode('quick');
            // Keep dialog open for another product
          },
        },
        duration: 5000,
      });
      
      // Reset form and close dialog
      setFormData({ ...INITIAL_FORM_DATA });
      setAddMode('quick');
      setOpen(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error("Failed to add product");
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
    if (hasApiKey) {
      setAddMode('quick');
    } else {
      setAddMode('advanced');
    }
  };

  const renderQuickAddMode = () => {
    if (!hasApiKey) {
      return (
        <div className="space-y-4 py-4">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Settings className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Setup Required</h3>
              <p className="text-sm text-muted-foreground">
                Configure your OpenAI API key to use Quick Add
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowApiSetup(true)}>
                <Settings className="mr-2 h-4 w-4" />
                Setup API Key
              </Button>
              <Button variant="outline" onClick={() => setAddMode('advanced')}>
                Use Advanced Mode
              </Button>
            </div>
          </div>
        </div>
      );
    }

    if (showApiSetup) {
      return (
        <div className="py-4">
          <APIKeySetup
            onSetupComplete={() => {
              setShowApiSetup(false);
              setHasApiKey(true);
              toast.success("API key configured! You can now use Quick Add.");
            }}
          />
        </div>
      );
    }

    return (
      <div className="py-4">
        <QuickAddForm
          onProductExtracted={handleQuickAddExtraction}
          onCancel={() => setAddMode('advanced')}
        />
      </div>
    );
  };

  const renderAdvancedMode = () => (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
      {/* ARIA live region for error messages */}
      <div aria-live="assertive" className="sr-only" id="form-error-region"></div>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Product Title *
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The name of the product as it appears on the store</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="e.g., Wireless Bluetooth Headphones"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="description" className="text-sm font-medium">
              Description *
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Describe the product features, benefits, and why you recommend it</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="e.g., High-quality wireless headphones with noise cancellation and 30-hour battery life..."
            required
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            A good description helps your audience understand why you recommend this product
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="price" className="text-sm font-medium">
              Price *
            </label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price || ""}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Currency *
            </label>
            <Select
              value={formData.currency}
              onValueChange={(value) =>
                handleSelectChange("currency", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">INR (₹)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="link" className="text-sm font-medium">
              Affiliate Link *
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The product URL from the store. Your affiliate ID will be automatically added if configured.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="link"
            name="link"
            value={formData.link}
            onChange={handleInputChange}
            placeholder="https://www.amazon.in/dp/..."
            required
          />
          <p className="text-xs text-muted-foreground">
            Paste the product URL. If you've set up affiliate IDs, they'll be added automatically.
          </p>
        </div>

        <div className="space-y-2">
          <label htmlFor="source" className="text-sm font-medium">
            Source *
          </label>
          <Select
            value={formData.source}
            onValueChange={(value) =>
              handleSelectChange("source", value)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              {SAMPLE_SOURCES.map((source) => (
                <SelectItem key={source} value={source}>
                  {source}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label htmlFor="image" className="text-sm font-medium">
              Image URL *
            </label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-3 w-3 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>The direct URL to the product image. Usually found by right-clicking the product image and selecting "Copy image address"</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleInputChange}
            placeholder="https://example.com/product-image.jpg"
            required
          />
          <p className="text-xs text-muted-foreground">
            Right-click the product image on the store page and select "Copy image address"
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Categories *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.categories.map((category) => (
              <Badge key={category} className="flex items-center gap-1">
                {category}
                <X
                  className="h-3 w-3 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove category ${category}`}
                  onClick={() => handleRemoveCategory(category)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRemoveCategory(category); }}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select
              value={currentCategory}
              onValueChange={setCurrentCategory}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {existingCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Fashion">Fashion</SelectItem>
                <SelectItem value="Home">Home</SelectItem>
                <SelectItem value="Kitchen">Kitchen</SelectItem>
                <SelectItem value="Beauty">Beauty</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Books">Books</SelectItem>
                <SelectItem value="Toys">Toys</SelectItem>
                <SelectItem value="Sports">Sports</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAddCategory}
              disabled={!currentCategory}
            >
              Add
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Tags *</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="flex items-center gap-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => handleRemoveTag(tag)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleRemoveTag(tag); }}
                />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Select
              value={currentTag}
              onValueChange={setCurrentTag}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                {existingTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
                <SelectItem value="Audio">Audio</SelectItem>
                <SelectItem value="Wireless">Wireless</SelectItem>
                <SelectItem value="Wearable">Wearable</SelectItem>
                <SelectItem value="Portable">Portable</SelectItem>
                <SelectItem value="Smart Home">Smart Home</SelectItem>
                <SelectItem value="Eco-Friendly">Eco-Friendly</SelectItem>
                <SelectItem value="Bestseller">Bestseller</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleAddTag}
              disabled={!currentTag}
            >
              Add
            </Button>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={!canAdd}>
          Add Product
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleOpenDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Add New Product
            {hasApiKey && (
              <div className="flex rounded-md border">
                <Button
                  variant={addMode === 'quick' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-r-none"
                  onClick={() => setAddMode('quick')}
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Quick
                </Button>
                <Button
                  variant={addMode === 'advanced' ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-l-none"
                  onClick={() => setAddMode('advanced')}
                >
                  Advanced
                </Button>
              </div>
            )}
          </DialogTitle>
          <DialogDescription>
            {addMode === 'quick'
              ? "Paste any product URL and let AI extract the details automatically."
              : "Enter the details of the affiliate product you want to add."
            }
          </DialogDescription>
        </DialogHeader>

        {/* Plan Limit Warning */}
        {!canAdd && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>You've reached your product limit ({products.length} products).</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="ml-2"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Upgrade
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        {canAdd && remainingSlots !== Infinity && remainingSlots <= 10 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span>You have {remainingSlots} product slot{remainingSlots !== 1 ? 's' : ''} remaining on your {getPlanDisplayName(userPlan)} plan.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/pricing'}
                  className="ml-2"
                >
                  <Crown className="mr-1 h-3 w-3" />
                  Upgrade
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Additional Actions */}
        <div className="flex gap-2 pb-4 border-b">
          <AffiliateIdManager />
          <BulkProductImport />
        </div>

        {addMode === 'quick' ? renderQuickAddMode() : renderAdvancedMode()}
      </DialogContent>
    </Dialog>
    </>
  );
}
