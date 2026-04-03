import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Share2, ExternalLink, User } from "lucide-react";
import { SecurityUtils } from "@/utils/security";

interface CollectionData {
  id: string;
  name: string;
  description: string;
  products: string[];
  ownerUsername: string;
  ownerBio?: string;
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
  };
}

interface PageMeta {
  title: string;
  description: string;
  image: string;
  url: string;
  type: "profile" | "collection";
  username: string;
  collectionName?: string;
}

function usePageMetadata() {
  const { username, collectionSlug } = useParams<{ username: string; collectionSlug?: string }>();
  const { products } = useProducts();
  const { user } = useAuth();
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeta = async () => {
      setLoading(true);
      
      const baseUrl = import.meta.env.VITE_PRODUCTION_URL || window.location.origin;
      
      if (collectionSlug) {
        const collection: CollectionData = {
          id: collectionSlug,
          name: collectionSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
          description: `Check out ${username}'s curated collection: ${collectionSlug}`,
          products: products.slice(0, 6).map(p => p.id),
          ownerUsername: username || "curator",
          ownerBio: user?.firstName ? `${user.firstName}'s curated products` : undefined,
        };

        const firstProduct = products[0];
        
        setMeta({
          title: `${collection.name} by @${username} | shopmatic.cc`,
          description: collection.description,
          image: firstProduct?.image || `${baseUrl}/og-default.png`,
          url: `${baseUrl}/@${username}/${collectionSlug}`,
          type: "collection",
          username: username || "curator",
          collectionName: collection.name,
        });
      } else {
        const profileImage = user?.avatarUrl || `${baseUrl}/og-default.png`;
        
        setMeta({
          title: `@${username}'s Collections | shopmatic.cc`,
          description: `Browse curated product collections by ${username} on shopmatic.cc`,
          image: profileImage,
          url: `${baseUrl}/@${username}`,
          type: "profile",
          username: username || "curator",
        });
      }
      
      setLoading(false);
    };

    fetchMeta();
  }, [username, collectionSlug, products, user]);

  return { meta, loading };
}

function PublicPageMeta({ meta }: { meta: PageMeta }) {
  if (!meta) return null;

  return (
    <>
      <title>{meta.title}</title>
      
      <meta name="description" content={meta.description} />
      
      <meta property="og:title" content={meta.title} />
      <meta property="og:description" content={meta.description} />
      <meta property="og:image" content={meta.image} />
      <meta property="og:url" content={meta.url} />
      <meta property="og:type" content={meta.type === "collection" ? "website" : "profile"} />
      <meta property="og:site_name" content="shopmatic.cc" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={meta.title} />
      <meta name="twitter:description" content={meta.description} />
      <meta name="twitter:image" content={meta.image} />
      <meta name="twitter:site" content="@shopmatic_cc" />
      <meta name="twitter:creator" content={`@${meta.username}`} />
      
      <link rel="canonical" href={meta.url} />
    </>
  );
}

function ShareButtons({ url, title }: { url: string; title: string }) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const copyLink = () => {
    navigator.clipboard.writeText(url);
  };
  
  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, "_blank");
  };
  
  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, "_blank");
  };
  
  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank");
  };
  
  const shareToLinkedIn = () => {
    window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`, "_blank");
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copyLink} className="gap-2">
        <Share2 className="h-4 w-4" />
        Copy Link
      </Button>
      <Button variant="outline" size="sm" onClick={shareToWhatsApp} className="gap-2 bg-green-50 hover:bg-green-100 border-green-200">
        WhatsApp
      </Button>
      <Button variant="outline" size="sm" onClick={shareToTwitter} className="gap-2">
        Twitter
      </Button>
      <Button variant="outline" size="sm" onClick={shareToFacebook} className="gap-2">
        Facebook
      </Button>
    </div>
  );
}

function CollectionPage() {
  const { username, collectionSlug } = useParams<{ username: string; collectionSlug?: string }>();
  const { products } = useProducts();
  const { meta, loading } = usePageMetadata();
  
  const baseUrl = import.meta.env.VITE_PRODUCTION_URL || window.location.origin;
  const pageUrl = collectionSlug 
    ? `${baseUrl}/@${username}/${collectionSlug}`
    : `${baseUrl}/@${username}`;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collection...</p>
        </div>
      </div>
    );
  }

  const collectionName = collectionSlug 
    ? collectionSlug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase())
    : null;

  const displayedProducts = products.slice(0, 12);

  return (
    <>
      <PublicPageMeta meta={meta!} />
      
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold">@{username}</h1>
                  {collectionName && (
                    <p className="text-xl text-white/80">Collection: {collectionName}</p>
                  )}
                </div>
              </div>
              <p className="text-white/80 mb-6 max-w-2xl mx-auto">
                {collectionName 
                  ? `Browse this curated collection of products. Shared with ❤️ on shopmatic.cc`
                  : `Browse curated product collections. Shared on shopmatic.cc`}
              </p>
              <ShareButtons url={pageUrl} title={collectionName ? `${collectionName} by @${username}` : `@${username}'s Collections`} />
            </div>
          </div>

          <div className="container mx-auto px-4 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">
                {collectionName || "All Products"}
              </h2>
              <span className="text-muted-foreground">
                {displayedProducts.length} products
              </span>
            </div>

            {displayedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground mb-4">No products in this collection yet.</p>
                <p className="text-sm text-muted-foreground">
                  Check back later or browse other collections.
                </p>
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default CollectionPage;
