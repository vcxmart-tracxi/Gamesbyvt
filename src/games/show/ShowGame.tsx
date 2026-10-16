/**
 * GamesByVT — Show Card Game Component
 * Keep Three Cards. Pass One. Repeat.
 * Designed and Developed by Bodepudi Varun Teja
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, RotateCw, Sparkles, Trophy, Users, ShieldAlert } from 'lucide-react';
import { Player, PrivatePlayerData, RoomState, ShowCard } from '../../types/game.js';
import { playCardPassSound, playSuccessFanfare } from '../../utils/audio.js';

interface ShowGameProps {
  room: RoomState;
  currentPlayer: Player;
  privateData: PrivatePlayerData | null;
  onSendAction: (action: string, payload?: any) => Promise<any>;
}

export const ShowGame: React.FC<ShowGameProps> = ({
  room,
  currentPlayer,
  privateData,
  onSendAction,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [submittingPass, setSubmittingPass] = useState(false);
  const [declaringShow, setDeclaringShow] = useState(false);

  const showState = room.showState;
  const hand = privateData?.show?.hand || [];
  const submittedIds = showState?.submittedPlayerIds || [];
  const isAlreadySubmitted = submittedIds.includes(currentPlayer.id);
  const passingOrder = showState?.passingOrder || [];
  const roundNumber = showState?.roundNumber || 1;
  const category = showState?.category || room.showConfig.category;
  const receivedCardId = privateData?.show?.receivedCardIdFromLastRound;

  // Sound triggers on new round or showdown
  const prevRoundRef = React.useRef(roundNumber);
  React.useEffect(() => {
    if (roundNumber > prevRoundRef.current) {
      prevRoundRef.current = roundNumber;
      setSelectedCardId(null);
      playCardPassSound();
    }
  }, [roundNumber]);

  const handleSelectCard = (card: ShowCard) => {
    if (isAlreadySubmitted) return;
    setSelectedCardId(card.id);
  };

  const handlePassCard = async () => {
    if (!selectedCardId || isAlreadySubmitted || submittingPass) return;
    setSubmittingPass(true);
    try {
      await onSendAction('showSelectPassCard', { cardId: selectedCardId });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingPass(false);
    }
  };

  const handleDeclareShow = async () => {
    if (declaringShow) return;
    setDeclaringShow(true);
    try {
      await onSendAction('showDeclareShowdown');
      playSuccessFanfare();
    } catch (err) {
      console.error(err);
    } finally {
      setDeclaringShow(false);
    }
  };

  // Find recipient: Who receives our card? (Next in clockwise passing order)
  const myIndex = passingOrder.indexOf(currentPlayer.id);
  const nextPlayerId = myIndex !== -1 ? passingOrder[(myIndex + 1) % passingOrder.length] : null;
  const nextPlayerName = nextPlayerId ? room.players[nextPlayerId]?.name : 'Next Player';

  // Check if current hand has 4 of a kind
  const isFourOfAKind = hand.length === 4 && hand.every(c => c.name === hand[0].name);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Top HUD: Round Info & Passing Direction */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E7E7E3]">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-lg bg-[#202124] text-white font-mono text-xs font-semibold tabular-nums">
            Round {roundNumber}
          </div>
          <div className="text-xs text-[#777B83] flex items-center gap-1.5 font-medium">
            <span>Category: <strong className="text-[#202124]">{category}</strong></span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 text-[#4169E1]">
              <RotateCw className="w-3 h-3" />
              Clockwise Passing
            </span>
          </div>
        </div>

        {currentPlayer.isHost && (
          <button
            onClick={() => onSendAction('returnToLobby')}
            className="self-start sm:self-auto text-xs font-medium text-[#777B83] hover:text-[#202124] px-3 py-1.5 rounded-lg border border-[#E7E7E3] hover:bg-[#F5F5F1] transition-colors cursor-pointer"
          >
            Return to Lobby
          </button>
        )}
      </div>

      {/* Hero Passing Action Instruction Banner */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#777B83] font-medium block">
            Passing Phase
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#202124]">
            {isAlreadySubmitted
              ? 'Card submitted! Waiting for other players...'
              : `Select 1 card to pass clockwise to ${nextPlayerName}`}
          </h2>
          <p className="text-xs text-[#777B83] mt-0.5">
            You keep 3 cards and receive 1 new card once all players have submitted.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Declare Show button (if player assembled 4 matching cards) */}
          <button
            onClick={handleDeclareShow}
            disabled={declaringShow}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all touch-target cursor-pointer ${
              isFourOfAKind
                ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm animate-bounce'
                : 'bg-white border border-[#E7E7E3] text-[#777B83] hover:text-[#202124] hover:bg-[#F5F5F1]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Declare Show</span>
          </button>

          <button
            onClick={handlePassCard}
            disabled={!selectedCardId || isAlreadySubmitted || submittingPass}
            className="flex-1 md:flex-initial px-5 py-2.5 bg-[#4169E1] hover:bg-[#3154C4] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-40 cursor-pointer shadow-xs touch-target focus-visible:ring-2 focus-visible:ring-[#4169E1]"
          >
            {isAlreadySubmitted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submitted</span>
              </>
            ) : (
              <>
                <span>Pass Selected Card</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Private Hand: Exactly Four Cards (Guaranteed No Overflow) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#202124]">
            Your Private Hand (4 Cards)
          </h3>
          <span className="text-xs text-[#777B83]">
            Only you can see your card names
          </span>
        </div>

        {/* 2x2 grid on small screens, 4 columns on tablets/desktops */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {hand.map((card, idx) => {
            const isSelected = selectedCardId === card.id;
            const isNewArrival = card.id === receivedCardId;

            return (
              <div
                key={card.id}
                onClick={() => handleSelectCard(card)}
                className={`relative bg-white rounded-2xl border p-4 sm:p-5 flex flex-col justify-between h-44 sm:h-52 transition-all cursor-pointer select-none shadow-xs touch-target ${
                  isSelected
                    ? 'border-2 border-[#4169E1] ring-2 ring-[#4169E1]/20 -translate-y-1 bg-[#EEF2FD]/30'
                    : 'border-[#E7E7E3] hover:border-[#4169E1]/40 hover:-translate-y-0.5'
                }`}
              >
                {/* Top Card Info */}
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono text-[#777B83]">
                    #{idx + 1}
                  </span>
                  
                  {isNewArrival && (
                    <span className="text-[9px] font-semibold text-[#4169E1] bg-[#EEF2FD] px-2 py-0.5 rounded-md">
                      New Card
                    </span>
                  )}
                  
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-[#4169E1] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                  )}
                </div>

                {/* Card Name */}
                <div className="my-auto text-center py-2">
                  <div className="w-10 h-10 rounded-full bg-[#F5F5F1] text-[#4169E1] font-bold text-sm mx-auto flex items-center justify-center mb-2">
                    {card.name.charAt(0)}
                  </div>
                  <h4 className="font-bold text-sm sm:text-base text-[#202124] leading-tight">
                    {card.name}
                  </h4>
                  <span className="text-[10px] text-[#777B83] mt-0.5 block">
                    {card.category}
                  </span>
                </div>

                {/* Card Selection Action Hint */}
                <div className="pt-2 border-t border-[#E7E7E3] text-center">
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-[#4169E1] font-semibold' : 'text-[#777B83]'}`}>
                    {isSelected ? 'Ready to pass' : isAlreadySubmitted ? 'Round in progress' : 'Tap to pass this card'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Passing Status Tracker (Whose turn / who has submitted) */}
      <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Round Passing Progress
          </h4>
          <span className="text-xs font-mono text-[#777B83] tabular-nums">
            {submittedIds.length} / {passingOrder.length} Ready
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {passingOrder.map((pId) => {
            const p = room.players[pId];
            const hasSubmitted = submittedIds.includes(pId);
            const isMe = pId === currentPlayer.id;

            return (
              <div
                key={pId}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  hasSubmitted
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : 'bg-[#FAFAF8] border-[#E7E7E3] text-[#777B83]'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={`w-2 h-2 rounded-full ${hasSubmitted ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                  <span className="font-medium truncate text-[#202124]">
                    {p ? p.name : 'Player'} {isMe && '(You)'}
                  </span>
                </div>
                <span className="text-[10px] font-semibold">
                  {hasSubmitted ? 'Ready' : 'Deciding'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Showdown Declarations (if any player revealed) */}
      {showState?.revealedShowdowns && showState.revealedShowdowns.length > 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E7E3] p-5 shadow-xs space-y-3">
          <h4 className="text-xs font-bold text-[#202124] uppercase tracking-wider">
            Showdown Inspection
          </h4>
          {showState.revealedShowdowns.map((rev, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${
                rev.isFourOfAKind
                  ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                  : 'bg-[#FAFAF8] border-[#E7E7E3] text-[#202124]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">
                  {rev.playerName} declared SHOW!
                </span>
                <span className="text-xs font-semibold">
                  {rev.isFourOfAKind ? '🏆 4 of a Kind Verified!' : 'Did not match 4-of-a-kind'}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto text-xs font-mono">
                {rev.cards.map(c => (
                  <span key={c.id} className="px-2 py-1 bg-white rounded border border-[#E7E7E3]">
                    {c.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
