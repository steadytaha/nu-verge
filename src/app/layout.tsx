import type { Metadata } from "next";
import { ThemeProvider } from "@/providers/theme-provider"
import { DM_Sans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster"
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton
} from '@clerk/nextjs'
import "./globals.css";
import ModalProvider from "@/providers/modal-provider";
import { BillingProvider } from "@/providers/billing-provider";

const font = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "Little",
  description: "Automate Your Work Easily!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={font.className}
        >          
          <ThemeProvider
            attribute='class'
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <BillingProvider>
              <ModalProvider>
                {children}
                <Toaster />
              </ModalProvider>
            </BillingProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
