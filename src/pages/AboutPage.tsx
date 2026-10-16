/**
 * GamesByVT — About & Architecture Documentation Page
 * Designed and Developed by Bodepudi Varun Teja
 */

import React from 'react';
import { ArrowLeft, CheckCircle2, Shield, Code, Server, Smartphone, Users } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (route: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('home')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#777B83] hover:text-[#202124] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div>
        <div className="text-xs font-semibold text-[#4169E1] tracking-wide mb-1">
          PLATFORM & ARCHITECTURE SPECIFICATION
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#202124]">
          About GamesByVT
        </h1>
        <p className="text-sm text-[#777B83] mt-2 leading-relaxed">
          Designed and Developed by <strong className="font-semibold text-[#202124]">Bodepudi Varun Teja</strong>.
          GamesByVT is an authoritative real-time multiplayer gaming platform built for shared rooms across mobile, tablet, and desktop devices.
        </p>
      </div>

      {/* Creator & Philosophy Section */}
      <section className="bg-white rounded-3xl border border-[#E7E7E3] p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#202124]">
          Design System & Philosophy
        </h2>
        <p className="text-xs sm:text-sm text-[#777B83] leading-relaxed">
          GamesByVT rejects artificial visual clutter, neon gradients, and slow pseudo-dashboards in favor of a calm, warm, responsive aesthetic:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div className="p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
            <span className="block text-[10px] text-[#777B83] font-mono">CANVAS</span>
            <span className="text-xs font-bold text-[#202124] mt-0.5 block">#FAFAF8</span>
            <span className="text-[11px] text-[#777B83]">Warm White</span>
          </div>
          <div className="p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
            <span className="block text-[10px] text-[#777B83] font-mono">ACCENT</span>
            <span className="text-xs font-bold text-[#4169E1] mt-0.5 block">#4169E1</span>
            <span className="text-[11px] text-[#777B83]">Muted Blue</span>
          </div>
          <div className="p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
            <span className="block text-[10px] text-[#777B83] font-mono">PRIMARY TEXT</span>
            <span className="text-xs font-bold text-[#202124] mt-0.5 block">#202124</span>
            <span className="text-[11px] text-[#777B83]">Dark Charcoal</span>
          </div>
          <div className="p-3.5 rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
            <span className="block text-[10px] text-[#777B83] font-mono">BORDERS</span>
            <span className="text-xs font-bold text-[#777B83] mt-0.5 block">#E7E7E3</span>
            <span className="text-[11px] text-[#777B83]">Soft Grey</span>
          </div>
        </div>
      </section>

      {/* Real-time Multiplayer Architecture */}
      <section className="bg-white rounded-3xl border border-[#E7E7E3] p-8 shadow-xs space-y-6">
        <div>
          <h2 className="text-xl font-bold text-[#202124]">
            Authoritative Multiplayer Architecture
          </h2>
          <p className="text-xs sm:text-sm text-[#777B83] mt-1 leading-relaxed">
            Unlike static prototypes that store game state in localStorage, GamesByVT is fully server-authoritative.
          </p>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-[#777B83] leading-relaxed">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#202124]">Server-Authoritative Validation:</strong> All game decisions (Tambola tickets, drawn balls, Show deck distribution, passing resolution, and Ramudu-Seetha score outcomes) are computed strictly by the server. Clients submit action intents; the backend verifies ownership and updates state.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#202124]">Private Hand Isolation:</strong> In Show and Ramudu-Seetha, a player's private cards are delivered only to that authenticated player. The public room broadcast never leaks hand contents to other players, preventing inspection attacks.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#202124]">Instant SSE Synchronization:</strong> Uses native HTTP Server-Sent Events with periodic keep-alive heartbeats, giving sub-second room sync across multiple devices without heavy third-party client bundles.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#202124]">Reconnection & Host Handover:</strong> Every joining player receives a revocable reconnect token stored in secure session storage. If a player refreshes, drops connection, or closes their browser, their session is automatically restored upon return. If a host disconnects, host privileges transfer smoothly to the next active player.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#202124]">Automated Lifecycle & Room Sweep:</strong> An automated background sweep runs every 60 seconds on the server. Rooms that have been idle for &gt; 45 minutes with no active connections or older than 4 hours are purged to prevent memory leaks.
            </div>
          </div>
        </div>
      </section>

      {/* Firebase Security Rules */}
      <section className="bg-white rounded-3xl border border-[#E7E7E3] p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#202124]">
          Firebase Security Rules
        </h2>
        <p className="text-xs text-[#777B83] leading-relaxed">
          Restrictive security rules files are provided in <code className="px-1.5 py-0.5 bg-[#F5F5F1] rounded font-mono text-xs">/firebase/database.rules.json</code> and <code className="px-1.5 py-0.5 bg-[#F5F5F1] rounded font-mono text-xs">/firebase/firestore.rules</code>:
        </p>

        <pre className="p-4 bg-[#FAFAF8] rounded-xl border border-[#E7E7E3] font-mono text-[11px] text-[#202124] overflow-x-auto leading-relaxed">
{`// /firebase/database.rules.json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": "auth != null",
        ".write": "auth != null && (data.child('hostId').val() === auth.uid || !data.exists())",
        "players": {
          "$playerId": {
            ".write": "auth != null && auth.uid === $playerId"
          }
        }
      }
    },
    "private": {
      "$roomCode": {
        "$playerId": {
          ".read": "auth != null && auth.uid === $playerId",
          ".write": "auth != null && auth.uid === $playerId"
        }
      }
    }
  }
}`}
        </pre>
      </section>

      {/* Automated Testing Verification */}
      <section className="bg-white rounded-3xl border border-[#E7E7E3] p-8 shadow-xs space-y-4">
        <h2 className="text-xl font-bold text-[#202124]">
          Automated Test Suite (26 / 26 Passing)
        </h2>
        <p className="text-xs text-[#777B83] leading-relaxed">
          All game logic is validated by an automated test suite runnable via <code className="px-1.5 py-0.5 bg-[#F5F5F1] rounded font-mono text-xs">npm test</code>:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E7E3]">
            <span className="font-bold text-[#202124] block">Ramudu–Seetha</span>
            <span className="text-emerald-700 font-semibold mt-1 block">9 / 9 Tests Passing</span>
            <span className="text-[11px] text-[#777B83]">Conditional 1000, 0 pts & score &lt; 500</span>
          </div>
          <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E7E3]">
            <span className="font-bold text-[#202124] block">Housy / Tambola</span>
            <span className="text-emerald-700 font-semibold mt-1 block">9 / 9 Tests Passing</span>
            <span className="text-[11px] text-[#777B83]">3x9 grid, 15 numbers, 5 patterns</span>
          </div>
          <div className="p-3 bg-[#FAFAF8] rounded-xl border border-[#E7E7E3]">
            <span className="font-bold text-[#202124] block">Show</span>
            <span className="text-emerald-700 font-semibold mt-1 block">8 / 8 Tests Passing</span>
            <span className="text-[11px] text-[#777B83]">4-card invariant & clockwise pass</span>
          </div>
        </div>
      </section>

    </div>
  );
};
