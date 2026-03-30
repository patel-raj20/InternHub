# 🚀 InternHub Chatbot Widget – Quick Setup Checklist

## 📦 Files Provided

You have 4 files ready to integrate:

1. **`chatbot-widget.tsx`** – Main reusable chatbot widget component (recommended)
2. **`chatbot-config.ts`** – Configuration file
3. **`use-chatbot.ts`** – Optional hook for advanced use cases
4. **`chatbot-widget-custom.tsx`** – Alternative widget using the hook
5. **`CHATBOT_INTEGRATION.md`** – Detailed integration guide

## ⚡ 5-Minute Quick Setup

### 1️⃣ Copy Files to Your Project

```bash
# In your project2 root:

# Create directories
mkdir -p app/components/InternHubChatbot
mkdir -p lib
mkdir -p hooks

# Copy files from InternHUB project:
cp chatbot-widget.tsx → app/components/InternHubChatbot/ChatbotWidget.tsx
cp chatbot-config.ts → lib/chatbot-config.ts
cp use-chatbot.ts → hooks/use-chatbot.ts
```

### 2️⃣ Update `.env.local`

```env
NEXT_PUBLIC_CHATBOT_API_URL=http://localhost:8000
```

For production:
```env
NEXT_PUBLIC_CHATBOT_API_URL=https://your-backend-url.com
```

### 3️⃣ Add ThemeContext (if you don't have it)

Create `app/context/ThemeContext.tsx`:

```typescript
'use client';

import React, { createContext, useEffect, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches));
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    localStorage.setItem('theme', !isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark');
  };

  if (!mounted) return <>{children}</>;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4️⃣ Add Widget to Layout

Edit `app/layout.tsx`:

```typescript
import { ThemeProvider } from '@/app/context/ThemeContext';
import { ChatbotWidget } from '@/app/components/InternHubChatbot/ChatbotWidget';
import chatbotConfig from '@/lib/chatbot-config';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ThemeProvider>
          {children}
          <ChatbotWidget
            apiBaseUrl={chatbotConfig.apiBaseUrl}
            title={chatbotConfig.title}
            placeholder={chatbotConfig.placeholder}
            position={chatbotConfig.position}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### 5️⃣ Ensure CSS Animations

Add to your `globals.css`:

```css
@layer utilities {
  @keyframes fade-in-scale {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in-scale {
    animation: fade-in-scale 0.3s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  .delay-100 {
    animation-delay: 100ms;
  }

  .delay-200 {
    animation-delay: 200ms;
  }
}
```

## ✅ Verify It Works

1. **Terminal 1: Start your Next.js app**
   ```bash
   npm run dev
   ```

2. **Terminal 2: Start FastAPI backend**
   ```bash
   python app.py
   ```

3. **Open** `http://localhost:3000` (or your Next.js port)

4. **Look for green chat button** in bottom-right corner

5. **Click it and test** with: "Show active interns"

## 🎨 Design System Applied

✅ Forest Green primary color (`green-600`)
✅ Slate neutrals for light/dark mode
✅ Tailwind v4 compatible
✅ Rounded corners (`rounded-2xl`, `rounded-xl`)
✅ Smooth animations (fade-in-scale, slide-up)
✅ Full dark mode support
✅ Full responsive design

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Widget doesn't show | Check ThemeProvider wraps your app |
| "Error: Failed to get response" | Verify backend running at `http://localhost:8000/health` |
| Dark mode not working | Ensure ThemeContext is properly providing `isDark` |
| Messages not visible | Check API response has `results` and `columns` fields |

## 📚 Next Steps (Optional)

1. **Add authentication** – Pass JWT token in headers
2. **Export chat history** – Download conversation as JSON
3. **Custom styling** – Modify colors in ChatbotWidget.tsx
4. **Rate limiting** – Prevent message spam
5. **Multi-language** – Add i18n support

## 🎯 What's Included

### ChatbotWidget.tsx
- ✅ Floating button (bottom-right/left)
- ✅ Chat modal with message history
- ✅ Auto-scroll to latest messages
- ✅ Loading indicators
- ✅ SQL query display (collapsible)
- ✅ Dark/light mode sync
- ✅ Tailwind animations
- ✅ Table-formatted responses

### Features
- 🎨 Matches your ui-design.md spec exactly
- 🌓 Full dark mode support
- ⚡ Fast and lightweight
- 📱 Responsive on all devices
- 🔄 Real-time message streaming
- 🎯 Role-based queries supported

## 📖 Full Documentation

For detailed info, see `CHATBOT_INTEGRATION.md`.

## 🎉 You're Done!

The chatbot widget is now integrated and ready. Users can click the green button to start asking questions about their data!
