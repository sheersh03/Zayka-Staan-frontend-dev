export const metadata = { title: 'LunchBuddy', description: 'Healthy lunchboxes for happy kids' }; import React from 'react';
import './globals.css';
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang='en'><body className='min-h-screen'>{children}</body></html> }