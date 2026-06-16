import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lado Matrimonial | Finding Perfect Matches, Building Lifelong Relationships",
  description: "Lado Matrimonial is India's premium matrimonial portal offering secure match-making, verified profiles, privacy controls, real-time chat, video calling, and dedicated relationship manager support.",
  keywords: [
    "matrimony",
    "matrimonial portal",
    "find soulmate",
    "indian wedding",
    "bride search",
    "groom search",
    "verified profiles",
    "shaadi",
    "lado matrimonial",
  ],
  authors: [{ name: "Lado Matrimonial Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
