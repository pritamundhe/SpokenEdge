import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="bg-beams" />

      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-visible">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center">

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-teal-400/30 bg-teal-500/10 text-sm font-medium text-teal-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.2)]">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]"></span>
            AI Agent 2.0 Now Live
          </div>

          <h1 className="text-5xl sm:text-7xl font-semibold tracking-tight text-white mb-6 leading-tight drop-shadow-2xl">
            Practice Speech with <br />
            <span className="">AI Coach</span>
          </h1>

          <p className="mt-6 text-xl leading-relaxed text-zinc-400 max-w-2xl mx-auto">
            Practice your speech with AI Coach and get real-time feedback.
          </p>

          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/register" className="btn-primary">
              Get Started Free
            </Link>
            <Link href="/demo" className="btn-secondary dark:hover:bg-white/10">
              View Demo
            </Link>
          </div>
        </div>

        {/* Abstract AI Floating UI Visualization */}
        <div className="relative mt-20 max-w-6xl mx-auto px-6 perspective-1000">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">

            {/* Left Card: Chat Interface */}
            <div className="md:col-span-7 glass-panel p-6 transform transition-all hover:scale-[1.01]">
              <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-xs font-mono text-zinc-500">agent_monitoring.exe</div>
              </div>
              <div className="space-y-4 font-mono text-sm">
                <div className="flex gap-4">
                  <span className="text-teal-400">➜</span>
                  <span className="text-zinc-300">Analyzing voice stream...</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-teal-400">➜</span>
                  <span className="text-emerald-400">Pace detected: 140wpm (Optimal)</span>
                </div>
                <div className="flex gap-4">
                  <span className="text-teal-400">➜</span>
                  <span className="text-zinc-300">Generating real-time suggestions...</span>
                </div>
                <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-200 mt-2">
                  Tip: Try emphasizing the keyword "Strategic" in the next sentence.
                </div>
              </div>
            </div>

            {/* Right Card: Stats */}
            <div className="md:col-span-5 glass-panel p-8 flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-emerald-500/30 transition-all"></div>

              <h3 className="text-zinc-400 text-sm font-medium uppercase tracking-wider mb-2">Efficiency Score</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-bold text-white">98%</span>
                <span className="text-emerald-400 text-lg mb-2">▲ 12%</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full w-[98%]"></div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-24 border-t border-white/5 bg-black/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Power for Developers</h2>
            <p className="mt-4 text-lg leading-8 text-zinc-400 text-center">Built for scale, security, and speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Autonomous Agents', desc: 'Set triggers and let AI handle the rest.', icon: '🤖' },
              { title: 'Real-time Analytics', desc: 'Monitor performance with sub-second latency.', icon: '⚡' },
              { title: 'Global Edge Network', desc: 'Deploy instantly to 35+ regions worldwide.', icon: '🌍' },
            ].map((feature, i) => (
              <div key={i} className="glass-panel p-8 hover:bg-white/5">
                <div className="text-4xl mb-6">{feature.icon}</div>
                <h3 className="text-xl font-semibold leading-7 text-white mb-3">{feature.title}</h3>
                <p className="text-base leading-7 text-zinc-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
