import React from 'react';
import { Link } from 'react-router-dom';

const Section = ({ title, children }) => (
  <section className="mb-8">
    <h2 className="font-black text-gray-900 text-lg uppercase tracking-wide mb-3 border-l-4 border-blue-600 pl-3">
      {title}
    </h2>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </section>
);

const TermsOfService = () => (
  <div className="min-h-screen bg-gray-50 font-sans">
    {/* Breadcrumb */}
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="max-w-4xl mx-auto flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <span className="text-gray-700">Terms of Service</span>
      </div>
    </div>

    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="bg-white border-2 border-gray-900 rounded shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] p-8 mb-8">
        <span className="inline-block bg-blue-100 text-blue-700 text-xs font-black px-3 py-1 rounded uppercase tracking-wide mb-3">Legal</span>
        <h1 className="font-black text-gray-900 text-3xl uppercase leading-tight mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last updated: March 2025 · Effective immediately</p>
      </div>

      {/* Content */}
      <div className="bg-white border-2 border-gray-200 rounded p-8">
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          Welcome to <strong className="text-gray-900">GameLevelUp Marketplace</strong>. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.
        </p>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using GameLevelUp, you confirm that you are at least 18 years old (or the age of legal majority in your jurisdiction) and accept these Terms in full.</p>
          <p>If you do not agree to any part of these Terms, you must not use the platform.</p>
        </Section>

        <Section title="2. Platform Description">
          <p>GameLevelUp is a peer-to-peer marketplace connecting buyers (players) with sellers (pro gamers and coaches) for legitimate gaming services including rank improvement coaching, account leveling assistance, and skill training sessions.</p>
          <p><strong>Important:</strong> GameLevelUp is strictly a skill-based service marketplace. We do not facilitate real-money gambling, wagering, or any activity that violates the terms of game publishers.</p>
        </Section>

        <Section title="3. User Accounts">
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
          <p>We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent activity, or provide false information.</p>
        </Section>

        <Section title="4. Buyer Obligations">
          <p>Buyers must provide accurate job descriptions and realistic budgets. Buyers must not attempt to contact sellers outside the platform to avoid platform fees. Payment is held in escrow until job completion is confirmed. Buyers must confirm completion within 7 days or funds are auto-released.</p>
        </Section>

        <Section title="5. Seller Obligations">
          <p>Sellers must complete jobs as described and deliver results within the agreed timeline. Sellers must not use unauthorized software, bots, or exploits. Sellers agree to the platform fee deducted from each completed transaction.</p>
        </Section>

        <Section title="6. Escrow & Payments">
          <p>All payments are processed through our trusted payment partner, Polar.sh. Funds are held in escrow upon job acceptance and released to the seller after buyer confirmation. Disputed transactions undergo a review process and may be refunded or released at our discretion.</p>
          <p>All prices are listed in USD ($). Currency conversion costs are borne by the user.</p>
        </Section>

        <Section title="7. Prohibited Activities">
          <ul className="list-disc list-inside space-y-1">
            <li>Real-money gambling or wagering</li>
            <li>Account sharing in violation of game publisher rules</li>
            <li>Fraudulent reviews or fake job postings</li>
            <li>Harassment, hate speech, or abusive behavior</li>
            <li>Circumventing platform fees or escrow</li>
          </ul>
        </Section>

        <Section title="8. Dispute Resolution">
          <p>If a dispute arises between a buyer and seller, either party may raise it within 48 hours of the payment release deadline. Our team reviews disputes and issues decisions within 5 business days. Our decisions are final.</p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>GameLevelUp is a marketplace facilitating connections. We are not responsible for the quality of services provided by sellers, account bans resulting from services used, or losses arising from disputes beyond our escrow balance.</p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>We may update these Terms at any time. Continued use of the platform after changes constitutes acceptance. We will notify users of material changes via email.</p>
        </Section>

        <div className="border-t-2 border-gray-100 pt-6 mt-6 flex items-center justify-between flex-wrap gap-4">
          <p className="text-gray-400 text-xs">Questions? Contact us at <a href="mailto:legal@gamelevelup.com" className="text-blue-600 hover:underline">legal@gamelevelup.com</a></p>
          <Link to="/privacy" className="text-blue-600 font-bold text-xs hover:underline">Privacy Policy →</Link>
        </div>
      </div>
    </div>
  </div>
);

export default TermsOfService;
