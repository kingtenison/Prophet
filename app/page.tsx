import Link from 'next/link';
import { ArrowRight, Upload, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const features = [
  { icon: Upload, title: 'One-Click Upload', description: 'Upload CSV or Excel files. Smart parser auto-detects columns.' },
  { icon: BarChart3, title: 'Beautiful Charts', description: 'Build bar, line, pie charts. No code required.' },
  { icon: BarChart3, title: 'Share Instantly', description: 'Generate public link. Embed anywhere.' },
  { icon: BarChart3, title: 'Lightning Fast', description: 'Powered by WebAssembly for instant processing.' },
  { icon: BarChart3, title: 'Secure & Private', description: 'Data never leaves your browser. Zero tracking.' },
  { icon: BarChart3, title: 'Custom Styling', description: 'Match your brand with custom themes.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation - glassmorphism */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111]/80 backdrop-blur-xl border-b border-white/5">
        <div className="container flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg shadow-[rgba(37,99,235,0.3)]">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-white">PROPHET</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-white/70 hover:text-[#2563EB] transition-colors font-medium">Features</a>
            <a href="#pricing" className="text-white/70 hover:text-[#2563EB] transition-colors font-medium">Pricing</a>
            <Link href="/signup"><button className="btn btn-primary text-sm">Get Started</button></Link>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#2563EB]/30 bg-[rgba(37,99,235,0.06)] mb-8 animate-in stagger-1">
              <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-pulse"></span>
              <span className="text-sm font-medium text-[#2563EB]">Public Beta Now Open</span>
            </div>
            <h1 className="mb-6 animate-in stagger-2">
              Data Insights,<br />
              <span className="text-[#2563EB]">Zero Complexity.</span>
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto animate-in stagger-3">
              Transform raw data into stunning visualizations in minutes. No coding required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in stagger-4">
              <Link href="/signup">
                <button className="btn btn-primary text-lg px-8 py-4">
                  Start Building Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </Link>
              <Link href="/login">
                <button className="btn btn-secondary">Sign In</button>
              </Link>
            </div>
          </div>
          <div className="relative mt-12 md:mt-20 animate-in stagger-5">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#2563EB]/20 to-transparent blur-3xl rounded-full"></div>
            <div className="relative card p-4 md:p-8">
              <div className="bg-[#111] rounded-xl overflow-hidden border border-white/5">
                <div className="h-48 md:h-96 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-[#111] border border-[#2563EB]/30 flex items-center justify-center mx-auto">
                      <BarChart3 className="w-8 h-8 text-[#2563EB]" />
                    </div>
                    <p className="text-[#2563EB] font-mono text-sm">Visualization Preview</p>
                    <div className="flex justify-center gap-2 mt-4">
                      <div className="w-24 h-8 bg-white/5 rounded"></div>
                      <div className="w-32 h-8 bg-white/5 rounded"></div>
                      <div className="w-20 h-8 bg-white/5 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 md:py-32 border-t border-white/5">
        <div className="container">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="mb-6">Built for <span className="text-[#2563EB]">Power Users</span></h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">Professional-grade tools that scale with your ambition</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {features.map((f, i) => (
              <div key={i} className="card p-6 md:p-8 animate-in hover:border-[#2563EB]/30" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="w-12 h-12 rounded-xl bg-[#111] border border-[#2563EB]/20 flex items-center justify-center mb-6">
                  <f.icon className="w-6 h-6 text-[#2563EB]" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3 text-white">{f.title}</h3>
                <p className="text-white/50">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32">
        <div className="container">
          <div className="card p-6 md:p-12 border border-white/10 bg-gradient-to-b from-[#111] to-black">
            <div className="text-center mb-12">
              <h2 className="mb-4 text-white">See Your Data Come Alive</h2>
              <p className="text-lg text-white/60">Upload CSV/Excel and instantly visualize patterns</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
              <div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-white/60 mb-2">Sample Data Preview</label>
                  <div className="bg-[#111] rounded-lg border border-white/10 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left px-4 py-3 font-medium text-[#2563EB]">Month</th>
                          <th className="text-left px-4 py-3 font-medium text-[#2563EB]">Revenue</th>
                          <th className="text-left px-4 py-3 font-medium text-[#2563EB]">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { m: 'Jan', rev: '42,500', g: '+14' },
                          { m: 'Feb', rev: '51,200', g: '+22' },
                          { m: 'Mar', rev: '48,900', g: '-4' },
                          { m: 'Apr', rev: '56,400', g: '+18' }
                        ].map((row, i) => (
                          <tr key={i} className="border-b border-white/5">
                            <td className="px-4 py-3 text-white/70">{row.m}</td>
                            <td className="px-4 py-3 font-mono text-white/70">${row.rev}</td>
                            <td className={`px-4 py-3 ${row.g.startsWith('-') ? 'text-rose-500' : 'text-[#2563EB]'}`}>{row.g}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <Link href="/signup">
                  <button className="btn btn-primary w-full">
                    <Upload className="w-5 h-5" /> Upload Your Data
                  </button>
                </Link>
              </div>
              <div className="bg-[#111] rounded-xl p-4 md:p-6 flex items-center justify-center border border-white/10">
                <div className="w-full max-w-xs mx-auto">
                  <div className="flex items-end gap-1 h-48">
                    {[60,80,40,90,70,85,50].map((h,i)=>
                      <div key={i} className="flex-1 bg-gradient-to-t from-[#2563EB] to-[#1D4ED8] rounded-t transition-all hover:from-[#60A5FA] hover:to-[#2563EB]" style={{height:`${h}%`}}></div>
                    )}
                  </div>
                  <div className="flex justify-between mt-4 text-xs text-white/40">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(37,99,235,0.03)_50%,transparent_100%)]"></div>
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="mb-6 text-white">Ready to Transform Your Data?</h2>
            <p className="text-xl text-white/60 mb-10">Join thousands who trust PROPHET for their data visualization needs.</p>
            <Link href="/signup">
              <button className="btn btn-primary text-lg px-10 py-5">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-12 md:py-16 border-t border-white/5">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center shadow-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">PROPHET</span>
            </div>
            <div className="flex items-center gap-6 md:gap-12">
              <Link href="#" className="text-white/60 hover:text-[#2563EB] transition-colors">GitHub</Link>
              <Link href="#" className="text-white/60 hover:text-[#2563EB] transition-colors">Documentation</Link>
              <Link href="#" className="text-white/60 hover:text-[#2563EB] transition-colors">Contact</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/5 text-center text-sm text-white/40">2026 PROPHET. Built for educational purposes.</div>
        </div>
      </footer>
    </div>
  );
}
