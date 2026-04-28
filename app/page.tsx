import Link from 'next/link'
import { ArrowRight, Upload, BarChart3, Share2, Zap, Shield, Palette } from 'lucide-react'
import { Button } from '@/components/ui/Button'

const features = [
  {
    icon: Upload,
    title: 'One-Click Upload',
    description: 'Upload CSV or Excel files in seconds. Our smart parser automatically detects columns and types.',
  },
  {
    icon: BarChart3,
    title: 'Beautiful Charts',
    description: 'Build bar, line, and pie charts with a point-and-click interface. No code required.',
  },
  {
    icon: Share2,
    title: 'Share Instantly',
    description: 'Generate a public link to share your dashboard. Embed anywhere, no login required for viewers.',
  },
  {
    icon: Zap,
    title: 'Instant Processing',
    description: 'All parsing happens in your browser. Your data never touches our servers until you save.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade Supabase infrastructure. Your data is encrypted and RLS-protected.',
  },
  {
    icon: Palette,
    title: 'Customizable',
    description: 'Choose colors, titles, and layouts. Make each dashboard uniquely yours.',
  },
]

const testimonials = [
  {
    quote: "Finally a BI tool that doesn't require a PhD to use. Built my sales dashboard in 20 minutes.",
    author: "Sarah Chen",
    role: "Small Business Owner"
  },
  {
    quote: "Perfect for student projects. Got full marks for demonstrating full-stack architecture.",
    author: "James Okonkwo",
    role: "Computer Science Student"
  }
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0b0f]">
      {/* Hero */}
      <header className="relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#4f8ef7] opacity-[0.07] blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#7c5cfc] opacity-[0.07] blur-[120px]" />
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }} />
        </div>

        <div className="max-w-6xl mx-auto px-6 pt-24 pb-20 lg:pt-32 lg:pb-28 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111318] border border-white/[0.08] text-xs font-medium text-[#8b91a7] mb-6 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4f8ef7] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4f8ef7]"></span>
              </span>
              Now in public beta
            </div>

            <h1 className="text-5xl lg:text-7xl font-display font-bold tracking-tight mb-6 animate-slide-up">
              Data insights,
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4f8ef7] via-[#7c5cfc] to-[#fb7185]">
                no complexity.
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-[#8b91a7] max-w-2xl mx-auto leading-relaxed mb-10 animate-fade-in">
              Upload CSV or Excel files, transform them into interactive charts,
              and share dashboards with your team — all in your browser.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto shadow-lg shadow-[#4f8ef7]/20 hover:shadow-xl hover:shadow-[#4f8ef7]/30">
                  Start for free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto border-white/[0.08] hover:bg-white/[0.02]">
                  Sign in
                </Button>
              </Link>
            </div>

            {/* Hero Visual */}
            <div className="mt-16 relative animate-scale-in">
              <div className="absolute inset-0 -z-10 blur-3xl opacity-30">
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-[#4f8ef7] rounded-full mix-blend-multiply filter blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[#7c5cfc] rounded-full mix-blend-multiply filter blur-3xl" />
                <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-[#fb7185] rounded-full mix-blend-multiply filter blur-3xl" />
              </div>
              <div className="bg-[#111318]/80 backdrop-blur-sm border border-white/[0.08] shadow-xl rounded-2xl p-4 max-w-5xl mx-auto">
                <div className="bg-gradient-to-br from-[#111318] to-[#16191f] rounded-xl h-80 flex items-center justify-center overflow-hidden">
                  <BarChart3 className="w-32 h-32 text-[#4f8ef7] opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold text-[#f0f2f8] mb-4">
              Everything you need to understand your data
            </h2>
            <p className="text-lg text-[#8b91a7] max-w-2xl mx-auto">
              From raw spreadsheet to shareable dashboard in minutes, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="stat-card hover:-translate-y-1 transition-transform duration-300"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-[#111318] border border-white/[0.07]">
                    <feature.icon className="w-6 h-6 text-[#4f8ef7]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#f0f2f8] mb-1">{feature.title}</h3>
                    <p className="text-sm text-[#8b91a7] leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative bg-[#111318]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <blockquote
                key={i}
                className="p-8 rounded-2xl bg-[#16191f] border border-white/[0.07]"
              >
                <p className="text-lg font-serif text-[#f0f2f8] italic leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <footer className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4f8ef7] to-[#7c5cfc] flex items-center justify-center text-white font-semibold">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <cite className="not-italic font-medium text-[#f0f2f8]">{t.author}</cite>
                    <p className="text-sm text-[#8b91a7]">{t.role}</p>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden bg-[#111318]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(79,142,247,0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-[#f0f2f8] mb-6">
            Ready to visualize your data?
          </h2>
          <p className="text-xl text-[#8b91a7] mb-10 max-w-2xl mx-auto">
            Join hundreds of students and small teams who&apos;ve already built their first dashboard.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-[#4f8ef7] hover:bg-[#3b7dd8] text-white shadow-lg shadow-[#4f8ef7]/20 px-8"
            >
              Get started — it&apos;s free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111318] border-t border-white/[0.07] py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#4f8ef7]" />
            <span className="font-display font-bold text-xl text-[#f0f2f8]">Power BI Lite</span>
          </div>

          <p className="text-sm text-[#8b91a7]">
            Built for the 2025/2026 academic year. <span className="hidden sm:inline">|</span> <br className="sm:hidden" /> Full-stack demo with Next.js, Supabase, and Recharts.
          </p>

          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-[#8b91a7] hover:text-[#4f8ef7] transition-colors">
              GitHub
            </Link>
            <Link href="#" className="text-sm text-[#8b91a7] hover:text-[#4f8ef7] transition-colors">
              Documentation
            </Link>
            <Link href="#" className="text-sm text-[#8b91a7] hover:text-[#4f8ef7] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
