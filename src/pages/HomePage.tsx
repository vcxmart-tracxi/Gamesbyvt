/**
 * GamesByVT — Home Page
 * Minimalist, high-performance responsive landing page.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';
import { PlusCircle, Users, ArrowRight, Check, Sparkles } from 'lucide-react';
import { GameCard } from '../components/GameCard.js';
import { GameType } from '../types/game.js';

interface HomePageProps {
  onOpenCreate: () => void;
  onOpenJoin: () => void;
  onSelectGameCard: (game: GameType) => void;
  onNavigate: (route: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onOpenCreate,
  onOpenJoin,
  onSelectGameCard,
  onNavigate,
}) => {
  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      
      {/* Hero Section */}
      <section className="pt-8 sm:pt-14 pb-4 text-center max-w-4xl mx-auto px-4">
        
        {/* Subtle Author kicker (Editorial typography) */}
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#777B83] mb-3">
          <span>GamesByVT</span>
          <span aria-hidden="true">·</span>
          <span>Designed & Developed by Bodepudi Varun Teja</span>
        </div>

        {/* Hero Headline with text-wrap: balance */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#202124] leading-[1.15] text-balance">
          Play Together, Anywhere.
        </h1>

        {/* Animated Room Status Badge with moving dots */}
        <div className="mt-4 flex items-center justify-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#E7E7E3] text-xs font-medium text-[#202124] shadow-xs backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-[#4169E1] animate-ping" />
            <span>Instant multiplayer rooms · One click to join</span>
          </div>
        </div>

        {/* Hero Actions */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            onClick={onOpenCreate}
            className="w-full sm:w-auto px-6 py-3.5 bg-[#4169E1] hover:bg-[#3154C4] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 touch-target focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#4169E1]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Room</span>
          </button>

          <button
            onClick={onOpenJoin}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#F5F5F1] text-[#202124] border border-[#E7E7E3] font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer hover:-translate-y-0.5 touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            <Users className="w-4 h-4 text-[#777B83]" />
            <span>Join Room</span>
          </button>
        </div>

      </section>

      {/* Featured Games Section: 3 Balanced Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#202124]">
              Three Handcrafted Games
            </h2>
            <p className="text-sm text-[#777B83] mt-1">
              Select any game to create an instant room or explore the rules.
            </p>
          </div>
          <button
            onClick={() => onNavigate('about')}
            className="text-xs font-semibold text-[#4169E1] hover:text-[#3154C4] flex items-center gap-1 cursor-pointer"
          >
            <span>Read full rules & specs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Game Cards Grid (Stacked on mobile, 3-col on desktop) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GameCard
            type="ramudu-seetha"
            title="Ramudu–Seetha"
            tagline="Hidden character cards & special scoring"
            description="Play with Ramudu, Seetha, Lakshman, Hanumal, and Vaali. Experience mathematically verified scoring with custom character support."
            playerRange="2–12 Players"
            onSelect={onSelectGameCard}
          />

          <GameCard
            type="housy"
            title="Housy / Tambola"
            tagline="Live number calling with 5 winning patterns"
            description="Play authentic Tambola with an authoritative 1–90 caller, unique 3×9 tickets, auto-marking, and server-verified claims for Early Five to Full House."
            playerRange="1–12 Players"
            onSelect={onSelectGameCard}
          />

          <GameCard
            type="show"
            title="Show"
            tagline="Keep three cards. Pass one. Repeat."
            description="A rapid passing card game. Select categories like Cars, Animals, or Actors. Pass one card clockwise each round to assemble a matching set."
            playerRange="2–12 Players"
            onSelect={onSelectGameCard}
          />
        </div>
      </section>

      {/* Rules Breakdown Section */}
      <section id="rules-section" className="max-w-6xl mx-auto px-4 sm:px-6 scroll-mt-20">
        <div className="bg-white rounded-3xl border border-[#E7E7E3] p-8 sm:p-12 shadow-xs">
          
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-semibold text-[#4169E1] tracking-wide block mb-1">
              GAMEPLAY DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#202124]">
              Rules at a Glance
            </h2>
            <p className="text-sm text-[#777B83] mt-2">
              Every game in GamesByVT runs on server-authoritative logic. Here is how each game is structured.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Rule 1: Ramudu-Seetha */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#EEF2FD] text-[#4169E1] flex items-center justify-center font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-bold text-[#202124]">
                Ramudu–Seetha
              </h3>
              <ul className="text-xs text-[#777B83] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Ramudu & Seetha:</strong> 1,000 points conditional on discovery. If Ramudu finds Seetha, Ramudu gets 1,000 and Seetha gets 0. If Ramudu misses, Ramudu gets 0 and Seetha gets 1,000.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Fixed Characters:</strong> Lakshman (900), Hanumal (750), Vaali (500) keep assigned scores.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Custom Characters:</strong> Host can add roles with non-negative scores strictly &lt; 500.</span>
                </li>
              </ul>
            </div>

            {/* Rule 2: Housy */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#EEF2FD] text-[#4169E1] flex items-center justify-center font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-bold text-[#202124]">
                Housy (Tambola)
              </h3>
              <ul className="text-xs text-[#777B83] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Standard Tickets:</strong> 3 rows × 9 columns with exactly 5 numbers per row (15 total).</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Live Calling:</strong> Host draws from 1 to 90 without duplicates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>5 Verified Patterns:</strong> Early Five, Top Line, Middle Line, Bottom Line, and Full House. Claims are validated on the backend.</span>
                </li>
              </ul>
            </div>

            {/* Rule 3: Show */}
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-xl bg-[#EEF2FD] text-[#4169E1] flex items-center justify-center font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-bold text-[#202124]">
                Show
              </h3>
              <ul className="text-xs text-[#777B83] space-y-2 leading-relaxed">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Initial Hand:</strong> Every active player receives exactly four private cards.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Simultaneous Pass:</strong> Each player selects 1 card to pass clockwise.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-[#4169E1] shrink-0 mt-0.5" />
                  <span><strong>Invariant Protection:</strong> After every round, each player receives 1 card and returns to exactly 4 cards.</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

