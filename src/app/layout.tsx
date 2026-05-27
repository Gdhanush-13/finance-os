import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/providers/Providers";

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
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement,s=localStorage.getItem("finance-os.theme");if(s==="dark"||(s==null&&matchMedia("(prefers-color-scheme:dark)").matches))d.classList.add("dark")}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
