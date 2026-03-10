import { Layout } from "@/components/layout";
import { MessageCircle, Check } from "lucide-react";

export default function Success() {
  return (
    <Layout>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <div className="max-w-lg w-full glass-panel rounded-3xl p-10 md:p-14 flex flex-col items-center border border-white/[0.1] shadow-2xl shadow-black/50 transition-all">
          <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
            <span className="absolute inset-0 rounded-full" style={{ backgroundColor: 'rgba(107,111,163,0.12)', filter: 'blur(10px)' }} />
            <Check className="w-8 h-8 text-[var(--accent)] relative z-10" strokeWidth={3} />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-5 tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Idea Received.
          </h2>
          
          <p className="text-base text-white/50 mb-10 leading-relaxed font-light">
            We'll check it and contact you soon. If it's too complex for our current stage, we'll let you know honestly.
          </p>

          <a
            href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? ""}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-medium transition-colors w-full"
            style={{ border: '1px solid rgba(255,255,255,0.06)', color: 'var(--accent)' }}
          >
            <MessageCircle className="mr-3 h-5 w-5" />
            Follow up on WhatsApp
          </a>
        </div>
      </div>
    </Layout>
  );
}
