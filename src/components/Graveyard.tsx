import React from 'react';
import type { CrematedTab } from '../types';
import { soundEngine } from '../engine/soundEngine';
import { RotateCcw, ExternalLink } from 'lucide-react';

interface GraveyardProps {
  graveyard: CrematedTab[];
  onRevive: (tab: CrematedTab) => void;
  onClearGraveyard: () => void;
}

export const Graveyard: React.FC<GraveyardProps> = ({
  graveyard,
  onRevive,
  onClearGraveyard,
}) => {
  if (graveyard.length === 0) {
    return (
      <div className="p-8 border border-dashed border-[#1B2A26]/30 text-center font-mono text-xs text-[#5E6963] bg-[#F8F5F0]/60">
        NO CREMATED SPECIMENS YET. YOUR DIGITAL CEMETERY IS EMPTY.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[#1B2A26]">
        <div className="font-mono text-xs font-semibold tracking-wider uppercase text-[#1B2A26]">
          THE DIGITAL CEMETERY ({graveyard.length} SOULS LAID TO REST)
        </div>
        <button
          onClick={() => {
            soundEngine.playCrumble();
            onClearGraveyard();
          }}
          className="text-[11px] font-mono text-[#C84B31] hover:underline uppercase"
        >
          [PURGE ALL ASHES]
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {graveyard.map((tomb) => {
          const dateStr = new Date(tomb.diedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={tomb.id}
              className="p-3 border border-[#7A7571] bg-[#EAE5DE] flex flex-col justify-between shadow-[2px_2px_0px_#7A7571] relative"
            >
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5E6963] pb-1.5 border-b border-[#7A7571]/30 mb-2">
                  <span>RIP: {dateStr}</span>
                  <span>{tomb.lifetimeHours}h ALIVE</span>
                </div>

                <a
                  href={tomb.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => soundEngine.playClick()}
                  className="text-xs font-medium text-[#1B2A26] line-clamp-1 hover:underline flex items-center gap-1 mb-1"
                >
                  {tomb.title}
                  <ExternalLink className="w-3 h-3 inline shrink-0 opacity-60" />
                </a>

                <div className="text-[10px] font-mono text-[#C84B31] mb-2 uppercase">
                  CAUSE: {tomb.causeOfDeath}
                </div>

                <div className="p-2 bg-[#E1DBD2] border-l-2 border-[#7A7571] text-[11px] font-mono italic text-[#1B2A26]/80 mb-3">
                  "{tomb.epitaph}"
                </div>
              </div>

              <div className="pt-2 border-t border-[#7A7571]/30 flex justify-end">
                <button
                  onClick={() => {
                    soundEngine.playWater();
                    onRevive(tomb);
                  }}
                  className="brutalist-btn py-1 px-2.5 text-[10px] flex items-center gap-1 hover:bg-[#3D5A45]/15 text-[#1B2A26]"
                >
                  <RotateCcw className="w-3 h-3 text-[#3D5A45]" />
                  EXHUME & REVIVE
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
