import "./globals.css";
import { Inter } from "next/font/google";
import { CustomCursor } from "./components/CustomCursor";
import { Providers } from "./components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "MetaPass - The Magic of Tradable Memberships",
  description: "Unleash the Future of Access with Blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          <CustomCursor />
        </Providers>
      </body>
    </html>
  );
}
