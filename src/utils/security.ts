// Security utilities for CSP and other security measures
import DOMPurify from 'dompurify';

export class SecurityUtils {
  private static nonce: string | null = null;

  /**
   * Generate a cryptographically secure nonce for CSP
   */
  static generateNonce(): string {
    if (this.nonce) return this.nonce;
    
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    this.nonce = btoa(String.fromCharCode(...array));
    return this.nonce;
  }

  /**
   * Get the current nonce
   */
  static getNonce(): string | null {
    return this.nonce;
  }

  /**
   * Reset nonce (useful for testing)
   */
  static resetNonce(): void {
    this.nonce = null;
  }

  /**
   * Validate URL for XSS protection
   */
  static validateUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url);
      
      // Block javascript: protocol
      if (parsedUrl.protocol === 'javascript:') {
        return false;
      }
      
      // Block data: protocol for URLs (but allow for images)
      if (parsedUrl.protocol === 'data:') {
        return false;
      }
      
      // Block file: protocol
      if (parsedUrl.protocol === 'file:') {
        return false;
      }
      
      // Block FTP protocol
      if (parsedUrl.protocol === 'ftp:') {
        return false;
      }
      
      // Only allow HTTP and HTTPS
      return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch {
      return false;
    }
  }

  /**
   * Sanitize HTML to prevent XSS using DOMPurify
   */
  static sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ADD_ATTR: ['target'],
      FORCE_BODY: false,
      RETURN_DOM: false,
      RETURN_DOM_FRAGMENT: false,
    });
  }

  /**
   * Sanitize HTML for product descriptions (allows more formatting)
   */
  static sanitizeProductDescription(description: string): string {
    return DOMPurify.sanitize(description, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      ADD_ATTR: ['target'],
      ALLOW_DATA_ATTR: false,
    });
  }

  /**
   * Sanitize URL for use in href/src
   */
  static sanitizeUrl(url: string): string {
    if (!this.validateUrl(url)) {
      return '#';
    }
    return DOMPurify.sanitize(url, { RETURN_TRUSTED_TYPE: false });
  }

  /**
   * Validate and sanitize form data
   */
  static sanitizeFormData(data: Record<string, unknown>): Record<string, unknown> {
    const sanitized: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = DOMPurify.sanitize(value, {
          ALLOWED_TAGS: [],
          ALLOWED_ATTR: [],
        }).trim();
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(item => 
          typeof item === 'string' ? DOMPurify.sanitize(item, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] }) : item
        );
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Check if current context is secure (HTTPS)
   */
  static isSecureContext(): boolean {
    return window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }

  /**
   * Generate a secure random string
   */
  static generateSecureRandom(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    return Array.from(array, (byte) => chars[byte % chars.length]).join('');
  }

  /**
   * Create a hash of sensitive data
   */
  static async createHash(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Validate CSRF token format (actual validation done server-side)
   */
  static validateCSRFToken(token: string): boolean {
    // Basic format validation - token should be base64 encoded JSON
    if (!token || token.length < 10) return false;
    
    try {
      const decoded = atob(token);
      const data = JSON.parse(decoded);
      return !!(data.token && data.userId && data.expiresAt);
    } catch {
      return false;
    }
  }

  /**
   * Get security report for debugging
   */
  static getSecurityReport(): {
    isSecure: boolean;
    hasCSP: boolean;
    hasNonce: boolean;
    protocol: string;
    hostname: string;
  } {
    const meta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    return {
      isSecure: this.isSecureContext(),
      hasCSP: !!meta,
      hasNonce: !!this.nonce,
      protocol: window.location.protocol,
      hostname: window.location.hostname
    };
  }
}

// CSP violation reporting
interface CSPViolation {
  timestamp: string;
  directive: string;
  blockedURI: string;
  documentURI: string;
  sourceFile: string;
  lineNumber: number;
  columnNumber: number;
  sample: string;
}

export class CSPReporter {
  private static violations: CSPViolation[] = [];
  private static violationHandler: ((event: SecurityPolicyViolationEvent) => void) | null = null;

  /**
   * Initialize CSP violation reporting
   */
  static initialize(): void {
    if (this.violationHandler) return;
    this.violationHandler = (event: SecurityPolicyViolationEvent) => {
      this.handleViolation(event);
    };
    document.addEventListener('securitypolicyviolation', this.violationHandler);
  }

  /**
   * Cleanup CSP violation listener
   */
  static cleanup(): void {
    if (this.violationHandler) {
      document.removeEventListener('securitypolicyviolation', this.violationHandler);
      this.violationHandler = null;
    }
  }

  /**
   * Handle CSP violation
   */
  private static handleViolation(event: SecurityPolicyViolationEvent): void {
    const violation: CSPViolation = {
      timestamp: new Date().toISOString(),
      directive: event.violatedDirective,
      blockedURI: event.blockedURI,
      documentURI: event.documentURI,
      sourceFile: event.sourceFile,
      lineNumber: event.lineNumber,
      columnNumber: event.columnNumber,
      sample: event.sample
    };

    this.violations.push(violation);
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.warn('CSP Violation:', violation);
    }
    
    // In production, you might want to send this to an error tracking service
    // this.reportToService(violation);
  }

  /**
   * Get all recorded violations
   */
  static getViolations(): CSPViolation[] {
    return [...this.violations];
  }

  /**
   * Clear violations
   */
  static clearViolations(): void {
    this.violations = [];
  }
}

// Initialize security measures
export function initializeSecurity(): void {
  // Initialize CSP reporting
  CSPReporter.initialize();
  
  // Generate initial nonce
  SecurityUtils.generateNonce();
  
  // Log security status in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Report:', SecurityUtils.getSecurityReport());
  }
}