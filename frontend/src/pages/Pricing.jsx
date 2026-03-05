import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// ── Plan Data ────────────────────────────────────────────────────────────────
const buyerPlans = [
  {
    id: 'buyer_free',
    name: 'Scout',
    price: 0,
    period: 'forever',
    badge: null,
    description: 'Get started and post your first job.',
    features: [
      { text: 'Post up to 2 jobs/month', ok: true },
      { text: 'View seller profiles & ratings', ok: true },
      { text: 'Escrow-protected payments', ok: true },
      { text: 'Basic in-app chat', ok: true },
      { text: 'Priority job promotion', ok: false },
      { text: 'Dedicated account manager', ok: false },
    ],
    cta: 'Get Started Free',
    ctaLink: '/register',
    highlight: false,
  },
  {
    id: 'buyer_pro',
    name: 'Commander',
    price: 9.99,
    period: '/month',
    badge: 'Most Popular',
    description: 'For active players who hire regularly.',
    features: [
      { text: 'Unlimited job posts', ok: true },
      { text: 'Priority placement in feed', ok: true },
      { text: 'Advanced filters (rating, game, price)', ok: true },
      { text: 'Seller analytics & reviews', ok: true },
      { text: 'Priority dispute resolution', ok: true },
      { text: 'Dedicated account manager', ok: false },
    ],
    cta: 'Upgrade to Commander',
    ctaLink: '/checkout/buyer_pro',
    highlight: true,
  },
  {
    id: 'buyer_elite',
    name: 'Warlord',
    price: 24.99,
    period: '/month',
    badge: 'Ultimate',
    description: 'For guilds and power users.',
    features: [
      { text: 'Everything in Commander', ok: true },
      { text: 'Bulk job posting (up to 20)', ok: true },
      { text: 'Seller background verification', ok: true },
      { text: 'Custom SLA & guaranteed delivery', ok: true },
      { text: 'Priority dispute resolution', ok: true },
      { text: 'Dedicated account manager', ok: true },
    ],
    cta: 'Go Warlord',
    ctaLink: '/checkout/buyer_elite',
    highlight: false,
  },
];

const sellerPlans = [
  {
    id: 'seller_free',
    name: 'Rookie',
    price: 0,
    period: 'forever',
    badge: null,
    description: 'Start earning with zero upfront cost.',
    features: [
      { text: 'Bid on up to 5 jobs/month', ok: true },
      { text: 'Basic seller profile', ok: true },
      { text: 'Escrow-protected payouts', ok: true },
      { text: '15% platform fee', ok: true },
      { text: 'Featured profile badge', ok: false },
      { text: 'Early access to premium jobs', ok: false },
    ],
    cta: 'Sign Up Free',
    ctaLink: '/register',
    highlight: false,
  },
  {
    id: 'seller_pro',
    name: 'Champion',
    price: 14.99,
    period: '/month',
    badge: 'Best Value',
    description: 'Scale your income with reduced fees.',
    features: [
      { text: 'Unlimited bids', ok: true },
      { text: 'Reduced 8% platform fee', ok: true },
      { text: 'Featured profile badge', ok: true },
      { text: 'Priority in search results', ok: true },
      { text: 'Early access to premium jobs', ok: true },
      { text: 'Verified Pro badge', ok: false },
    ],
    cta: 'Become a Champion',
    ctaLink: '/checkout/seller_pro',
    highlight: true,
  },
  {
    id: 'seller_elite',
    name: 'Legend',
    price: 29.99,
    period: '/month',
    badge: 'Elite',
    description: 'The highest-earning tier for top pros.',
    features: [
      { text: 'Unlimited bids', ok: true },
      { text: 'Lowest 5% platform fee', ok: true },
      { text: 'Verified Legend badge', ok: true },
      { text: 'Top 3 search placement', ok: true },
      { text: 'Dedicated success manager', ok: true },
      { text: 'Custom profile URL & branding', ok: true },
    ],
    cta: 'Become a Legend',
    ctaLink: '/checkout/seller_elite',
    highlight: false,
  },
];

