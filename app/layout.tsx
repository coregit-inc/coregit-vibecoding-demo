import type { Metadata } from "next";
import { Forum, Host_Grotesk } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const forum = Forum({
  weight: "400",
  variable: "--font-forum",
  subsets: ["latin"],
});

const hostGrotesk = Host_Grotesk({
  variable: "--font-host-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coregit Demo",
  description: "AI-powered code generation with Coregit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${forum.variable} ${hostGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
