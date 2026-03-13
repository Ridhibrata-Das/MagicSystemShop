import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { SystemMessageProvider } from "@/contexts/SystemMessageContext";
import { LoaderProvider } from "@/contexts/LoaderContext";
import Navbar from "@/components/Navbar";
import GlobalLoader from "@/components/GlobalLoader";
import "./globals.css";

const orbitron = Orbitron({ 
  subsets: ["latin"], 
  variable: '--font-orbitron',
  weight: ['400', '500', '700', '900']
});

const rajdhani = Rajdhani({ 
  subsets: ["latin"], 
  variable: '--font-rajdhani',
  weight: ['300', '400', '500', '600', '700'] 
});


export const metadata: Metadata = {
  title: "MagicSystem Shop",
  description: "Acquire magical items.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
      <body className="antialiased min-h-screen flex flex-col font-rajdhani">
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-20">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          <div className="w-full h-2 bg-system-accent/30 animate-scanline shadow-[0_0_15px_rgba(0,240,255,0.5)]"></div>
        </div>
        
        <LoaderProvider>
          <SystemMessageProvider>
            <CartProvider>
              <Navbar />
              <GlobalLoader />
              <main className="flex-1 relative z-0 mt-4 px-4 pb-12 sm:px-6 lg:px-8 mx-auto w-full">
                {children}
              </main>
            </CartProvider>
          </SystemMessageProvider>
        </LoaderProvider>
      </body>
    </html>
  );
}
