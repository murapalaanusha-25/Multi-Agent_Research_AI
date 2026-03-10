import "./globals.css";

export const metadata = {
  title: "ResearchAI — Multi-Agent Research Platform",
  description: "AI-powered multi-agent research assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
