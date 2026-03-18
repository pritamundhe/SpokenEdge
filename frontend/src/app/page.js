import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-foreground selection:bg-teal-500/30">
      {/* Background Effects */}
      <div className="bg-beams z-0" />

      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 overflow-hidden px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center">

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-teal-500/30 bg-teal-500/10 text-sm font-medium text-teal-700 dark:text-teal-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.2)] animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-teal-500 mr-2 animate-pulse"></span>
            AI Agent 2.0 Now Live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] animate-fade-in-up delay-100">
            Master English Fluency with <br />
            <span className="text-glow">AI Personal Coach</span>
          </h1>

          <p className="mt-6 text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto animate-fade-in-up delay-200">
            Real-time speech analysis, instant feedback, and personalized practice scenarios. Elevate your communication skills with the world's most advanced AI tutor.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link href="/auth/register" className="btn-primary w-full sm:w-auto text-lg px-8 py-4 shadow-xl hover:shadow-2xl hover:shadow-primary/20">
              Start Practicing Free
            </Link>
            <Link href="/demo" className="btn-secondary w-full sm:w-auto text-lg px-8 py-4 bg-white/50 dark:bg-white/5 hover:bg-white/80 dark:hover:bg-white/10 backdrop-blur-sm">
              See How It Works
            </Link>
          </div>

          {/* Social Proof / Stats */}
          <div className="mt-12 flex items-center justify-center gap-8 text-sm font-medium text-muted-foreground animate-fade-in-up delay-400">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">★★★★★</span>
              <span>4.9/5 from 10k+ users</span>
            </div>
            <div className="hidden sm:block w-1 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full"></div>
            <div>Trusted by professionals worldwide</div>
          </div>
        </div>

        {/* Abstract Interface Visualization */}
        <div className="relative mt-20 max-w-6xl mx-auto perspective-1000 animate-fade-in-up delay-500">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Simulation of a Call Session */}
            <div className="md:col-span-12 lg:col-span-8 glass-panel p-6 sm:p-8 transform transition-all hover:scale-[1.01] shadow-2xl dark:shadow-teal-900/10 border-teal-500/20">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-white dark:border-black"></div>
                    <div className="w-8 h-8 rounded-full bg-muted border-2 border-white dark:border-black flex items-center justify-center text-xs">You</div>
                  </div>
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-2 py-1 rounded-full border border-emerald-500/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Session
                  </div>
                </div>
                <div className="text-xs font-mono text-muted-foreground">00:42 / 15:00</div>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs">AI</div>
                  <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-2 text-sm text-foreground max-w-[80%]">
                    Can you describe a time when you had to lead a team through a difficult challenge?
                  </div>
                </div>
                <div className="flex gap-4 items-start flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex-shrink-0 flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">You</div>
                  <div className="bg-blue-500 text-white rounded-2xl rounded-tr-none px-4 py-2 text-sm max-w-[80%] shadow-lg shadow-blue-500/20">
                    Yes, in my previous role, we faced a sudden deadline shift...
                  </div>
                </div>
                <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">Instant Feedback</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Excellent use of the STAR method. Key vocabulary detected: <span className="text-teal-500 font-medium">"deadline shift"</span>. Try to elaborate more on the <span className="italic">Result</span> part of your story.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating Stats Card */}
            <div className="md:col-span-12 lg:col-span-4 glass-panel p-8 flex flex-col justify-center h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>

              <h3 className="text-muted-foreground text-sm font-medium uppercase tracking-wider mb-2">Fluency Score</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-6xl font-bold text-foreground">92</span>
                <span className="text-muted-foreground text-lg mb-2">/ 100</span>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Grammar</span>
                    <span>95%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-blue-500 h-full w-[95%]"></div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-muted-foreground">
                    <span>Vocabulary</span>
                    <span>88%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="bg-purple-500 h-full w-[88%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FEATURES SECTION --- */}
      <section className="py-24 bg-card border-y border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Everything you need to sound professional
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              SpokenEdge combines advanced speech recognition with linguistic expertise to provide holistic communication training.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Real-time Grammar Check',
                desc: 'Catch mistakes as you speak. Our AI identifies grammatical errors instantly and suggests corrections.',
                icon: (
                  <svg className="w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: 'Vocabulary Expansion',
                desc: 'Stop using the same words. Get suggestions for more impactful synonyms and professional terminology.',
                icon: (
                  <svg className="w-8 h-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                )
              },
              {
                title: 'Pronunciation Coach',
                desc: 'Perfect your accent. Visual feedback helps you align your intonation and stress with native speakers.',
                icon: (
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )
              },
              {
                title: 'Interview Simulator',
                desc: 'Practice for the big day. Mock interviews for behavioral, technical, and situational questions.',
                icon: (
                  <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: 'Progress Tracking',
                desc: 'Visual analytics show your improvement over time in fluency, clarity, and confidence.',
                icon: (
                  <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )
              },
              {
                title: 'Safe Practice Space',
                desc: 'Judgment-free zone. Make mistakes, learn from them, and build confidence before the real conversation.',
                icon: (
                  <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
            ].map((feature, i) => (
              <div key={i} className="group relative p-8 bg-muted/50 rounded-2xl transition-all hover:bg-card border border-border hover:shadow-lg hover:shadow-border/50">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-t-2xl"></div>
                <div className="mb-6 bg-card w-16 h-16 flex items-center justify-center rounded-2xl shadow-sm border border-border group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold leading-7 text-foreground mb-3">{feature.title}</h3>
                <p className="text-base leading-7 text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-foreground">How SpokenEdge Works</h2>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent"></div>

            {[
              { step: '01', title: 'Choose a Scenario', desc: 'Select from Job Interviews, Presentations, or Casual Conversation.' },
              { step: '02', title: 'Start Speaking', desc: 'Interact naturally with the AI. No scripts, just real conversation.' },
              { step: '03', title: 'Get Feedback', desc: 'Receive instant analysis on grammar, pace, and tone.' },
            ].map((item, i) => (
              <div key={i} className="relative flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full bg-card border-4 border-border flex items-center justify-center text-2xl font-bold text-teal-500 shadow-xl mb-6 relative z-10">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="py-20 relative">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 to-teal-500 shadow-2xl">
            {/* Decorative circles */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -mr-20 -mb-20"></div>

            <div className="relative z-10 px-6 py-16 sm:px-16 text-center text-white">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-6">
                Ready to transform your communication?
              </h2>
              <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
                Join thousands of professionals mastering English with SpokenEdge. Start your free trial today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Get Started Now
                </Link>
                <Link href="/demo" className="bg-blue-700/50 hover:bg-blue-700/70 text-white font-semibold py-3 px-8 rounded-full border border-blue-400/30 backdrop-blur-sm transition-all">
                  View Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
