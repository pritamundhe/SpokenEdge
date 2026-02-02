import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8">
            Build <span className="text-gradient">Faster</span>. <br />
            Scale <span className="text-gradient">Higher</span>.
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
            The ultimate starting point for your next big project.
            Powered by Next.js, Tailwind CSS, and MongoDB.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="btn-primary text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg">
              Start Building
            </Link>
            <Link href="https://github.com" className="glass-card text-white font-semibold py-3 px-8 rounded-full text-lg hover:bg-white/10 transition-colors">
              View Github
            </Link>
          </div>
        </div>

        {/* Decorative Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl -z-10"></div>
      </div>

      {/* Features Grid */}
      <div className="py-20 bg-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Next.js 14', desc: 'App Router, Server Components, and more.' },
              { title: 'Tailwind CSS', desc: 'Utility-first CSS framework for rapid UI development.' },
              { title: 'Secure Auth', desc: 'Complete authentication system with JWT.' },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300">
                <h3 className="text-xl font-bold mb-4 text-blue-400">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
