
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Sun, Moon, User, Settings, BarChart, ShoppingBag, Menu, Crown, Sparkles, Share2 } from "lucide-react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const { resetTheme, darkMode, toggleDarkMode } = useTheme();
  const { user, isAuthenticated, logout, isDemo } = useAuth();

  // Add scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all ${
      isScrolled ? "bg-background/95 shadow-sm" : "bg-background/70"
    }`}>
      <div className="container max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-brand bg-clip-text text-transparent">
              Shopmatic
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link to="/" className={navigationMenuTriggerStyle()}>
                Home
              </Link>
            </NavigationMenuItem>
            
            {/* Only show these items for logged-in users */}
            {isAuthenticated && (
              <>
                <NavigationMenuItem>
                  <Link to="/dashboard" className={navigationMenuTriggerStyle()}>
                    Dashboard
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/my-products" className={navigationMenuTriggerStyle()}>
                    My Products
                  </Link>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <Link to="/analytics" className={navigationMenuTriggerStyle()}>
                    Analytics
                  </Link>
                </NavigationMenuItem>
              </>
            )}
            
            {/* Only show Categories menu for non-authenticated users */}
            {!isAuthenticated && (
              <NavigationMenuItem>
                <NavigationMenuTrigger>Categories</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <Link to="/?category=Electronics" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                      <div className="text-sm font-medium">Electronics</div>
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        Gadgets, devices, and tech accessories
                      </div>
                    </Link>
                    <Link to="/?category=Fashion" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                      <div className="text-sm font-medium">Fashion</div>
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        Clothing, shoes, and accessories
                      </div>
                    </Link>
                    <Link to="/?category=Home" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                      <div className="text-sm font-medium">Home & Kitchen</div>
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        Furniture, appliances, and decor
                      </div>
                    </Link>
                    <Link to="/?category=Beauty" className="block select-none rounded-md p-3 hover:bg-accent hover:text-accent-foreground">
                      <div className="text-sm font-medium">Beauty</div>
                      <div className="line-clamp-2 text-sm text-muted-foreground">
                        Skincare, makeup, and personal care
                      </div>
                    </Link>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            )}
            
            <NavigationMenuItem>
              <Link to="/help-center" className={navigationMenuTriggerStyle()}>
                Help Center
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleDarkMode} className="rounded-full" title={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {/* User menu dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <User className="h-5 w-5" />
                {isDemo && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2 w-2 text-white" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {isAuthenticated ? (
                <>
                  {/* User info header */}
                  <div className="px-2 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-sm font-medium truncate">
                            {user?.name || 'User'}
                          </p>
                          {isDemo && <Sparkles className="h-3 w-3 text-blue-500" />}
                          {user?.plan === 'pro' && <Crown className="h-3 w-3 text-yellow-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                        {isDemo && (
                          <p className="text-xs text-blue-600 font-medium">Demo Mode</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/analytics">
                      <BarChart className="mr-2 h-4 w-4" />
                      <span>Analytics</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={resetTheme}>
                    <Sun className="mr-2 h-4 w-4" />
                    <span>Reset Theme</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/privacy-settings">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Privacy Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    onClick={logout}
                  >
                    Sign out
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem 
                    className="cursor-pointer" 
                    onClick={() => {
                      setAuthModalTab('login');
                      setShowAuthModal(true);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="cursor-pointer"
                    onClick={() => {
                      setAuthModalTab('register');
                      setShowAuthModal(true);
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Register</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Mobile menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 py-6">
                <Link to="/" className="flex items-center">
                  <span className="text-xl font-bold">Shopmatic</span>
                </Link>
                
                <nav className="flex flex-col space-y-4">
                  <SheetClose asChild>
                    <Link to="/" className="py-2 text-base">Home</Link>
                  </SheetClose>
                  
                  {isAuthenticated && (
                    <>
                      <SheetClose asChild>
                        <Link to="/dashboard" className="py-2 text-base">Dashboard</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/my-products" className="py-2 text-base">My Products</Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link to="/analytics" className="py-2 text-base">Analytics</Link>
                      </SheetClose>
                    </>
                  )}
                  
                  <SheetClose asChild>
                    <Link to="/help-center" className="py-2 text-base">Help Center</Link>
                  </SheetClose>
                </nav>
                
                <div className="mt-auto space-y-4">
                  {!isAuthenticated ? (
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => {
                        setAuthModalTab('login');
                        setShowAuthModal(true);
                      }}>Sign In</Button>
                      <Button variant="outline" onClick={() => {
                        setAuthModalTab('register');
                        setShowAuthModal(true);
                      }}>Register</Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {user && (
                        <div className="flex items-center gap-2 p-2 bg-muted rounded">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user.name}</p>
                            {isDemo && <p className="text-xs text-blue-600">Demo Mode</p>}
                          </div>
                        </div>
                      )}
                      <Button 
                        variant="destructive"
                        onClick={logout}
                        className="w-full"
                      >
                        Sign Out
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        open={showAuthModal}
        onOpenChange={setShowAuthModal}
        defaultTab={authModalTab}
      />

    </header>
  );
}