// ── FAQ ───────────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Can I cancel my subscription anytime?', a: 'Yes — cancel at anytime from your account settings and you retain benefits until the end of the billing period. No partial refunds.' },
  { q: 'What currency are prices in?', a: 'All prices are in US Dollars (USD). Your card is charged in USD and your bank may apply a conversion rate.' },
  { q: 'How does the escrow system work?', a: 'When a buyer accepts a bid, the payment is locked in escrow. Funds are released to the seller only after the buyer confirms delivery — or automatically after 7 days.' },
  { q: 'What happens to platform fees on plans?', a: 'Sellers on the Free plan pay 15%, Champions pay 8%, and Legends pay just 5%. Buyers on paid plans get priority support and advanced features — not additional transaction costs.' },
  { q: 'Is there a free trial for paid plans?', a: 'We don\'t currently offer a trial period, but the free tier has no hidden limits — start without a credit card! We may introduce trials in the future.' },
];

// ── Card Component ────────────────────────────────────────────────────────────
const PlanCard = ({ plan, currentPlanId, isLoggedIn, billingAnnual }) => {
  const isCurrent = isLoggedIn && plan.id === currentPlanId;
  const displayPrice = plan.price === 0
    ? '0'
    : billingAnnual
      ? (plan.price * 0.8).toFixed(2)
      : plan.price;
  const displayPeriod = plan.price === 0 ? 'forever' : billingAnnual ? '/month, billed annually' : '/month';
  return (
    <div className={`relative flex flex-col bg-white border-2 rounded overflow-hidden transition-shadow
      ${plan.highlight ? 'border-blue-600 shadow-[6px_6px_0px_0px_rgba(37,99,235,0.35)]' : 'border-gray-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.7)]'}
    `}>
      {/* Popular badge */}
      {plan.badge && (
        <div className={`absolute top-0 right-0 text-white text-xs font-black px-3 py-1 ${plan.highlight ? 'bg-blue-600' : 'bg-gray-900'}`}>
          {plan.badge}
        </div>
      )}
      {isCurrent && (
        <div className="absolute top-0 left-0 bg-green-600 text-white text-xs font-black px-3 py-1">
          Current Plan ✓
        </div>
      )}

      <div className={`px-6 pt-6 pb-4 ${plan.highlight ? 'bg-blue-50' : 'bg-white'} border-b-2 ${plan.highlight ? 'border-blue-200' : 'border-gray-200'}`}>
        <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">{plan.name}</h3>
        <p className="text-gray-500 text-xs mt-1 mb-4">{plan.description}</p>
        <div className="flex items-end gap-1">
          <span className="text-3xl font-black text-gray-900">${displayPrice}</span>
          <span className="text-gray-400 text-sm font-semibold mb-1">{displayPeriod}</span>
        </div>
      </div>

      <ul className="flex-1 px-6 py-4 space-y-2.5">
        {plan.features.map((f, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${f.ok ? 'text-gray-700' : 'text-gray-300'}`}>
            <span className={`mt-0.5 flex-shrink-0 text-sm font-black ${f.ok ? 'text-green-500' : 'text-gray-300'}`}>{f.ok ? '✓' : '✗'}</span>
            {f.text}
          </li>
        ))}
      </ul>

      <div className="px-6 pb-6">
        {isCurrent ? (
          <div className="w-full text-center border-2 border-green-600 text-green-700 font-black py-2.5 rounded text-sm uppercase">
            Active Plan
          </div>
        ) : (
          <Link to={isLoggedIn ? plan.ctaLink : '/register'}
            className={`block w-full text-center font-black py-2.5 rounded text-sm uppercase tracking-wide transition-colors no-underline
              ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-900 hover:bg-gray-700 text-white'}`}>
            {plan.cta}
          </Link>
        )}
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const Pricing = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [activeTab, setActiveTab] = useState(
    user?.role === 'seller' ? 'seller' : 'buyer'
  );
  const [billingAnnual, setBillingAnnual] = useState(false);

  // Mock "current plan" — in a real app this comes from the user's subscription record
  const currentPlanId = null; // e.g. 'buyer_pro'

  const plans = activeTab === 'seller' ? sellerPlans : buyerPlans;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Hero */}
      <div className="bg-gray-900 text-white pt-14 pb-12 text-center px-4">
        <span className="inline-block bg-blue-600 text-white text-xs font-black px-3 py-1 rounded uppercase tracking-wide mb-4">Transparent Pricing · USD</span>
        <h1 className="font-black text-4xl md:text-5xl uppercase tracking-tight mb-3">
          Level Up Your Game,<br />Grow Your Business
        </h1>
        <p className="text-gray-300 max-w-xl mx-auto text-sm leading-relaxed mb-8">
          Whether you're hiring pro gamers or earning from your skills,
          GameLevelUp has a plan for you. All paid plans include escrow protection, priority support, and no hidden fees.
        </p>
        {!isAuthenticated && (
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white font-black px-7 py-3 rounded text-sm uppercase tracking-wide transition-colors no-underline">
              Start Free →
            </Link>
            <Link to="/jobs" className="border-2 border-white hover:bg-white hover:text-gray-900 text-white font-black px-7 py-3 rounded text-sm uppercase tracking-wide transition-colors no-underline">
              Browse Jobs
            </Link>
          </div>
        )}
        {isAuthenticated && (
          <p className="text-gray-400 text-sm">
            Logged in as <span className="text-white font-bold">{user?.name}</span> ({user?.role})
          </p>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Tab Toggle: Buyer | Seller */}
        <div className="flex justify-center mb-10">
          <div className="border-2 border-gray-900 rounded overflow-hidden flex">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-8 py-3 text-sm font-black uppercase tracking-wide transition-colors ${activeTab === 'buyer' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              🎮 I Want to Hire
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-8 py-3 text-sm font-black uppercase tracking-wide transition-colors border-l-2 border-gray-900 ${activeTab === 'seller' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
            >
              ⚡ I Want to Earn
            </button>
          </div>
        </div>

        {/* Billing Toggle: Monthly / Annual */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-black uppercase tracking-wide ${!billingAnnual ? 'text-gray-900' : 'text-gray-400'}`}>Monthly</span>
          <button
            onClick={() => setBillingAnnual(a => !a)}
            className={`relative w-14 h-7 rounded-full border-2 border-gray-900 transition-colors duration-300 focus:outline-none ${
              billingAnnual ? 'bg-blue-600' : 'bg-gray-200'
            }`}
            aria-label="Toggle annual billing"
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white border border-gray-300 shadow transition-transform duration-300 ${
                billingAnnual ? 'translate-x-7' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm font-black uppercase tracking-wide flex items-center gap-2 ${billingAnnual ? 'text-blue-600' : 'text-gray-400'}`}>
            Annual
            {billingAnnual && <span className="badge-pulse bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-green-300">SAVE 20%</span>}
          </span>
        </div>

        {/* Section Label */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">
            {activeTab === 'buyer'
              ? 'Plans for buyers who hire pro gamers for leveling, boosting, and coaching.'
              : 'Plans for sellers who earn by completing gaming service jobs.'}
          </p>
          {!isAuthenticated && (
            <p className="mt-2 text-xs text-gray-400 italic">
              Sign in to see your current plan highlighted below.
            </p>
          )}
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlanId={currentPlanId}
              isLoggedIn={isAuthenticated}
              billingAnnual={billingAnnual}
            />
          ))}
        </div>

        {/* Feature Comparison Note */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded p-5 mb-14 text-center">
          <p className="text-blue-800 text-sm font-semibold">
            🔒 All plans include{' '}
            <span className="has-tooltip cursor-help underline decoration-dotted" data-tip="Funds held safely until job is confirmed complete">
              escrow-protected payments
            </span>,{' '}
            in-app messaging, and 24/7 fraud monitoring.
            No hidden charges. No auto-upgrades without your consent.
          </p>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto mb-16">
          <h2 className="font-black text-gray-900 text-xl uppercase tracking-tight text-center mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <div key={i} className="border-2 border-gray-200 rounded overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex items-center justify-between w-full px-5 py-4 text-left text-sm font-black text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {f.q}
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed bg-white border-t border-gray-100">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Trust Bar */}
        <div className="border-t-2 border-gray-200 pt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '🔒', label: 'Escrow Protected', sub: 'Every transaction' },
              { icon: '💵', label: 'USD Currency', sub: 'Transparent pricing' },
              { icon: '⚡', label: 'Instant Payouts', sub: 'Seller earnings' },
              { icon: '🛡️', label: 'Fraud Monitored', sub: '24/7 AI + human review' },
            ].map(t => (
              <div key={t.label} className="flex flex-col items-center gap-2">
                <div className="text-3xl">{t.icon}</div>
                <p className="font-black text-gray-900 text-sm">{t.label}</p>
                <p className="text-gray-400 text-xs">{t.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ToS / Privacy links */}
        <div className="mt-10 text-center text-xs text-gray-400 space-x-4">
          <Link to="/terms" className="hover:text-blue-600">Terms of Service</Link>
          <span>·</span>
          <Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
