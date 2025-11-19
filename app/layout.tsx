import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import SkipToContent from "@/components/SkipToContent";
import TaskSidePanelWrapper from "@/components/TaskSidePanelWrapper";
import { ToastProvider } from "@/components/Toast";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Green Silicon Valley",
    template: "%s | Green Silicon Valley"
  },
  description:
    "Student-led nonprofit empowering environmental STEM education through peer-to-peer presentations.",
  keywords: ["environmental education", "STEM", "nonprofit", "student-led", "sustainability", "Silicon Valley"],
  authors: [{ name: "Green Silicon Valley" }],
  creator: "Green Silicon Valley",
  publisher: "Green Silicon Valley",
  icons: [{ rel: "icon", url: "/favicon.svg" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    title: "Green Silicon Valley",
    description: "Student-led nonprofit empowering environmental STEM education through peer-to-peer presentations.",
    siteName: "Green Silicon Valley"
  },
  twitter: {
    card: "summary_large_image",
    title: "Green Silicon Valley",
    description: "Student-led nonprofit empowering environmental STEM education through peer-to-peer presentations."
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>
        <ThemeProvider>
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <SkipToContent />
              <NavBar />
              <main id="main-content" className="flex-1" role="main">{children}</main>
              <Footer />
              <TaskSidePanelWrapper />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}


