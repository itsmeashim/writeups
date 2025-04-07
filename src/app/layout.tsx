import "~/styles/globals.css"

import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Suspense } from "react"
import { Toaster } from "sonner"
import { TRPCReactProvider } from "~/trpc/react"

const APP_NAME = "Writeups"
const APP_DEFAULT_TITLE = "Writeups"
const APP_TITLE_TEMPLATE = "%s - Writeups"
const APP_DESCRIPTION = "Writeups"

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ffb6c1",
}

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang='en'
      className={`dark ${poppins.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
          <Toaster />
        </Suspense>
      </body>
    </html>
  )
}
