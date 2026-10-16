/**
 * GamesByVT — Ramudu–Seetha Game Component
 * Character Scoring Engine & Configuration View
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Plus, AlertCircle, CheckCircle2, ChevronRight, RotateCcw } from 'lucide-react';
import { Player, RamuduSeethaCharacter, RoomState } from '../../types/game.js';
import { RAMUDU_SEETHA_PENDING_RULES_NOTE } from './rules.js';

interface RamuduSeethaGameProps {
  room: RoomState;
  currentPlayer: Player;
  onSendAction: (action: string, payload?: any) => Promise<any>;
}

export const RamuduSeethaGame: React.FC<RamuduSeethaGameProps> = ({
  room,
  currentPlayer,
  onSendAction,
}) => {
  const [customName, setCustomName] = useState('');
  const [customScore, setCustomScore] = useState<number>(300);
  const [addingError, setAddingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulation state
  const [simulationRamuduFound, setSimulationRamuduFound] = useState<boolean>(true);
  const [simulationResult, setSimulationResult] = useState<any>(null);

  const characters = room.ramuduSeethaConfig.characters;
  const isHost = currentPlayer.isHost;

  const handleAddCharacter = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingError(null);
    setIsSubmitting(true);

    try {
      await onSendAction('addCustomCharacter', {
        name: customName,
        score: Number(customScore),
      });
      setCustomName('');
      setCustomScore(300);
    } catch (err: any) {
      setAddingError(err.message || 'Failed to add custom character.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const runSimulation = async (found: boolean) => {
    setSimulationRamuduFound(found);
    try {
      const res = await onSendAction('simulateRamuduSeethaScoring', {
        ramuduFoundSeetha: found,
      });
      if (res?.result) {
        setSimulationResult(res.result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    runSimulation(true);
  }, [characters.length]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Top Banner: Status Notice on Unconfirmed Mechanics */}
      <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-900 flex flex-col sm:flex-row items-start gap-3.5">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-semibold block text-amber-950 mb-0.5">
            Character Setup & Scoring Engine Active
          </span>
          <p className="text-amber-900/90">
            {RAMUDU_SEETHA_PENDING_RULES_NOTE}
          </p>
        </div>
      </div>

      {/* Grid of Confirmed Characters */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917]">
              Character Cards & Assigned Scores
            </h2>
            <p className="text-xs text-[#57534E]">
              Confirmed standard scoring rules and configurable roster.
            </p>
          </div>
          <button
            onClick={() => onSendAction('returnToLobby')}
            className="self-start sm:self-auto text-xs font-medium text-[#57534E] hover:text-[#1C1917] px-3 py-1.5 rounded-lg border border-[#E6DFD3] hover:bg-[#F3EFE6] transition-colors cursor-pointer"
          >
            ← Return to Lobby
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {characters.map((char) => {
            const isConditional = char.roleType === 'ramudu' || char.roleType === 'seetha';
            return (
              <div
                key={char.id}
                className="bg-white rounded-2xl border border-[#E6DFD3] p-5 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8C857B] mb-3">
                    <span className="font-mono text-[11px]">
                      {char.roleType === 'custom' ? 'Custom' : 'Standard'}
                    </span>
                    {isConditional && (
                      <span className="text-[10px] text-[#3B62D6] font-semibold">
                        Conditional
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-base font-bold text-[#1C1917]">
                    {char.name}
                  </h3>
                  
                  <p className="text-xs text-[#57534E] mt-1">
                    {char.roleType === 'ramudu' && 'Wins 1,000 if finds Seetha, else 0.'}
                    {char.roleType === 'seetha' && 'Wins 1,000 if stays hidden, else 0.'}
                    {char.roleType === 'fixed' && 'Guaranteed fixed round points.'}
                    {char.roleType === 'custom' && 'Host-configured custom role.'}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E6DFD3] flex items-baseline justify-between">
                  <span className="text-xs text-[#8C857B]">Base Score</span>
                  <span className="text-lg font-bold font-mono text-[#B45309] tabular-nums">
                    {char.baseScore.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Custom Character Configurator */}
      {isHost && (
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs">
          <div className="max-w-xl">
            <h3 className="text-base font-bold text-[#202124]">
              Add Custom Character
            </h3>
            <p className="text-xs text-[#777B83] mt-0.5 mb-4">
              Rule: Custom scores must be non-negative integers strictly below 500 (0 to 499).
            </p>

            {addingError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-xs text-red-700 rounded-lg">
                {addingError}
              </div>
            )}

            <form onSubmit={handleAddCharacter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Character Name (e.g. Sugriva)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-white border border-[#E7E7E3] rounded-xl text-xs text-[#202124] placeholder:text-[#777B83]/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] touch-target"
              />
              <input
                type="number"
                min={0}
                max={499}
                placeholder="Score (0-499)"
                value={customScore}
                onChange={(e) => setCustomScore(parseInt(e.target.value) || 0)}
                className="w-full sm:w-32 px-3.5 py-2.5 bg-white border border-[#E7E7E3] rounded-xl text-xs font-mono text-[#202124] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4169E1] touch-target"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2.5 bg-[#202124] hover:bg-[#4169E1] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer touch-target whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Character
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Authoritative Scoring Verification Simulator */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7E7E3]">
          <div>
            <h3 className="text-base font-bold text-[#202124]">
              Authoritative Scoring Engine Simulator
            </h3>
            <p className="text-xs text-[#777B83] mt-0.5">
              Simulate Ramudu finding or missing Seetha to verify mathematical scoring distribution.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1 bg-[#F5F5F1] rounded-xl">
            <button
              onClick={() => runSimulation(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                simulationRamuduFound
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#777B83] hover:text-[#202124]'
              }`}
            >
              Ramudu Finds Seetha
            </button>
            <button
              onClick={() => runSimulation(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                !simulationRamuduFound
                  ? 'bg-white text-[#202124] shadow-xs'
                  : 'text-[#777B83] hover:text-[#202124]'
              }`}
            >
              Ramudu Misses Seetha
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#E7E7E3] text-[#777B83]">
                <th className="py-2.5 px-3 font-medium">Player</th>
                <th className="py-2.5 px-3 font-medium">Character</th>
                <th className="py-2.5 px-3 font-medium">Authoritative Rule Outcome</th>
                <th className="py-2.5 px-3 font-medium text-right">Awarded Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E7E3]">
              {simulationResult?.scores?.map((item: any) => (
                <tr key={item.playerId} className="hover:bg-[#F5F5F1]/50">
                  <td className="py-3 px-3 font-medium text-[#202124]">
                    {item.playerName}
                  </td>
                  <td className="py-3 px-3 text-[#202124] font-semibold">
                    {item.characterName}
                  </td>
                  <td className="py-3 px-3 text-[#777B83]">
                    {item.notes}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-sm text-[#202124] tabular-nums">
                    {item.score.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
