import './globals.css'

export const metadata = {
  title: "InternHub - Your Ultimate Intern Management System",
  description: "Intern Management System for Students and Companies. Streamline your internship experience with InternHub, the ultimate platform for managing internships, connecting students with companies, and fostering professional growth.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className='bg-blue-950 text-blue-100'>{children}</body>
    </html>
  );
}