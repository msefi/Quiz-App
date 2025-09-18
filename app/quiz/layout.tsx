import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ModalProvider from "@/components/modals/modal-provider";
import { Toaster } from "@/components/ui/sonner";
import "./user.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Testly - Test Your Knowledge!",
  description: "A Quiz App built using Next JS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
        <ModalProvider />
        {children}
        <Toaster position="top-center" duration={5000} richColors />
    </>
  );
}
