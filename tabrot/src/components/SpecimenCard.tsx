import React from 'react';
import type { TabSpecimen } from '../types';
import { soundEngine } from '../engine/soundEngine';
import { Droplet, Flame, Pin, ExternalLink, Skull } from 'lucide-react';

interface SpecimenCardProps {
  tab: TabSpecimen;
  onWater: (id: string) => void;
  onCremate: (id: string) => void;
  onFocus: (tab: TabSpecimen) => void;
  onTogglePin: (id: string) => void;
}

export const SpecimenCard: React.FC<SpecimenCardProps> = ({
  tab,
  onWater,
  onCremate,
  onFocus,
  onTogglePin,
}) => {
  const getStageBadge = () => {
    switch (tab.stage) {
      case 'fresh':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono uppercase bg-[#3D5A45]/10 text-[#3D5A45] border border-[#3D5A45]/40 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3D5A45] animate-pulse"></span>
            01 Fresh
          </span>
        );
      case 'stale':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono uppercase bg-[#BFA054]/15 text-[#8A7129] border border-[#BFA054]/50 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#BFA054]"></span>
            02 Stale
          </span>
        );
      case 'rotten':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono uppercase bg-[#C84B31]/15 text-[#C84B31] border border-[#C84B31]/50 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C84B31]"></span>
            03 Rotten
          </span>
        );
      case 'fossilized':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[11px] font-mono uppercase bg-[#7A7571]/20 text-[#474340] border border-[#7A7571]/60 font-semibold">
            <Skull className="w-3 h-3 text-[#474340]" />
            04 Fossil
          </span>
        );
    }
  };

  const getBorderColor = () => {
    switch (tab.stage) {
      case 'fresh':
        return 'border-[#1B2A26]';
      case 'stale':
        return 'border-[#1B2A26]';
      case 'rotten':
        return 'border-[#C84B31]';
      case 'fossilized':
        return 'border-[#7A7571] opacity-85';
    }
  };

  // Discrete ASCII-style progress block
  const totalBlocks = 10;
  const filledBlocks = Math.round((tab.rotScore / 100) * totalBlocks);
  const meterBlocks = '█'.repeat(filledBlocks) + '░'.repeat(totalBlocks - filledBlocks);

  return (
    <div
      className={`specimen-card relative p-3 flex flex-col justify-between ${getBorderColor()} ${
        tab.stage === 'fossilized' ? 'bg-[#ECE7E0]' : ''
      }`}
    >
      {/* Top Header: Index / Specimen Tag & Actions */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-[#1B2A26]/15 mb-2">
          <div className="flex items-center gap-2">
            {getStageBadge()}
            <span className="text-[11px] font-mono text-[#5E6963]">
              ~{tab.ramEstimateMb}MB
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                soundEngine.playClick();
                onTogglePin(tab.id);
              }}
              title={tab.pinned ? 'Unpin Specimen' : 'Pin Specimen (Immune to Rot)'}
              className={`p-1 hover:bg-[#1B2A26]/10 text-[#1B2A26] transition-colors ${
                tab.pinned ? 'text-[#3D5A45] font-bold' : 'opacity-40'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onFocus(tab)}
              title="Open / Focus Tab"
              className="p-1 hover:bg-[#1B2A26]/10 text-[#1B2A26] opacity-60 hover:opacity-100 transition-opacity"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Title & Favicon */}
        <div className="flex items-start gap-2 mb-2">
          {tab.favIconUrl ? (
            <img
              src={tab.favIconUrl}
              alt=""
              className="w-4 h-4 mt-0.5 shrink-0 rounded-xs"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-4 h-4 mt-0.5 shrink-0 border border-[#1B2A26] text-[9px] flex items-center justify-center font-mono">
              T
            </div>
          )}
          <a
            href={tab.url}
            target="_blank"
            rel="noreferrer"
            onClick={() => soundEngine.playClick()}
            className="text-[13px] font-medium leading-snug line-clamp-2 hover:underline text-[#1B2A26]"
          >
            {tab.title}
          </a>
        </div>

        {/* Rot Progress Meter */}
        <div className="flex items-center justify-between font-mono text-[11px] text-[#5E6963] mb-3">
          <span>DECAY: [{meterBlocks}]</span>
          <span className="font-semibold text-[#1B2A26]">{tab.rotScore}%</span>
        </div>

        {/* Roast Callout (If exists or for decaying tabs) */}
        {tab.roast && (
          <div className="p-2 mb-3 bg-[#EFE9E2] border-l-2 border-[#1B2A26] text-[11px] font-mono text-[#1B2A26] italic">
            "{tab.roast}"
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1B2A26]/15">
        <button
          onClick={() => {
            soundEngine.playWater();
            onWater(tab.id);
          }}
          className="brutalist-btn py-1 px-2 text-[11px] flex items-center justify-center gap-1.5 hover:bg-[#3D5A45]/15 text-[#1B2A26]"
        >
          <Droplet className="w-3 h-3 text-[#3D5A45]" />
          WATER (CPR)
        </button>

        <button
          onClick={() => {
            soundEngine.playCremate();
            onCremate(tab.id);
          }}
          className="brutalist-btn py-1 px-2 text-[11px] flex items-center justify-center gap-1.5 bg-[#C84B31]/10 hover:bg-[#C84B31]/25 text-[#C84B31] border-[#C84B31]"
        >
          <Flame className="w-3 h-3 text-[#C84B31]" />
          CREMATE
        </button>
      </div>
    </div>
  );
};
