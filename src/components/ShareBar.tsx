import React, { useState } from 'react';
import { Copy, ExternalLink, QrCode, Check, Globe, Sparkles } from 'lucide-react';
import { User } from '../types';
import { QRCodeModal } from './QRCodeModal';
import confetti from 'canvas-confetti';

interface ShareBarProps {
  user: User;
  onNavigate: (path: string) => void;
}

export const ShareBar: React.FC<ShareBarProps> = ({ user, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const publicUrl = `${window.location.origin}/${user.username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      confetti({
        particleCount: 45,
        spread: 65,
        origin: { y: 0.2 },
      });
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white px-5 py-4 text-[#1A1A1A] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFD600] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-wider text-slate-500 uppercase">
                Your Public OneLink URL
              </span>
              <span className="inline-flex items-center rounded-md bg-[#10B981] px-1.5 py-0.2 text-[10px] font-black text-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                LIVE
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm sm:text-base font-black text-[#1A1A1A] font-mono">
              <span className="text-slate-400">{window.location.host}/</span>
              <span className="text-[#1A1A1A] bg-[#FFD600]/40 px-1 rounded">{user.username}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="sharebar-copy-btn"
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-xl bg-[#FFD600] px-4 py-2.5 text-xs font-black text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-emerald-800" />
                <span className="text-emerald-950 font-black">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-black" />
                <span>Copy URL</span>
              </>
            )}
          </button>

          <button
            id="sharebar-qr-btn"
            onClick={() => setShowQR(true)}
            className="flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-xs font-black text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <QrCode className="h-4 w-4 text-black" />
            <span>QR Code</span>
          </button>

          <button
            id="sharebar-view-btn"
            onClick={() => onNavigate(`/${user.username}`)}
            className="flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-800 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <span>Live View</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <QRCodeModal
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        url={publicUrl}
        username={user.username}
        displayName={user.displayName}
      />
    </>
  );
};

