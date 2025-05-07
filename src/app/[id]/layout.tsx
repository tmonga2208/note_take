import React from "react";
import { Anton } from "next/font/google";
const antonFont = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div
        className={`${antonFont.variable} antialiased`}
          >
     {children}  
      </div>
  );
}