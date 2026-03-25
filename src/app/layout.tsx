import './globals.css'
import SessionWrapper from '@/utils/SessionWrapper'
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'InternHub - An internship management system',
  description: 'An internship management system for students and companies to connect and manage internship opportunities. InternHub built with Next.js, React, Tailwind CSS.',
  author: {
    name: 'InternHub Team',
    email: 'support@internhub.com',
  }
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className='bg-blue-950 text-blue-100'>
        <SessionWrapper>
          <Toaster />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}