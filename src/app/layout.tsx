import type { Metadata } from "next";
import { Inter, Outfit, Lora } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "KyoPrep — Tripura Exam Prep | TPSC, JRBT, T-TET, Forest Guard",
  description: "Tripura's own premium bilingual preparation platform for TPSC, JRBT, T-TET, Forest Guard, and Police exams. Join the waitlist to practice mock tests and daily quizzes.",
  keywords: "Tripura exam prep, TPSC Combined, JRBT Group C, JRBT Group D, T-TET, Forest Guard Tripura, Police SI exam, Bengali exam prep, kyoprep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} ${lora.variable}`}>
      <body style={{ fontFamily: "var(--font-inter)" }}>{children}</body>
    </html>
  );
}
