import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ExternalLink,
  Check
} from 'lucide-react';
import { SecurityUtils } from '@/utils/security';

interface SocialMediaHandle {
  platform: string;
  username: string;
  url: string;
  verified?: boolean;
}

interface SocialMediaDisplayProps {
  socialLinks: Record<string, SocialMediaHandle>;
  variant?: 'default' | 'compact' | 'icons-only';
  showVerified?: boolean;
}

const SOCIAL_PLATFORMS = [
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    hoverColor: 'hover:from-purple-600 hover:to-pink-600'
  },
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-500',
    hoverColor: 'hover:bg-red-600'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: Instagram,
    color: 'bg-black',
    hoverColor: 'hover:bg-gray-800'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-600',
    hoverColor: 'hover:bg-blue-700'
  }
];

function getSafeUrl(url: string): string {
  if (SecurityUtils.validateUrl(url)) {
    return url;
  }
  return '#';
}

export default function SocialMediaDisplay({ 
  socialLinks, 
  variant = 'default',
  showVerified = true 
}: SocialMediaDisplayProps) {
  const connectedHandles = Object.values(socialLinks || {});

  if (connectedHandles.length === 0) {
    return null;
  }

  const renderIconsOnly = () => (
    <div className="flex items-center gap-2">
      {connectedHandles.map((handle) => {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === handle.platform);
        if (!platform) return null;

        const Icon = platform.icon;
        const safeUrl = getSafeUrl(handle.url);
        
        return (
          <a
            key={handle.platform}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`p-2 rounded-full ${platform.color} ${platform.hoverColor} text-white transition-all duration-200 hover:scale-110 shadow-md hover:shadow-lg`}
            title={`${platform.name}: @${handle.username}`}
            onClick={safeUrl === '#' ? (e) => e.preventDefault() : undefined}
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );

  const renderCompact = () => (
    <div className="flex flex-wrap gap-2">
      {connectedHandles.map((handle) => {
        const platform = SOCIAL_PLATFORMS.find(p => p.id === handle.platform);
        if (!platform) return null;

        const Icon = platform.icon;
        const safeUrl = getSafeUrl(handle.url);
        
        return (
          <a
            key={handle.platform}
            href={safeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
            onClick={safeUrl === '#' ? (e) => e.preventDefault() : undefined}
          >
            <Button
              variant="outline"
              size="sm"
              className={`gap-2 ${platform.color} ${platform.hoverColor} text-white border-0 transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md`}
            >
              <Icon className="h-3 w-3" />
              <span className="text-xs">@{handle.username}</span>
              {showVerified && handle.verified && (
                <Check className="h-3 w-3" />
              )}
            </Button>
          </a>
        );
      })}
    </div>
  );

  const renderDefault = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Follow me on</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {connectedHandles.map((handle) => {
          const platform = SOCIAL_PLATFORMS.find(p => p.id === handle.platform);
          if (!platform) return null;

          const Icon = platform.icon;
          const safeUrl = getSafeUrl(handle.url);
          
          return (
            <a
              key={handle.platform}
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group"
              onClick={safeUrl === '#' ? (e) => e.preventDefault() : undefined}
            >
              <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md bg-card">
                <div className={`p-2 rounded-lg ${platform.color} text-white group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{platform.name}</span>
                    {showVerified && handle.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    @{handle.username}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors duration-200" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );

  switch (variant) {
    case 'icons-only':
      return renderIconsOnly();
    case 'compact':
      return renderCompact();
    default:
      return renderDefault();
  }
}

export function SocialMediaQuickLinks({ socialLinks }: { socialLinks: Record<string, SocialMediaHandle> }) {
  return (
    <div className="flex items-center gap-1">
      <SocialMediaDisplay 
        socialLinks={socialLinks} 
        variant="icons-only" 
        showVerified={false} 
      />
    </div>
  );
}

export function SocialMediaProfileCard({ socialLinks }: { socialLinks: Record<string, SocialMediaHandle> }) {
  const connectedHandles = Object.values(socialLinks || {});
  
  if (connectedHandles.length === 0) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <SocialMediaDisplay 
        socialLinks={socialLinks} 
        variant="default" 
        showVerified={true} 
      />
    </div>
  );
}
