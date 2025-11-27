import './globals.css';
import { ThemeProvider } from 'next-themes';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Verse - A place to read, write, and connect',
    description: 'A Medium clone built with Next.js 15, Sanity CMS, and NextAuth',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-white text-black dark:bg-slate-900 dark:text-white transition-colors duration-300 antialiased">
                <Providers>
                    <ThemeProvider attribute="class" defaultTheme="light">
                        <div className="min-h-screen flex flex-col">
                            <Navbar />
                            {children}
                        </div>
                    </ThemeProvider>
                </Providers>
            </body>
        </html>
    );
}
