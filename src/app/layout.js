import { Inter } from "next/font/google";
import "../styles/globals.css";
import ClientNavbar from "../components/layout/ClientNavbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "RSTL Appointment Portal",
  description: "Regional Standards and Testing Laboratories Appointment Portal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ClientNavbar />
        <main>{children}</main>
      </body>
    </html>
  );
} 