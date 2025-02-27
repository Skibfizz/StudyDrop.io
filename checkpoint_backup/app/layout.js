export const metadata = {
  title: 'Study Mind',
  description: 'Your study companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
} 