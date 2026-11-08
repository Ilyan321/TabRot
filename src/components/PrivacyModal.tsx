import type { FC } from 'react';
import { ShieldCheck, Cookie, Terminal, Mail, ExternalLink, X, AlertTriangle, Bug } from 'lucide-react';
import { soundEngine } from '../engine/soundEngine';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstTime?: boolean;
}

export const PrivacyModal: FC<PrivacyModalProps> = ({ isOpen, onClose, isFirstTime = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A26]/75 backdrop-blur-xs font-mono">
      <div className="w-full max-w-2xl bg-[#E6DFD5] border-2 border-[#1B2A26] shadow-[6px_6px_0px_#1B2A26] flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-3.5 bg-[#DDD5C7] border-b-2 border-[#1B2A26] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#2E4B37]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#1B2A26]">
              {isFirstTime ? 'WELCOME TO TABROT — FIRST TIME ONBOARDING' : 'TRANSPARENCY, PRIVACY & LEGAL MANIFEST'}
            </span>
          </div>
          {!isFirstTime && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="p-1 hover:bg-[#1B2A26]/10 text-[#1B2A26] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-[#1B2A26] leading-relaxed">
          
          {/* Card 1: Zero Tracker Guarantee */}
          <div className="p-3 border border-[#1B2A26] bg-[#DDD5C7] space-y-1.5 shadow-[2px_2px_0px_#1B2A26]">
            <div className="flex items-center gap-1.5 font-bold text-[#2E4B37] uppercase text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% Local-First & Zero Telemetry
            </div>
            <p className="text-[11px] text-[#536059]">
              TabRot does not harvest, store, or sell personal identifiable information (PII). There are no Google Analytics, no tracking pixels, and no cloud databases. All tab rot stats and cemetery records live strictly on your device.
            </p>
          </div>

          {/* Card 2: Cookie Policy */}
          <div className="p-3 border border-[#1B2A26] bg-[#DDD5C7] space-y-1.5 shadow-[2px_2px_0px_#1B2A26]">
            <div className="flex items-center gap-1.5 font-bold text-[#A67C2E] uppercase text-[11px]">
              <Cookie className="w-3.5 h-3.5" />
              Zero Cookie Guarantee
            </div>
            <p className="text-[11px] text-[#536059]">
              TabRot uses <strong>0 tracking cookies</strong>. Under GDPR and the ePrivacy Directive, no intrusive cookie consent banner is needed because no tracking identifiers are ever written to your browser.
            </p>
          </div>

          {/* Card 3: Chrome Permissions Scope */}
          <div className="p-3 border border-[#1B2A26] bg-[#DDD5C7] space-y-2 shadow-[2px_2px_0px_#1B2A26]">
            <div className="flex items-center gap-1.5 font-bold text-[#1B2A26] uppercase text-[11px]">
              <Terminal className="w-3.5 h-3.5" />
              Manifest V3 Permissions Transparency
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-[#536059]">
              <li>
                <strong>tabs:</strong> Used solely to inspect tab titles, URLs, and age, switch active tabs, and close tabs when you click "Cremate".
              </li>
              <li>
                <strong>scripting:</strong> Injects an isolated query into tabs to check <code className="bg-[#D4CBBC] px-1">window.performance.memory</code> for live RAM estimates. It never reads form inputs, keystrokes, or page content.
              </li>
              <li>
                <strong>storage:</strong> Persists your saved settings and cemetery graveyard history locally.
              </li>
            </ul>
          </div>

          {/* Card 4: Cremation Warning */}
          <div className="p-3 border border-[#B53F28] bg-[#B53F28]/10 space-y-1 text-[#B53F28]">
            <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
              <AlertTriangle className="w-3.5 h-3.5" />
              Cremation Terms of Service
            </div>
            <p className="text-[10px]">
              Triggering "Cremate" instructs Chrome to close the tab. Do not cremate tabs with unsaved documents, active coding forms, or shopping checkouts. The author is not liable for data loss from manually triggered tab closures.
            </p>
          </div>

          {/* Developer Contact & Bug Reporting */}
          <div className="pt-2 border-t border-[#1B2A26]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px]">
            <div>
              <span className="font-bold text-[#1B2A26]">DEVELOPER:</span> Ilyan Khan
            </div>
            <div className="flex items-center gap-3">
              <a
                href="mailto:ilyaankhan342@gmail.com"
                className="flex items-center gap-1 font-bold text-[#2E4B37] hover:underline"
              >
                <Mail className="w-3.5 h-3.5" />
                ilyaankhan342@gmail.com
              </a>
              <a
                href="https://github.com/Ilyan321/TabRot/issues"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-bold text-[#1B2A26] hover:underline"
              >
                <Bug className="w-3.5 h-3.5" />
                Report Bug / Vulnerability
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#DDD5C7] border-t-2 border-[#1B2A26] flex items-center justify-between shrink-0">
          <span className="text-[10px] text-[#536059]">
            {isFirstTime ? 'Please review & acknowledge to initialize TabRot' : 'Local-first architecture'}
          </span>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            style={{ backgroundColor: '#1B2A26', color: '#E6DFD5' }}
            className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase border-2 border-[#1B2A26] shadow-[2px_2px_0px_#1B2A26] hover:bg-[#2A3F39] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            {isFirstTime ? 'I UNDERSTAND & ENTER TERRARIUM' : 'ACKNOWLEDGE & CLOSE'}
          </button>
        </div>
      </div>
    </div>
  );
};
