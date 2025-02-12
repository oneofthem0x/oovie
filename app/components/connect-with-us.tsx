import Link from "next/link"
import { HelpCircle, BookOpen, MessageCircle, ArrowRight } from "lucide-react"
import type React from "react"

const ConnectCard = ({
  icon: Icon,
  title,
  description,
  href,
}: {
  icon: React.ElementType
  title: string
  description: string
  href: string
}) => (
  <div className="group">
    <Link
      href={href}
      className="flex flex-col justify-between p-8 rounded-3xl bg-[#10F0A3] hover:bg-[#0ED08A] transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-6 h-6 text-white transition-transform duration-300 ease-in-out group-hover:scale-110" />
        <span className="text-xl font-medium text-white">{title}</span>
      </div>
      <div className="flex justify-between items-end">
        <span className="text-2xl font-bold max-w-[70%] text-white">{description}</span>
        <ArrowRight className="w-6 h-6 text-white transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
      </div>
    </Link>
  </div>
)

export default function ConnectWithUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16">
      <h2 className="text-4xl font-bold mb-8">Connect with us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConnectCard icon={HelpCircle} title="Help center" description="Get support" href="https://twitter.com/Oovoswap" />
        <ConnectCard
          icon={BookOpen}
          title="Blog"
          description="Insights and news from the team"
          href="https://twitter.com/Oovoswap"
        />
        <ConnectCard
          icon={MessageCircle}
          title="Stay connected"
          description="Follow @Oovoswap on X for the latest updates"
          href="https://twitter.com/Oovoswap/"
        />
      </div>
    </div>
  )
} 