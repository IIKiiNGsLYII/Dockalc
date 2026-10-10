import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Trophy, Sparkles, Check, ArrowRight } from 'lucide-react';
import type { AchievementItem } from '@/lib/numberMagic';
import { AchievementBadge, resolveBadgeTier } from './AchievementBadge';
import { fireTierCelebration, fireCloverConfetti } from '@/lib/confetti';
import { soundFX } from '@/lib/audio';

interface MilestoneCelebrationModalProps {
  achievement: AchievementItem | null;
  open: boolean;
  onClose: () => void;
  onOpenAllBadges?: () => void;
  totalUnlocked?: number;
  totalAvailable?: number;
  remainingInQueue?: number;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  achievement,
  open,
  onClose,
  onOpenAllBadges,
  totalUnlocked = 0,
  totalAvailable = 0,
  remainingInQueue = 0,
}) => {
  const badgesButtonRef = useRef<HTMLButtonElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open && achievement) {
      const tier = resolveBadgeTier(achievement);

      // Fire initial celebration scaled to tier (or 4-leaf clovers for Lucky Number 13)
      if (achievement.id === 'lucky-number-13') {
        fireCloverConfetti();
      } else {
        fireTierCelebration(tier);
      }

      // Play joyful victory chime fanfare
      try {
        soundFX.playVictoryChime(0.7);
      } catch {
        // Audio might be muted
      }

      // Keep on-screen celebratory effect active and looping continuously until dismissed
      const intervalMs = tier === 'epic' ? 1200 : tier === 'apex' ? 1400 : tier === 'legendary' ? 1700 : tier === 'gold' ? 2000 : 2500;
      const interval = setInterval(() => {
        if (achievement.id === 'lucky-number-13') {
          fireCloverConfetti();
        } else {
          fireTierCelebration(tier);
        }
      }, intervalMs);

      return () => clearInterval(interval);
    }
  }, [open, achievement]);

  if (!achievement) return null;

  const tierMap: Record<string, { border: string; badge: string; glow: string; ring: string }> = {
    epic: {
      border: 'border-amber-400 shadow-2xl ring-4 ring-amber-400/60 shadow-amber-500/40',
      badge: 'bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white font-black animate-pulse',
      glow: 'from-red-600/30 via-purple-600/25 to-amber-500/30',
      ring: 'ring-amber-400/70',
    },
    apex: {
      border: 'border-amber-400/80 shadow-2xl ring-2 ring-amber-400/60 shadow-amber-500/30',
      badge: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-amber-950 font-black',
      glow: 'from-amber-500/25 via-purple-600/20 to-transparent',
      ring: 'ring-amber-400/60',
    },
    legendary: {
      border: 'border-amber-400/60 shadow-amber-500/25',
      badge: 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white',
      glow: 'from-amber-500/20 via-rose-500/10 to-transparent',
      ring: 'ring-amber-400/50',
    },
    gold: {
      border: 'border-yellow-400/50 shadow-yellow-500/20',
      badge: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-bold',
      glow: 'from-yellow-500/20 to-transparent',
      ring: 'ring-yellow-400/40',
    },
    silver: {
      border: 'border-blue-400/40 shadow-blue-500/15',
      badge: 'bg-gradient-to-r from-slate-200 to-blue-200 text-slate-900 font-bold',
      glow: 'from-blue-500/15 to-transparent',
      ring: 'ring-blue-400/40',
    },
    bronze: {
      border: 'border-orange-400/40 shadow-orange-500/15',
      badge: 'bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold',
      glow: 'from-orange-500/15 to-transparent',
      ring: 'ring-orange-400/40',
    },
  };
  const tierColors = tierMap[achievement.tier || 'bronze'] || tierMap.bronze;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent
        overlayClassName="z-[70]"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          primaryButtonRef.current?.focus();
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            badgesButtonRef.current?.focus();
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            primaryButtonRef.current?.focus();
          }
        }}
        className={`w-[calc(100%-2rem)] max-w-md p-0 overflow-hidden rounded-2xl border shadow-2xl bg-card text-card-foreground ${tierColors.border} max-h-[90dvh] flex flex-col z-[70]`}
      >
        {/* Glow Header Background */}
        <div className={`relative px-6 pt-7 pb-4 text-center bg-gradient-to-b ${tierColors.glow} overflow-hidden`}>
          {/* Pulsing Aura Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
            <div className="w-48 h-48 rounded-full border border-primary/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="w-32 h-32 rounded-full border border-primary/50 animate-pulse" />
          </div>

          {/* Celebratory Tier Pill */}
          <div className={`relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm mb-3.5 mx-auto ${
            achievement.tier === 'epic' || achievement.id === 'all-milestones-epic'
              ? 'text-white bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 shadow-xl ring-2 ring-amber-400 animate-pulse'
              : (achievement.id === 'calc-100k' || achievement.id === 'custom-key-10k' || achievement.id === 'custom-key-100k' || achievement.tier === 'apex')
                ? 'text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 shadow-lg ring-2 ring-amber-300/60'
                : 'text-primary-foreground bg-primary'
          }`}>
            <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            <span>
              {achievement.tier === 'epic' || achievement.id === 'all-milestones-epic'
                ? '🔥 SUPREME EPIC OMNISCIENT PINNACLE! 🔥'
                : (achievement.id === 'calc-100k')
                  ? '👑 SUPREME APEX 100K PINNACLE UNLOCKED! 👑'
                  : (achievement.id === 'custom-key-10k' || achievement.id === 'custom-key-100k' || achievement.tier === 'apex')
                    ? '👑 SUPREME APEX 10K PINNACLE UNLOCKED! 👑'
                    : 'Milestone Unlocked!'}
            </span>
          </div>

          {/* Big Iconic SVG Badge */}
          <div className="relative mx-auto flex items-center justify-center transition-transform hover:scale-105 duration-300 py-1">
            <AchievementBadge
              achievement={achievement}
              size={
                achievement.tier === 'epic' || achievement.id === 'all-milestones-epic'
                  ? 120
                  : achievement.id === 'calc-100k' || achievement.id === 'custom-key-10k' || achievement.id === 'custom-key-100k' || achievement.tier === 'apex'
                    ? 110
                    : 96
              }
              animated={true}
            />
            <div className="absolute bottom-0 right-1/4 p-1.5 rounded-full bg-amber-500 text-white shadow-md">
              <Trophy className="w-4 h-4" />
            </div>
          </div>

          <DialogHeader className="mt-4 space-y-1 text-center">
            <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground text-center">
              {achievement.title}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto text-center leading-relaxed break-words text-pretty">
              {achievement.description}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Progress & Category Details Body */}
        <div className="px-6 py-4 space-y-4 bg-card/60 backdrop-blur-sm">
          <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Achievement Tier:</span>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${tierColors.badge}`}>
                {achievement.tier || 'Standard'}
              </span>
            </div>
            {totalAvailable > 0 && (
              <span className="text-muted-foreground font-mono text-[11px]">
                {totalUnlocked} of {totalAvailable} Unlocked
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 pt-1">
            {onOpenAllBadges && (
              <button
                ref={badgesButtonRef}
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAllBadges();
                }}
                className="flex-1 h-11 py-2 px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
              >
                <span>View Badges</span>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}

            <button
              ref={primaryButtonRef}
              type="button"
              onClick={onClose}
              className="flex-1 h-11 py-2 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 ring-2 ring-primary/20 shrink-0 focus:outline-none focus:ring-primary focus:ring-offset-2 focus:ring-offset-card"
            >
              {remainingInQueue > 0 ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Next Unlocked</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Awesome!</span>
                </>
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
