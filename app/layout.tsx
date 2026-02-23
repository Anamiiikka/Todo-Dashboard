import "./globals.css";
import { ReactNode } from "react";
import { AppProviders } from "./providers";

export const metadata = {
  title: "Todo Dashboard | RoundTechSquare",
  description: "Frontend assignment todo dashboard with pagination"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
