import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { MuiThemeWrapper } from '@/components/MuiThemeWrapper';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider as NextThemesProvider } from '@/components/ThemeProvider';
import { Navbar } from '@/components/Navbar';
import { AuthProvider } from '@/context/AuthContext';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Antigravity AI Software House',
  description: 'Founder Dashboard for managing AI Agents',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased dark:bg-slate-950 dark:text-slate-50 bg-slate-50 text-slate-900 transition-colors duration-300`}>
        <AppRouterCacheProvider>
          <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
            <MuiThemeWrapper>
              <AuthProvider>
                <CssBaseline />
                <Navbar />
                <main className="min-h-screen pt-4 pb-12">
                  {children}
                </main>
              </AuthProvider>
            </MuiThemeWrapper>
          </NextThemesProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
