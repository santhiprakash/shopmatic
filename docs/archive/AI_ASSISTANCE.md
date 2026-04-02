# AI Assistance with ChatGPT

## Overview

Integrate ChatGPT AI assistance throughout the platform to help users with product management, content creation, and optimization.

---

## Current AI Implementation

### Existing: OpenAI Product Extraction
- **Location:** `src/services/OpenAIService.ts`
- **Model:** GPT-4o-mini
- **Purpose:** Extract product data from URLs
- **Status:** ✅ Implemented

---

## Proposed AI Features

### 1. Product Description Enhancement
**Use Case:** Improve product descriptions for better engagement

```typescript
// src/services/AIAssistant.ts
export const aiAssistant = {
  async enhanceDescription(originalDescription: string, productTitle: string) {
    const prompt = `
      Enhance this product description to be more engaging and SEO-friendly.
      Keep it concise (max 200 words) and highlight key benefits.
      
      Product: ${productTitle}
      Original Description: ${originalDescription}
      
      Return only the enhanced description, no additional text.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a product copywriting expert specializing in e-commerce.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.choices[0].message.content;
  },
};
```

### 2. SEO Optimization
**Use Case:** Generate SEO-friendly titles and meta descriptions

```typescript
async generateSEOContent(product: Product) {
  const prompt = `
    Generate SEO-optimized content for this product:
    
    Title: ${product.title}
    Description: ${product.description}
    Category: ${product.category}
    Price: ${product.price} ${product.currency}
    
    Return JSON with:
    {
      "seo_title": "optimized title (max 60 chars)",
      "meta_description": "meta description (max 160 chars)",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an SEO expert specializing in e-commerce product optimization.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 3. Category & Tag Suggestions
**Use Case:** Auto-suggest relevant categories and tags

```typescript
async suggestCategoriesAndTags(product: Product) {
  const prompt = `
    Suggest relevant categories and tags for this product:
    
    Title: ${product.title}
    Description: ${product.description}
    
    Return JSON with:
    {
      "categories": ["category1", "category2"],
      "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
    }
    
    Categories should be broad (e.g., Electronics, Fashion, Home)
    Tags should be specific (e.g., wireless, bluetooth, portable)
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product categorization expert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.3,
    max_tokens: 150,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 4. Product Comparison
**Use Case:** Help users compare similar products

```typescript
async compareProducts(products: Product[]) {
  const productList = products.map(p => ({
    title: p.title,
    price: p.price,
    description: p.description,
  }));

  const prompt = `
    Compare these products and provide a summary:
    
    ${JSON.stringify(productList, null, 2)}
    
    Return JSON with:
    {
      "summary": "brief comparison summary",
      "best_value": "product title",
      "best_features": "product title",
      "pros_cons": {
        "product_title": {
          "pros": ["pro1", "pro2"],
          "cons": ["con1", "con2"]
        }
      }
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product comparison expert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 500,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 5. Content Ideas Generator
**Use Case:** Generate content ideas for social media posts

```typescript
async generateContentIdeas(product: Product) {
  const prompt = `
    Generate 5 social media post ideas for this product:
    
    Product: ${product.title}
    Description: ${product.description}
    
    Return JSON with:
    {
      "ideas": [
        {
          "platform": "Instagram|Twitter|Facebook",
          "content": "post content",
          "hashtags": ["hashtag1", "hashtag2"]
        }
      ]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a social media marketing expert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.8,
    max_tokens: 600,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 6. Smart Search & Recommendations
**Use Case:** Semantic search and product recommendations

```typescript
async semanticSearch(query: string, products: Product[]) {
  // Generate embeddings for query
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  // Compare with product embeddings (pre-computed)
  const results = products.map(product => ({
    product,
    similarity: cosineSimilarity(
      queryEmbedding.data[0].embedding,
      product.embedding
    ),
  }))
  .sort((a, b) => b.similarity - a.similarity)
  .slice(0, 10);

  return results.map(r => r.product);
}

async getRecommendations(product: Product, allProducts: Product[]) {
  const prompt = `
    Based on this product, recommend 5 similar products:
    
    Current Product: ${product.title}
    Category: ${product.category}
    Price: ${product.price}
    
    Available Products:
    ${allProducts.map(p => `- ${p.title} (${p.category}, ${p.price})`).join('\n')}
    
    Return JSON with:
    {
      "recommendations": ["product_title1", "product_title2", ...]
    }
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a product recommendation expert.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.5,
    max_tokens: 200,
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content);
}
```

### 7. AI Chat Assistant
**Use Case:** Interactive help for users

```typescript
async chatAssistant(messages: ChatMessage[], context?: {
  products?: Product[];
  user?: User;
}) {
  const systemPrompt = `
    You are an AI assistant for eComJunction, a platform for affiliate marketers.
    Help users with:
    - Product management
    - Content creation
    - SEO optimization
    - Marketing strategies
    
    ${context?.products ? `User has ${context.products.length} products.` : ''}
    ${context?.user ? `User plan: ${context.user.subscription_plan}` : ''}
    
    Be helpful, concise, and actionable.
  `;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...messages,
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return response.choices[0].message.content;
}
```

---

## UI Components

### AI Enhancement Button

```typescript
// src/components/ai/AIEnhanceButton.tsx
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function AIEnhanceButton({ 
  text, 
  onEnhanced,
  type = 'description' 
}: {
  text: string;
  onEnhanced: (enhanced: string) => void;
  type?: 'description' | 'title' | 'seo';
}) {
  const [loading, setLoading] = useState(false);

  const handleEnhance = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, type }),
      });

      const { enhanced } = await response.json();
      onEnhanced(enhanced);
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEnhance}
      disabled={loading}
      variant="outline"
      size="sm"
    >
      <Sparkles className="w-4 h-4 mr-2" />
      {loading ? 'Enhancing...' : 'Enhance with AI'}
    </Button>
  );
}
```

### AI Chat Widget

```typescript
// src/components/ai/AIChatWidget.tsx
import { MessageCircle, X, Send } from 'lucide-react';
import { useState } from 'react';

export function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      const { reply } = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:scale-110 transition"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-96 h-[500px] flex flex-col">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">AI Assistant</h3>
            <button onClick={() => setOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything..."
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-primary text-white p-2 rounded-lg disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## API Routes

```typescript
// api/ai/enhance.ts
export async function POST(req: Request) {
  const { text, type } = await req.json();
  const user = await getAuthenticatedUser(req);

  // Check user plan limits
  const usage = await getAIUsage(user.id);
  const limit = AI_LIMITS[user.subscription_plan];

  if (usage >= limit) {
    return Response.json(
      { error: 'AI usage limit reached' },
      { status: 429 }
    );
  }

  let enhanced;
  switch (type) {
    case 'description':
      enhanced = await aiAssistant.enhanceDescription(text, '');
      break;
    case 'title':
      enhanced = await aiAssistant.generateSEOContent({ title: text });
      break;
    default:
      enhanced = text;
  }

  // Track usage
  await trackAIUsage(user.id, type);

  return Response.json({ enhanced });
}

// api/ai/chat.ts
export async function POST(req: Request) {
  const { messages } = await req.json();
  const user = await getAuthenticatedUser(req);

  // Get user context
  const products = await getUserProducts(user.id);
  
  const reply = await aiAssistant.chatAssistant(messages, {
    products,
    user,
  });

  return Response.json({ reply });
}
```

---

## Usage Limits by Plan

```typescript
const AI_LIMITS = {
  free: {
    enhancements: 10, // per month
    chat_messages: 50, // per month
    extractions: 20, // per month
  },
  pro: {
    enhancements: 100,
    chat_messages: 500,
    extractions: 200,
  },
  enterprise: {
    enhancements: -1, // unlimited
    chat_messages: -1,
    extractions: -1,
  },
};
```

---

## Database Schema

```sql
-- Track AI usage
CREATE TABLE ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature VARCHAR(50) NOT NULL, -- 'enhancement', 'chat', 'extraction'
    tokens_used INTEGER NOT NULL,
    cost DECIMAL(10, 4), -- track cost
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_usage_user_id ON ai_usage(user_id);
CREATE INDEX idx_ai_usage_created_at ON ai_usage(created_at);

-- Monthly usage view
CREATE VIEW ai_usage_monthly AS
SELECT 
    user_id,
    feature,
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as usage_count,
    SUM(tokens_used) as total_tokens,
    SUM(cost) as total_cost
FROM ai_usage
GROUP BY user_id, feature, DATE_TRUNC('month', created_at);
```

---

## Cost Management

### Token Tracking

```typescript
async function trackAIUsage(
  userId: string,
  feature: string,
  tokensUsed: number
) {
  const costPerToken = 0.00002; // GPT-4o-mini pricing
  const cost = tokensUsed * costPerToken;

  await db.query(`
    INSERT INTO ai_usage (user_id, feature, tokens_used, cost)
    VALUES ($1, $2, $3, $4)
  `, [userId, feature, tokensUsed, cost]);
}
```

### Monthly Budget Alerts

```typescript
async function checkBudget(userId: string) {
  const result = await db.queryOne(`
    SELECT SUM(cost) as total_cost
    FROM ai_usage
    WHERE user_id = $1
    AND created_at >= DATE_TRUNC('month', NOW())
  `, [userId]);

  const budget = AI_BUDGETS[user.subscription_plan];
  
  if (result.total_cost >= budget * 0.8) {
    // Send warning email
    await sendBudgetWarning(userId, result.total_cost, budget);
  }
}
```

---

## Testing

```typescript
// tests/ai-assistant.test.ts
describe('AI Assistant', () => {
  it('should enhance description', async () => {
    const original = 'Good product';
    const enhanced = await aiAssistant.enhanceDescription(original, 'Test Product');
    
    expect(enhanced.length).toBeGreaterThan(original.length);
    expect(enhanced).not.toBe(original);
  });

  it('should respect usage limits', async () => {
    const user = { id: 'test-user', subscription_plan: 'free' };
    
    // Use up limit
    for (let i = 0; i < 10; i++) {
      await trackAIUsage(user.id, 'enhancement', 100);
    }
    
    // Next request should fail
    await expect(
      aiAssistant.enhanceDescription('test', 'test')
    ).rejects.toThrow('Usage limit exceeded');
  });
});
```

---

## Deployment Checklist

- [ ] Set up OpenAI API key
- [ ] Implement AI service functions
- [ ] Create API routes
- [ ] Add UI components
- [ ] Set up usage tracking
- [ ] Configure usage limits
- [ ] Add cost monitoring
- [ ] Test all AI features
- [ ] Document for users
- [ ] Monitor costs

---

**Status:** Ready to implement  
**Estimated Time:** 2 weeks  
**Cost:** ~$20-50/month (depends on usage)  
**Model:** GPT-4o-mini ($0.15/1M input tokens, $0.60/1M output tokens)
