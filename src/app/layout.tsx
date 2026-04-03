import './globals.css'
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ContentLayout } from "@/components/layout/content-layout";
import { ThemeProvider } from "@/components/theme-provider";
import { AppProviders } from "@/components/providers";
import { MeshBackground } from "@/components/layout/mesh-background";
import { Toaster } from 'react-hot-toast';

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta"
});

export const metadata: Metadata = {
  title: "InternHub  ",
  description: "InternHub is a platform for managing interns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} min-h-screen bg-background text-foreground momentum-scroll`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <MeshBackground />
          <AppProviders>
            <Toaster />
            <ContentLayout>
              {children}
            </ContentLayout>
          </AppProviders>
        </ThemeProvider>
      </body>
    </html>
  );
}
