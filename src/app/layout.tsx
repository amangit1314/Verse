import './globals.css';
import { ThemeProvider } from 'next-themes';
import type { Metadata } from 'next';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
    title: 'Verse - A place to read, write, and connect',
    description: 'A Medium-inspired publishing app built with Next.js and Appwrite',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="bg-[#f7f4ed] text-[#242424] antialiased transition-colors duration-300 dark:bg-[#11100e] dark:text-[#f5f1e8]">
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
