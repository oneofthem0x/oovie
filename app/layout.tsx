import "../styles/global.css";
import "@rainbow-me/rainbowkit/styles.css";
import { Providers } from "./providers";
import Navbar from "./components/navbar";
import Stars from "./components/stars";
import Footer from "./components/footer";

export const metadata = {
  title: 'Oovo | Buy & Sell crypto with ease at crazy speeds. Fast like lightning.',
  description: 'Oovo | Buy & Sell crypto with ease at crazy speeds. Fast like lightning.',
  icons: [
    {
      rel: 'icon',
      url: '/favicon.png',
      type: 'image/png',
    },
  ],
}

function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="min-h-screen bg-black text-white">
      <body className="min-h-screen bg-black text-white">
        <Stars />
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}

export default RootLayout;
