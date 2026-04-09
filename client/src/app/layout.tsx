// app/layout.tsx
import "./globals.css";
import { ReactNode } from "react";




export const metadata = {
  title: "RetailIQ",
  description: "Smart retail analytics and management platform",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen  text-gray-900 flex flex-col overflow-x-hidden">
        
        <main className="flex-grow">{children}</main>
        
      </body>

    </html>
  );
}
