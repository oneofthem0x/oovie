import Link from "next/link"
import { Twitter } from "lucide-react"
import type React from "react"

const SocialIcon = ({ icon: Icon, href }: { icon: React.ElementType; href: string }) => (
  <Link href={href} className="text-gray-400 hover:text-white">
    <Icon className="w-8 h-8" />
  </Link>
)

export default function Footer() {
  return (
    <footer className="bg-black text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-800 pt-8">
          <div className="flex gap-4 mb-4 sm:mb-0">
            <SocialIcon icon={Twitter} href="https://twitter.com/Oovoswap" />
          </div>
          <div className="text-sm text-gray-400 mb-4 sm:mb-0">© 2025 - Oovo</div>
          <div className="flex gap-4 text-sm text-gray-400"></div>
        </div>
      </div>
    </footer>
  )
} 