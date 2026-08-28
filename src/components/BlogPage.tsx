import { useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User, 
  Search, 
  ChevronRight, 
  BookOpen, 
  Share2, 
  ThumbsUp,
  Tag,
  Sparkles,
  Volume2
} from 'lucide-react';

interface BlogPageProps {
  onBack: () => void;
}

interface BlogPost {
  id: number;
  title: string;
  category: 'Strategy' | 'Tech' | 'Relations';
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string[];
  likes?: number;
  tags: string[];
  splashIcon: string;
}

export default function BlogPage({ onBack }: BlogPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Strategy' | 'Tech' | 'Relations'>('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [postLikes, setPostLikes] = useState<{ [key: number]: number }>({ 1: 42, 2: 38, 3: 51, 4: 29 });

  const posts: BlogPost[] = [
    {
      id: 1,
      title: "The Soft Psychology of Debt Collections: Polite Nudges vs. Hostile Threats",
      category: "Relations",
      date: "May 28, 2026",
      readTime: "5 min read",
      author: "Sarah Jenkins, Success",
      excerpt: "Why traditional, aggressive collection letters fail to secure client responses, and how polite, automated reminder cadences get paid 45% faster.",
      splashIcon: "🧠",
      tags: ["Clarity", "Client Care", "Fintech Rules"],
      content: [
        "In the realm of B2B trade credits, the natural response to a late-paying buyer is escalating pressure. Businesses send rigid demand letters, issue harsh emails, or hire aggressive collectors. However, decades of cognitive research show that hostility triggers a defense mechanism: embarrassment leads to communication avoidance.",
        "When an individual feels embarrassed, their cognitive bandwidth shifts. They decline phone calls, ignore unknown numbers, and procrastinate reading invoices. This is known as the 'Ostrich Effect'—burying one's head to avoid a difficult reality.",
        "Floate approaches this from a different angle. By formatting notifications as clear, polite service updates rather than moral reprimands, you reduce the psychological penalty of confrontation. For example, instead of saying: 'You have violated our credit terms. Pay immediately,' the system issues: 'Hi John, we are closing this week's ledger and noticed your outstanding invoice #102 is still open. Let us help clear this in 1-tap directly to Zenith account.'",
        "Empirical statistics from our recent client cohort indicate that empathetic, service-oriented reminder sequences reduce outstanding ledger durations from an average of 18 days down to under 6 days. Best of all: client relationships remain secure for future business."
      ]
    },
    {
      id: 2,
      title: "How High-Deliverability Resend Email Campaigns Save Client Ledgers",
      category: "Tech",
      date: "June 2, 2026",
      readTime: "6 min read",
      author: "Tunde Alabi, Engineering",
      excerpt: "Freelance designers and developers struggle with unread billing. Discover why automated email reminder sequences outperformed manual emails.",
      splashIcon: "✉️",
      tags: ["Email Delivery", "Resend SMTP", "Agency Operations"],
      content: [
        "For independent agencies, consultants, and developers, every project milestone relies on active trade funding. When agencies present passive invoice files, they frequently end up lost in the busy noise of standard junk mail directories.",
        "Standard message paths suffer from domain trust gaps, making invoices trigger safety warnings or spam placements.",
        "To bypass this constraint, we built direct Resend campaign triggers. By sending clean HTML structures with elegant buy buttons, pending invoices land in primary folders, meaning customers can clear outstanding balances immediately in 1-click.",
        "By delivering clear, warm, conversational instructions directly on behalf of your brand email address, clients are able to verify balance figures quickly, resulting in complete remittance without awkward confrontations."
      ]
    },
    {
      id: 3,
      title: "Optimizing Your Agency's Outbound Billing Operations",
      category: "Strategy",
      date: "June 5, 2026",
      readTime: "4 min read",
      author: "ONYEKACHI RICH IFEANYI, Founder",
      excerpt: "Step-by-step checklist to streamline your agency's account receivables so you never experience cash flow dry spells again.",
      splashIcon: "📈",
      tags: ["Agency Scale", "Receivables", "Cash Flow"],
      content: [
        "Digital agencies and consulting firms run on extreme talent overhead. Creative teams must be paid at strict chronological intervals, whereas client billing cycles can remain highly erratic. This structural mismatch is the leading killer of small agencies.",
        "Maintaining cash flow stability does not require painful collections. It starts with setting clear operability boundaries and automated enforcement mechanisms during client onboarding.",
        "First, implement the '10-Day Grace Window' policy. Clearly write in your service-level agreements that after 10 days post-deliverable delivery, automated friendly trackers initiate direct updates. When clients know this happens automatically via system software on day 10, they do not take reminders personally.",
        "Second, integrate multi-channel outreach. Relying strictly on a single email address is a vulnerability. Send immediate text notifications to the accounting manager's telephone thread, backed by polite automated voicemail summaries. By automating this entire procedure, you maintain clean accounts while your teams focus on core output."
      ]
    },
    {
      id: 4,
      title: "Maintaining Perfect Security Standards with Virtual Matching Accounts",
      category: "Tech",
      date: "May 15, 2026",
      readTime: "4 min read",
      author: "Tunde Alabi, Engineering",
      excerpt: "An inside look at our system's ledger matching pathways and how we secure data transparency without exposing credit history.",
      splashIcon: "🔒",
      tags: ["Ledgers", "Sovereign Web", "Encryption"],
      content: [
        "When managing transactional client details, security is paramount. Merchants are rightfully protective of their buyer listings, credit histories, and personal payment details. Any vulnerability in this vector destroys trust immediately.",
        "Floate enforces strict, enterprise-grade data security protocols. Every outstanding credit record in our platform is encrypted at rest using standard AES-256 protocols.",
        "Furthermore, we utilize virtual matching bank transfer accounts. When your buyer clicks their secure clearance link, they do not view your raw corporate treasury bank details. Instead, our gateway provisions a secure, temporary virtual routing account linked directly to your ledger.",
        "This prevents external third parties from scraping your corporate details, minimizes raw banking fraud risk, and automates payment reconciliation. When the buyer dispatches cash to the matching account, our gateway clears the status, triggers immediate credit notifications, and closes the pending card loop in milliseconds."
      ]
    }
  ];

  const categories: Array<'All' | 'Strategy' | 'Tech' | 'Relations'> = ['All', 'Strategy', 'Tech', 'Relations'];

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleLike = (id: number, e: MouseEvent) => {
    e.stopPropagation();
    setPostLikes(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  return (
    <div className="min-h-screen bg-white text-slate-950 font-sans antialiased relative z-10 pb-24 select-none">
      
      {/* Structural Two-Tone Slate/Purple background dividers */}
      <div className="absolute top-0 right-0 w-[35%] h-full bg-[#fbf9ff] -z-10 border-l-4 border-slate-950 hidden lg:block" />

      {/* HEADER BAR */}
      <header className="border-b-4 border-slate-950 sticky top-0 bg-white z-40">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              id="blog-back-btn"
              onClick={onBack}
              className="p-2 border-2 border-slate-950 bg-white text-slate-950 hover:bg-[#FAF9F6] active:scale-95 transition shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:shadow-none flex items-center justify-center rounded-xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span className="text-[10px] uppercase font-black tracking-wider">Back</span>
            </button>
            
            <div className="flex items-center space-x-2">
              <img 
                src="https://i.postimg.cc/nzQ7WvPK/20260807-223513.jpg" 
                alt="Floate logo" 
                className="w-7 h-7 object-cover rounded-xs border-2 border-slate-950 shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xs font-black tracking-widest text-black uppercase">FLOATE BLOG</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <span className="px-3 py-1 bg-slate-100 border-2 border-slate-950 text-slate-700 text-[9px] font-mono uppercase tracking-widest font-extrabold rounded-xs">
              RECOVERIES & INSIGHTS
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {!selectedPost ? (
              <>
                {/* Intro Title */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black tracking-[0.3em] text-[#000000] uppercase leading-none inline-block">
                    KNOWLEDGE DEPOT
                  </span>
                  <h1 className="font-sans font-black text-4xl sm:text-5xl text-black uppercase tracking-tight leading-none leading-none">
                    THE FLOATE JOURNAL
                  </h1>
                  <p className="text-xs text-slate-600 font-bold max-w-xl">
                    Operational templates, fintech analysis, and behavioral neuroscience optimized to recover outstanding funds without losing your networks.
                  </p>
                </div>

                {/* Filter and Search controls */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-b-2 border-slate-205 pb-6">
                  
                  {/* Category buttons */}
                  <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                    {categories.map(cat => (
                      <button
                        key={cat}
                        id={`blog-cat-${cat}`}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider border-2 border-slate-950 rounded-xs transition cursor-pointer ${selectedCategory === cat ? 'bg-[#000000] text-white shadow-[2px_2px_0px_rgba(0,0,0,1)]' : 'bg-white text-slate-700 hover:text-black hover:bg-slate-50'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Search box */}
                  <div className="relative w-full sm:w-72">
                    <input
                      type="text"
                      id="blog-search-input"
                      placeholder="Search articles, tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-bold pl-8 pr-3.5 py-2.5 border-2 border-slate-950 rounded-xs bg-white outline-none focus:bg-[#FAF9F6] transition"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {/* Article Feed list */}
                {filteredPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredPosts.map(post => (
                      <div
                        key={post.id}
                        id={`blog-post-card-${post.id}`}
                        onClick={() => setSelectedPost(post)}
                        className="p-6 bg-white border-4 border-slate-950 rounded-xs shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:translate-y-[-2px] hover:shadow-[8px_8px_0px_rgba(104,26,158,1)] active:translate-y-0 transition cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <span className="text-[9px] font-mono font-black text-white uppercase bg-[#681A9E] px-2 py-0.5 border border-slate-950 rounded-sm">
                              {post.category}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-450">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{post.date}</span>
                              <span className="opacity-40">•</span>
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{post.readTime}</span>
                            </div>
                          </div>

                          <div className="flex gap-4">
                            <div className="text-3xl p-3 border-2 border-slate-950 bg-[#FAF9F6] rounded-xs h-fit hidden sm:block">
                              {post.splashIcon}
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-sans font-black text-xl text-black hover:text-[#000000] transition uppercase tracking-tight leading-snug">
                                {post.title}
                              </h3>
                              <p className="text-xs text-slate-600 font-bold leading-relaxed">
                                {post.excerpt}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.map((tag, i) => (
                              <span key={i} className="text-[9px] font-mono text-slate-500 font-semibold uppercase">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-4">
                            <button
                              id={`blog-like-${post.id}`}
                              onClick={(e) => handleLike(post.id, e)}
                              className="inline-flex items-center gap-1.5 text-[10px] font-mono text-slate-500 hover:text-red-500 bg-white border border-slate-300 px-2 py-1 rounded hover:border-slate-950 active:scale-95 transition cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{postLikes[post.id] || 0}</span>
                            </button>

                            <span className="text-[10px] font-mono font-black text-[#000000] uppercase tracking-wider flex items-center gap-0.5 hover:translate-x-1 transition">
                              Read Post <ChevronRight className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 border-4 border-dashed border-slate-350 rounded text-center space-y-2 bg-slate-50/50">
                    <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
                    <h3 className="font-black text-xs uppercase text-slate-400">No matching articles found</h3>
                    <p className="text-[11px] text-slate-500 font-bold">Try adjusting your search terms or selecting a different category.</p>
                  </div>
                )}
              </>
            ) : (
              /* DETAILED EXPANDED POST */
              <motion.article
                key="blog-post-detailed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-4 border-slate-950 p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,1)] rounded-xs space-y-6"
              >
                {/* Back button link */}
                <button
                  id="expanded-post-back-btn"
                  onClick={() => setSelectedPost(null)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 hover:text-[#000000] cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> ← Back to journal listing
                </button>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <span className="text-[9px] font-mono font-black text-white uppercase bg-[#681A9E] px-2 py-0.5 border border-slate-950 rounded-sm">
                      {selectedPost.category}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-slate-450">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPost.author}</span>
                      <span className="opacity-40">•</span>
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedPost.date}</span>
                    </div>
                  </div>

                  <h1 className="font-sans font-black text-2xl sm:text-3xl md:text-4xl text-black uppercase tracking-tight leading-snug">
                    {selectedPost.title}
                  </h1>

                  <div className="flex gap-2">
                    {selectedPost.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-1 text-[9px] font-mono bg-slate-50 rounded border text-slate-550 border-slate-205 font-bold">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t-2 border-slate-100 pt-6 space-y-6 text-sm text-slate-800 font-medium leading-relaxed font-sans">
                  {selectedPost.content.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>

                <div className="border-t border-slate-100 pt-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      id="detailed-like-btn"
                      onClick={(e) => handleLike(selectedPost.id, e)}
                      className="p-2 border-2 border-slate-950 bg-white text-[#000000] rounded-xs shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] active:scale-95 transition flex items-center gap-1.5 font-mono text-xs font-black cursor-pointer"
                    >
                      <ThumbsUp className="w-4 h-4" /> Like Article ({postLikes[selectedPost.id] || 0})
                    </button>
                  </div>

                  <button
                    id="detailed-back-btn"
                    onClick={() => setSelectedPost(null)}
                    className="px-4 py-2 bg-slate-950 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xs hover:bg-slate-900 cursor-pointer"
                  >
                    Return To List
                  </button>
                </div>
              </motion.article>
            )}
            
          </div>

          {/* Right Sidebar Widgets */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Strategy Guideline Widget */}
            <div className="bg-white border-4 border-slate-950 p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-xs space-y-4">
              <div className="flex items-center gap-2 text-[#000000]">
                <Volume2 className="w-5 h-5" />
                <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black">EMAIL SEQUENCE SPOTLIGHT</h4>
              </div>
              <p className="text-[11.5px] text-slate-600 font-bold leading-normal">
                Floate bridges client-freelancer communications by integrating direct High-Deliverability email cadences. Our dunning sequence uses friendly, clear-headed scripts designed to remind without damaging trust.
              </p>
              <div className="p-3 bg-[#FAF9F6] border-2 border-slate-950 text-[10.5px] font-mono leading-relaxed text-slate-700">
                <strong className="block text-slate-950 mb-0.5">🔥 STANDARD B2B SCRIPT STYLE:</strong>
                &ldquo;Hello John, we are closing this week's ledger and noticed your outstanding balance is open. Settle securely in 1-tap using our localized clear portal...&rdquo;
              </div>
            </div>

            {/* Quick newsletter subscription */}
            <div className="bg-[#FAF9F6] border-4 border-[#000000] p-6 shadow-[5px_5px_0px_rgba(0,0,0,1)] rounded-xs space-y-4">
              <h4 className="font-sans font-black text-xs uppercase tracking-wider text-black">WEEKLY RECOVERIES NEWSLETTER</h4>
              <p className="text-[11px] text-slate-650 font-bold leading-relaxed">
                Join 1,200+ agency owners, freelancers, and SME leads receiving our bi-weekly breakdown of receivables optimization.
              </p>
              <div className="space-y-2">
                <input
                  type="email"
                  id="newsletter-email-input"
                  placeholder="name@company.com"
                  className="w-full text-[11px] p-2.5 border-2 border-slate-950 rounded bg-white outline-none focus:bg-slate-100 font-bold"
                />
                <button
                  id="newsletter-subscribe-btn"
                  onClick={() => alert('Thanks for subscribing! Check your email for our invoice velocity checklist soon.')}
                  className="w-full py-2.5 bg-[#000000] text-white border-2 border-slate-950 font-black text-[10px] uppercase tracking-widest rounded transition hover:bg-slate-900 cursor-pointer text-center"
                >
                  Subscribe
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
