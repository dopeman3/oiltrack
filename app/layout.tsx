import "./globals.css";

export const metadata = {
  title: "OilTrack — Oil Change Reminders",
  description: "Track vehicle oil changes and send WhatsApp reminders.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}