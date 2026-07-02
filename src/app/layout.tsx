import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Finance OS",
    template: "%s | Finance OS",
  },
  description:
    "Track accounts, plan budgets, hit savings goals, and visualize your cashflow — all in one calm dashboard.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,s=localStorage.getItem("finance-os.theme");if(s==="dark")d.classList.add("dark");else if(s==="light")d.classList.remove("dark");else d.classList.remove("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
