export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  severity?: 'error' | 'warning';
}

const BLOCKED_DOMAINS = [
  'illegal-products.com',
  'counterfeit-goods.net',
  'hate-speech-store.com',
  'violence-merchandise.com',
  'adult-content-xxx.com',
  'fraudulent-deals.shop',
];

const PROFANITY_LIST = [
  'fuck',
  'shit',
  'ass',
  'bitch',
  'damn',
  'bastard',
  'crap',
  'piss',
  'dick',
  'cock',
  'pussy',
  'nigger',
  'nigga',
  'faggot',
  'slut',
  'whore',
];

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return null;
  }
}

function containsProfanity(text: string): string | null {
  const lowerText = text.toLowerCase();
  for (const word of PROFANITY_LIST) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(lowerText)) {
      return word;
    }
  }
  return null;
}

export function validateProductDomain(url: string): ModerationResult {
  const domain = extractDomain(url);
  
  if (!domain) {
    return { allowed: true };
  }
  
  for (const blocked of BLOCKED_DOMAINS) {
    if (domain === blocked || domain.endsWith(`.${blocked}`)) {
      return {
        allowed: false,
        reason: `Products from '${domain}' are not allowed due to content policy violations.`,
        severity: 'error',
      };
    }
  }
  
  return { allowed: true };
}

export function validateProductContent(title: string, description: string): ModerationResult {
  const profanityInTitle = containsProfanity(title);
  if (profanityInTitle) {
    return {
      allowed: false,
      reason: `Title contains inappropriate language ('${profanityInTitle}'). Please use professional language.`,
      severity: 'error',
    };
  }
  
  const profanityInDesc = containsProfanity(description);
  if (profanityInDesc) {
    return {
      allowed: false,
      reason: `Description contains inappropriate language ('${profanityInDesc}'). Please use professional language.`,
      severity: 'error',
    };
  }
  
  const titleLower = title.toLowerCase();
  const descLower = description.toLowerCase();
  
  const flaggedTerms = [
    { term: 'counterfeit', message: 'Counterfeit products are not allowed' },
    { term: 'fake replica', message: 'Replica/counterfeit items are not allowed' },
    { term: 'illegal', message: 'Illegal products or services are not allowed' },
    { term: 'stolen goods', message: 'Stolen goods are not allowed' },
    { term: 'hitman', message: 'This type of product is not allowed' },
    { term: 'assassin', message: 'This type of product is not allowed' },
    { term: 'drugs', message: 'Illegal drugs or controlled substances are not allowed' },
  ];
  
  for (const { term, message } of flaggedTerms) {
    if (titleLower.includes(term) || descLower.includes(term)) {
      return {
        allowed: false,
        reason: message,
        severity: 'error',
      };
    }
  }
  
  return { allowed: true };
}

export function moderateProduct(url: string, title: string, description: string): ModerationResult {
  const domainCheck = validateProductDomain(url);
  if (!domainCheck.allowed) {
    return domainCheck;
  }
  
  const contentCheck = validateProductContent(title, description);
  if (!contentCheck.allowed) {
    return contentCheck;
  }
  
  return { allowed: true };
}
