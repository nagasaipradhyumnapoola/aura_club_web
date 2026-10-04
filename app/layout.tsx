import type { Metadata, Viewport } from "next";
import { Archivo, Geist, Geist_Mono } from "next/font/google";
import { AuraProvider } from "@/components/aura/AuraProvider";
import { site } from "@/data/site";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});
const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${site.name} — ${site.expansion}`,
  description: `${site.name} is the AI-native builders' club at ${site.institution}. Hackathons, projects, open learning and a way in.`,
  applicationName: site.name,
  openGraph: {
    title: `${site.name} — ${site.expansion}`,
    description: `The AI-native builders' club at ${site.institution}.`,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1eee8" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

// Runs before first paint: apply the saved (or system) theme and mark JS as available,
// so scripted reveals never flash their final state first.
const bootstrap = `(function(){var d=document.documentElement;try{var t=localStorage.getItem('aura-theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){d.dataset.theme='light'}d.dataset.js='1'})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
        <noscript>
          <style>{`[data-hide],.ln-i,[data-intro-text],[data-intro-cue],.intro-logo{opacity:1!important;visibility:visible!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body>
        <AuraProvider>{children}</AuraProvider>
      </body>
    </html>
  );
}
