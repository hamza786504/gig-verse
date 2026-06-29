import Link from 'next/link';
import { Sparkles, Lock, MessageCircle } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center">
      {/* Hero Section */}
      <section className="relative w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-32 pb-40 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl"></div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-secondary mb-6 leading-tight">
            Find the perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">freelance services</span> for your business
          </h1>
          <p className="text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed">
            Connect with top-tier talent to get your projects done efficiently and securely. The next big thing starts here.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto bg-white p-3 rounded-full shadow-soft border border-gray-100">
            <input 
              type="text" 
              placeholder="What service are you looking for?" 
              className="flex-1 bg-transparent px-6 py-3 outline-none text-gray-700 placeholder-gray-400"
            />
            <Link href="/explore" className="px-8 py-4 bg-gradient-to-r from-primary to-primary-hover text-white font-medium rounded-full shadow-glow hover:shadow-lg transition-all transform hover:-translate-y-0.5 text-center">
              Search
            </Link>
          </div>
          
          {/* Trusted by section */}
          <div className="mt-20 pt-10 border-t border-gray-200/60">
            <p className="text-sm text-gray-400 font-medium uppercase tracking-widest mb-6">Trusted by innovative companies</p>
            <div className="flex justify-center gap-12 opacity-50 grayscale">
              {/* Fake logos using text */}
              <span className="text-xl font-bold tracking-tighter">Acme Corp</span>
              <span className="text-xl font-bold tracking-tighter">Globex</span>
              <span className="text-xl font-bold tracking-tighter">Soylent</span>
              <span className="text-xl font-bold tracking-tighter">Initech</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="w-full max-w-7xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">Why choose GigVerse?</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Everything you need to scale your business with confidence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-10 rounded-2xl shadow-soft border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-500">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-3">Top Quality Work</h3>
            <p className="text-gray-500 leading-relaxed">Find the right freelancer to begin working on your project within minutes, vetted for excellence.</p>
          </div>
          
          <div className="bg-white p-10 rounded-2xl shadow-soft border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-6 text-green-500">
              <Lock className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-3">Secure Payments</h3>
            <p className="text-gray-500 leading-relaxed">Using reliable transaction processing, your payment is held securely until you approve the work.</p>
          </div>
          
          <div className="bg-white p-10 rounded-2xl shadow-soft border border-gray-50 hover:-translate-y-2 transition-transform duration-300">
            <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-500">
              <MessageCircle className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-secondary mb-3">24/7 Support</h3>
            <p className="text-gray-500 leading-relaxed">Our dedicated support team is always available to help you with any queries or disputes.</p>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="w-full bg-secondary py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to get started?</h2>
          <p className="text-gray-400 mb-10 text-lg">Join thousands of freelancers and clients building the future together.</p>
          <div className="flex justify-center gap-4">
            <Link href="/register" className="px-8 py-4 bg-white text-secondary font-bold rounded-full hover:bg-gray-100 transition-colors">
              Create an Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
