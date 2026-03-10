import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 text-center mt-[-4rem]">
        <div className="max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center rounded-full glass-panel px-4 py-1.5 text-xs font-medium text-white/70 mb-10 border-white/[0.1]">
            <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: 'var(--accent)' }} />
            {`₹${import.meta.env.VITE_BUILD_PRICE ?? 200} Experimental Build`}
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Got an idea?<br />
            <span className="text-white/50">Let's make it real.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/50 mb-12 max-w-xl mx-auto font-light leading-relaxed">
            Any idea — serious or stupid. We build minimal, single-purpose web apps that look incredible.
          </p>

          <Link
            href="/contact"
            className="group relative inline-flex items-center justify-center rounded-full bg-white text-black px-8 py-4 text-base font-semibold hover:bg-white/90 active:scale-95 transition-all duration-200"
          >
            Start a Build 
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </Layout>
  );
}
