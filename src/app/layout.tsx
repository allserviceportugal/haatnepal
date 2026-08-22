import type { Metadata } from "next";
import { Mukta } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/lib/cart/cart-context";
import { AuthSessionSync } from "@/components/auth-session-sync";

const mukta = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-mukta",
});

export const metadata: Metadata = {
  title: "Haat Nepal",
  description: "A Nepal-focused marketplace for classifieds, property, jobs, and businesses.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${mukta.variable}`}>
      <body className="min-h-full bg-[#f1f2f4] text-slate-900">
        <CartProvider>
          <AuthSessionSync />
          <SiteHeader />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
