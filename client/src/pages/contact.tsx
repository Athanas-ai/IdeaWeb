import { useState } from "react";
import { useLocation } from "wouter";
import { Layout } from "@/components/layout";
import { IdeaCard } from "@/components/idea-card";
import { useCreateOrder } from "@/hooks/use-orders";

const IDEAS = [
  {
    key: "cinematic",
    title: "Cinematic Slideshow",
    short: "A fullscreen cinematic page where images and text appear with smooth transitions, telling a visual story like a movie intro.",
    prompt:
      "Create a cinematic slideshow website where images and short text appear in fullscreen with smooth transitions. The page should feel like a visual story or movie intro with elegant animations and a dark modern design.",
  },
  {
    key: "aesthetic",
    title: "Aesthetic Note",
    short: "A minimal and beautifully styled webpage for sharing a message, letter, quote, or dedication.",
    prompt:
      "Create a minimal aesthetic webpage designed to present a message, letter, or quote in a visually elegant way. The design should focus on typography, spacing, and a calm visual style.",
  },
  {
    key: "photo-share",
    title: "Photo Sharing Website",
    short: "A simple website where a collection of photos can be shared through a single link.",
    prompt:
      "Create a photo sharing website where a set of images can be displayed in a clean gallery layout. Visitors should be able to browse the photos smoothly and view them clearly.",
  },
  {
    key: "interactive-wall",
    title: "Interactive Photo Wall",
    short: "A grid of photos where clicking each image reveals captions, messages, or small stories.",
    prompt:
      "Create an interactive photo wall where images are arranged in a grid layout. When a photo is clicked it reveals a caption, message, or description connected to that image.",
  },
  {
    key: "web-games",
    title: "Web Games",
    short: "A simple browser-based game that can be played directly on the webpage.",
    prompt:
      "Create a simple web game that runs directly in the browser. The interface should be clean and the gameplay simple and engaging.",
  },
  {
    key: "mini-business",
    title: "Mini Business Site",
    short: "A simple professional website for a small business, service, or personal project.",
    prompt:
      "Create a simple business website that introduces a service or small business. The site should include sections such as about, services, and contact information.",
  },
];

export default function Contact() {
  const [, setLocation] = useLocation();
  const [idea, setIdea] = useState("");
  const [selectedIdea, setSelectedIdea] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const createOrder = useCreateOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tIdea = idea.trim();
    const tName = name.trim();
    const tPhone = phone.trim();
    if (!tIdea || !tName || !tPhone) return;

    // basic phone validation
    const phoneNorm = tPhone.replace(/[^0-9+\- ]/g, "");
    if (phoneNorm.length < 6) return;

    createOrder.mutate(
      { idea: tIdea, name: tName, phone: phoneNorm },
      {
        onSuccess: () => setLocation("/success"),
      }
    );
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto w-full px-4 py-12 md:py-20">
        <div>
          <div className="mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Tell us what you're thinking.
            </h1>
            <p className="text-white/40 text-lg font-light">No technical jargon needed. Just the core idea.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-20">
            {/* Section 1 */}
            <section className="space-y-6">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-xs font-mono text-white/30 uppercase tracking-widest">01</span>
                <label className="block text-2xl font-medium text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
                  What's your idea?
                </label>
              </div>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="I want a website that shows a countdown to my dog's birthday with a massive background video..."
                className="w-full h-48 rounded-2xl glass-input p-6 text-lg resize-none shadow-inner"
                required
              />
            </section>

            {/* Section 2 */}
            <section className="space-y-6">
              <div className="flex items-end justify-between mb-2">
                <div className="flex items-end gap-4">
                  <span className="text-xs font-mono text-white/30 uppercase tracking-widest">02</span>
                  <label className="block text-2xl font-medium text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
                    Need a spark?
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 perspective-1000">
                {IDEAS.map((item, idx) => (
                  <IdeaCard
                    key={item.key}
                    title={item.title}
                    onClick={() => {
                      setSelectedIdea(idx);
                      setIdea(item.prompt);
                    }}
                  />
                ))}
              </div>

              {selectedIdea !== null && (
                <div className="mt-4 rounded-xl glass-panel p-4 text-sm text-white/80">
                  <div className="font-medium text-white/90">{IDEAS[selectedIdea].title}</div>
                  <div className="mt-2 text-white/60">{IDEAS[selectedIdea].short}</div>
                </div>
              )}
            </section>

            {/* Section 3 */}
            <section className="space-y-6">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-xs font-mono text-white/30 uppercase tracking-widest">03</span>
                <label className="block text-2xl font-medium text-white/90" style={{ fontFamily: 'var(--font-display)' }}>
                  About you
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full rounded-xl glass-input px-6 py-5 text-base"
                  required
                />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="WhatsApp Number"
                  className="w-full rounded-xl glass-input px-6 py-5 text-base"
                  required
                />
              </div>
            </section>

            <div className="pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-white/40 text-sm">We'll review your request before taking payment.</p>
              <button
                type="submit"
                disabled={createOrder.isLoading}
                className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-black font-semibold text-lg hover:bg-white/90 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {createOrder.isLoading ? "Submitting..." : `Submit Build Request — ₹${import.meta.env.VITE_BUILD_PRICE ?? 200}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}
