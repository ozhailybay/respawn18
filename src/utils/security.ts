// Security utilities for the application

// Fallback for DOMPurify if not available
let DOMPurify: any;
try {
  // Dynamic import for DOMPurify
  import('dompurify').then(module => {
    DOMPurify = module.default;
  }).catch(() => {
    // Fallback implementation if DOMPurify is not available
    DOMPurify = {
      sanitize: (html: string) => {
        // Basic HTML sanitization fallback
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '');
      }
    };
  });
} catch {
  // Fallback implementation if DOMPurify is not available
  DOMPurify = {
    sanitize: (html: string) => {
      // Basic HTML sanitization fallback
      return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
  };
}

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (html: string): string => {
  if (!DOMPurify) {
    // Fallback sanitization
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: ['class', 'id', 'style'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  });
};

/**
 * Validate file uploads
 */
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
} = {}): { isValid: boolean; error?: string } => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
    allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`
    };
  }

  // Check MIME type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `File type ${file.type} is not allowed`
    };
  }

  // Check file extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return {
      isValid: false,
      error: `File extension ${extension} is not allowed`
    };
  }

  return { isValid: true };
};

/**
 * Rate limiter for API calls
 */
export class RateLimiter {
  private requests = new Map<string, number[]>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 10, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.requests.set(userId, recentRequests);
    
    return true;
  }

  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(userId) || [];
    const recentRequests = userRequests.filter(time => now - time < this.windowMs);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  reset(userId: string): void {
    this.requests.delete(userId);
  }
}

/**
 * Input validation utilities
 */
export const validateInput = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  password: (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  text: (text: string, maxLength: number = 1000): boolean => {
    return text.length > 0 && text.length <= maxLength;
  },

  url: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
};

/**
 * Secure storage utilities
 */
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },

  getItem: <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return defaultValue || null;
    }
  },

  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },

  // Don't store sensitive data in localStorage
  setSecureItem: (key: string, value: any): void => {
    // For sensitive data, consider using sessionStorage or encrypted storage
    // This is a placeholder for future implementation
    console.warn('Sensitive data should not be stored in localStorage');
  }
};

/**
 * Error handling utilities
 */
export const secureErrorHandler = {
  logError: (error: Error, context?: string): void => {
    // Log error without exposing sensitive information
    console.error(`Error${context ? ` in ${context}` : ''}:`, {
      message: error.message,
      name: error.name,
      stack: false // Don't expose stack traces in production
    });
  },

  sanitizeErrorMessage: (error: Error): string => {
    // Return user-friendly error messages without exposing system details
    if (error.message.includes('permission-denied')) {
      return 'Access denied. Please check your permissions.';
    }
    if (error.message.includes('unauthenticated')) {
      return 'Please log in to continue.';
    }
    if (error.message.includes('not-found')) {
      return 'The requested resource was not found.';
    }
    if (error.message.includes('already-exists')) {
      return 'This resource already exists.';
    }
    
    return 'An error occurred. Please try again.';
  }
};

/**
 * CSRF protection utilities
 */
export const csrfProtection = {
  generateToken: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  validateToken: (token: string, storedToken: string): boolean => {
    return token === storedToken;
  }
};

/**
 * Content Security Policy utilities
 */
export const cspUtils = {
  generateNonce: (): string => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  },

  validateCSP: (policy: string): boolean => {
    // Basic CSP validation
    const requiredDirectives = ['default-src', 'script-src', 'style-src'];
    return requiredDirectives.every(directive => policy.includes(directive));
  }
}; 