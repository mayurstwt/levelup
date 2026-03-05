import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('buyers');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?game=${encodeURIComponent(searchQuery)}`);
    }
  };

  const popularGames = ['Valorant', 'Minecraft', 'Roblox', 'BGMI'];

  const features = [
    {
      icon: '🔒',
      title: 'SECURED ESCROW',
      desc: "Funds are locked in our high-security digital vault. Seller's only get paid when you confirm the job is 100% complete.",
      color: 'bg-cyan-400',
    },
    {
      icon: '⚡',
      title: 'INSTANT DELIVERY',
      desc: 'Start your leveling job within minutes of accepting a bid. Our global network ensures 24/7 availability for all timezones.',
      color: 'bg-blue-500',
    },
    {
      icon: '✅',
      title: 'VETTED PROS',
      desc: 'Every seller undergoes a rigorous 5-step verification process, including skill tests and previous rank authentication.',
      color: 'bg-purple-500',
    },
  ];

  const trendingServices = [
    {
      img: 'https://placehold.co/280x160/1a1a2e/cyan?text=Elite+Mythic',
      tag: 'VALORANT',
      tagColor: 'bg-red-500',
      title: 'Elite Mythic 15-20 Dungeon Carry',
      seller: 'Arthas_Slol',
      rating: '4.9',
      jobs: 'C4',
      price: '450',
    },
    {
      img: 'https://placehold.co/280x160/1a1a2e/purple?text=Diamond+Fuel',
      tag: 'BGMI',
      tagColor: 'bg-yellow-500',
      title: 'Rank Placement: Iron to Diamond Fast',
      seller: 'JiffMasterBR',
      rating: '4.8',
      jobs: 'C3',
      price: '220',
    },
    {
      img: 'https://placehold.co/280x160/1a1a2e/blue?text=Master+Tier',
      tag: 'LEAGUE',
      tagColor: 'bg-blue-500',
      title: 'Master Tier Duo Queue Boost |Win',
      seller: 'FalconClone',
      rating: '4.7',
      jobs: 'C3',
      price: '890',
    },
    {
      img: 'https://placehold.co/280x160/1a1a2e/green?text=MMR+Cal',
      tag: 'DOTA 2',
      tagColor: 'bg-green-500',
      title: 'MMR Calibration & Battle Pass Quests',
      seller: 'MirrorMaster',
      rating: '4.7',
      jobs: 'C4',
      price: '150',
    },
  ];

  const elitePros = [
    { name: 'GhostRunner', role: 'FPS SPECIALIST', jobs: '1145+', img: 'https://placehold.co/80/374151/fff?text=GR' },
    { name: 'Sarah_Blade', role: 'MMO QUEEN', jobs: '60+', img: 'https://placehold.co/80/7c3aed/fff?text=SB' },
    { name: 'Viktor_V', role: 'MOBA STRATEGIST', jobs: '2100+', img: 'https://placehold.co/80/1d4ed8/fff?text=VV' },
    { name: 'Line_Sky', role: 'COACH & LEVELER', jobs: '500+', img: 'https://placehold.co/80/065f46/fff?text=LS' },
    { name: 'Zone_Void', role: 'BATTLE ROYALE KING', jobs: '900+', img: 'https://placehold.co/80/991b1b/fff?text=ZV' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* HERO SECTION */}
      <section className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div>
            <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded mb-4 tracking-wide uppercase">
              Level Up Your Game
            </span>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight text-gray-900 mb-4 uppercase">
              REACH YOUR{' '}
              <span className="text-blue-600 italic">PEAK RANK</span>{' '}
              FASTER.
            </h1>
            <p className="text-gray-500 text-base mb-8 max-w-md leading-relaxed">
              The world's first Neo-Brutalist marketplace for elite leveling services. Safe, transparent, and direct.
            </p>
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => navigate('/post-job')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-7 py-3 rounded text-sm transition-colors"
              >
                Post a Job
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold px-7 py-3 rounded text-sm transition-colors"
              >
                Browse Jobs
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {['bg-blue-400','bg-purple-400','bg-pink-400','bg-green-400'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white`} />
                ))}
              </div>
              <span className="text-sm text-gray-600 font-semibold">
                <span className="text-gray-900 font-black">6,421</span> VERIFIED PRO SELLERS ONLINE
              </span>
            </div>
          </div>

          {/* Right — hero image with badge */}
          <div className="relative hidden lg:block">
            <div className="w-full h-72 rounded-lg overflow-hidden bg-gray-900">
              <img
                src="https://placehold.co/600x300/111827/374151?text=Pro+Gamer"
                alt="Pro Gamer"
                className="w-full h-full object-cover opacity-80"
              />
            </div>
            {/* Elite Performance badge */}
            <div className="absolute bottom-6 right-6 bg-white border-2 border-cyan-400 rounded p-3 shadow-xl w-52">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-6 h-6 bg-cyan-400 rounded flex items-center justify-center text-xs font-black text-black">E</div>
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider">Elite Performance</span>
              </div>
              <p className="text-xs text-gray-500 leading-tight">Our pro levelers maintain a 99.8% satisfaction rate across all competitive titles.</p>
              <button className="mt-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded w-full">
                View Stats
              </button>
            </div>
            {/* Live market feed */}
            <div className="absolute top-4 right-4 bg-gray-900 text-green-400 text-xs font-bold px-3 py-1 rounded flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse inline-block"></span>
              LIVE MARKET FEED
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE LEVELUP */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-1 uppercase">
            WHY CHOICE <span className="text-blue-600">LEVELUP?</span>
          </h2>
          <div className="flex justify-center mb-10">
            <div className="w-16 h-1 bg-gray-900 rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i} className="border-2 border-gray-200 rounded p-6 flex flex-col items-start hover:border-blue-500 transition-colors">
                <div className={`w-12 h-12 ${f.color} rounded flex items-center justify-center text-xl mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — BUYERS / SELLERS */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Buyers */}
          <div className="bg-white border-2 border-gray-900 rounded p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-gray-900 text-white font-black text-sm px-3 py-1 rounded uppercase">Buyers</span>
              <span className="font-black text-gray-900 text-lg uppercase">GET IT DONE</span>
            </div>
            <div className="space-y-5">
              {[
                { n: '01', title: 'POST REQUIREMENTS', desc: 'Specify your game, current level, target goals, and budget in our detailed job form.' },
                { n: '02', title: 'RECEIVE BIDS', desc: 'Bids boosters will compete for your job. Compare their profiles, ratings, and pricing.' },
                { n: '03', title: 'ACCEPT & CHAT', desc: 'Pick your pro and start communicating directly in our secure, encrypted chatroom.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="text-blue-600 font-black text-sm min-w-[24px]">{s.n}</span>
                  <div>
                    <p className="font-black text-xs text-gray-900 uppercase mb-1">{s.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/post-job')}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 rounded text-sm transition-colors"
            >
              Start Your First Job →
            </button>
          </div>

          {/* Sellers */}
          <div className="bg-white border-2 border-gray-200 rounded p-6">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-cyan-400 text-black font-black text-sm px-3 py-1 rounded uppercase">Sellers</span>
              <span className="font-black text-gray-900 text-lg uppercase">EARN MORE</span>
            </div>
            <div className="space-y-5">
              {[
                { n: '01', title: 'FIND LISTINGS', desc: 'Browse the marketplace for jobs that match your expertise and preferred games.' },
                { n: '02', title: 'PLACE BID', desc: "Submit your competitive proposal and timeline to catch the buyer's eye." },
                { n: '03', title: 'DELIVER RESULTS', desc: 'Complete the job, upload proof, and watch your earnings fill your digital wallet instantly.' },
              ].map((s) => (
                <div key={s.n} className="flex gap-4">
                  <span className="text-cyan-500 font-black text-sm min-w-[24px]">{s.n}</span>
                  <div>
                    <p className="font-black text-xs text-gray-900 uppercase mb-1">{s.title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/become-seller')}
              className="mt-6 w-full border-2 border-gray-900 hover:bg-gray-900 hover:text-white text-gray-900 font-black py-3 rounded text-sm transition-colors"
            >
              Become a Pro Seller &gt;
            </button>
          </div>
        </div>
      </section>

      {/* TOP TRENDING SERVICES */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex items-end justify-between mb-2">
            <div>
              <h2 className="text-2xl font-black text-gray-900 uppercase">
                TOP <span className="text-blue-600">TRENDING</span> SERVICES
              </h2>
              <p className="text-gray-400 text-xs mt-1">The most requested boosts in the last 24 hours.</p>
            </div>
            <Link to="/jobs" className="text-blue-600 font-bold text-sm hover:underline">See All Listings</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {trendingServices.map((s, i) => (
              <div key={i} className="border-2 border-gray-200 rounded overflow-hidden hover:border-blue-500 transition-colors group cursor-pointer">
                <div className="relative">
                  <img src={s.img} alt={s.title} className="w-full h-32 object-cover" />
                  <span className={`absolute top-2 left-2 ${s.tagColor} text-white text-xs font-black px-2 py-0.5 rounded uppercase`}>
                    {s.tag}
                  </span>
                  <span className="absolute top-2 right-2 bg-black bg-opacity-70 text-yellow-400 text-xs font-bold px-2 py-0.5 rounded">
                    ★ {s.rating}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-black text-gray-900 text-xs leading-tight mb-1">{s.title}</p>
                  <p className="text-gray-400 text-xs mb-2">by <span className="text-blue-600">{s.seller}</span></p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-xs uppercase">Starting at</p>
                      <p className="font-black text-gray-900 text-sm">₹{s.price} <span className="text-gray-400 font-normal text-xs">₹</span></p>
                    </div>
                    <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition-colors">
                      View Bids
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MEET THE ELITE PROS */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-block bg-blue-600 text-white font-black text-xl px-8 py-3 rounded uppercase mb-3 tracking-wide">
            MEET THE <span className="text-cyan-300">ELITE</span> PROS
          </div>
          <p className="text-gray-500 text-sm mb-1">The highest earning, best rated, and most reliable sellers in our marketplace.</p>
          <p className="text-gray-500 text-sm mb-10">Only the top 1% receive the ELITE status.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {elitePros.map((p, i) => (
              <div key={i} className="bg-white border-2 border-gray-200 rounded p-4 flex flex-col items-center hover:border-blue-500 transition-colors cursor-pointer">
                <img src={p.img} alt={p.name} className="w-16 h-16 rounded-full mb-3 object-cover" />
                <p className="font-black text-gray-900 text-sm">{p.name}</p>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-2">{p.role}</p>
                <div className="flex items-center gap-1">
                  <span className="text-green-500 text-xs font-bold">✓</span>
                  <span className="text-gray-500 text-xs">{p.jobs} Jobs Completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="bg-gray-900 py-12">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white uppercase leading-tight">
              READY TO START<br />YOUR CLIMB?
            </h2>
            <p className="text-gray-400 text-sm mt-2">Join 50,000+ gamers who have reached their dream ranks.</p>
          </div>
          <button
            onClick={() => navigate('/register')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded text-sm uppercase tracking-wide transition-colors flex-shrink-0"
          >
            Join Now
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-12 pb-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-black">G</div>
                <span className="text-white font-black text-sm">GameLevelUp Marketplace</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                The world's leading marketplace for game leveling and coaching services. Safe, secure, and professional.
              </p>
              <div className="flex gap-3">
                {['f','t','in','yt'].map((s) => (
                  <div key={s} className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-gray-400 text-xs font-bold cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                    {s}
                  </div>
                ))}
              </div>
            </div>
            {[
              { title: 'MARKETPLACE', links: ['All Services', 'Popular Games', 'Top Rated Sellers', 'Success Stories'] },
              { title: 'SUPPORT', links: ['Help Center', 'Safety & Trust', 'Dispute Resolution', 'Contact Us'] },
              { title: 'RESOURCES', links: ["Buyer's Guide", 'Seller Academy', 'Terms of Service', 'Privacy Policy'] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-black text-xs uppercase tracking-wider mb-3">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l}><a href="#" className="text-gray-500 text-xs hover:text-white transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-5 flex flex-col sm:flex-row justify-between items-center gap-2">
            <p className="text-gray-600 text-xs">© 2024 GameLevelUp Marketplace. All rights reserved.</p>
            <div className="flex gap-4">
              <span className="text-gray-600 text-xs">Server Status: Online</span>
              <span className="text-gray-600 text-xs">Verified Secure Checkout</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;