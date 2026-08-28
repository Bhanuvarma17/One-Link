import React from 'react';
import { X, Download, Share2, Copy, ExternalLink, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  username: string;
  displayName: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  url,
  username,
  displayName,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  // Use a reliable, fast public QR generator image
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    url
  )}&format=svg&qzone=1`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `${username}-onelink-qr.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="qr-modal-container"
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-neutral-200 text-center"
      >
        {/* Close Button */}
        <button
          id="qr-modal-close-btn"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-3 border border-indigo-100">
            <Share2 className="h-6 w-6" />
          </div>

          <h3 className="text-lg font-bold text-neutral-900">Share Your OneLink</h3>
          <p className="text-xs text-neutral-500 mt-1 mb-4">
            Scan with any phone camera to view <span className="font-semibold text-neutral-800">@{username}</span>
          </p>

          {/* QR Card */}
          <div className="rounded-xl border-2 border-neutral-100 bg-neutral-50 p-4 shadow-inner mb-4 flex flex-col items-center">
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${displayName}`}
              className="h-48 w-48 rounded-lg bg-white p-2 shadow-xs"
            />
            <span className="text-[11px] font-mono text-neutral-600 mt-3 truncate max-w-[240px]">
              {url}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <button
              id="qr-copy-url-btn"
              onClick={handleCopy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white py-2.5 px-3 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 shadow-2xs transition-colors"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-neutral-500" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>

            <button
              id="qr-download-btn"
              onClick={handleDownload}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-2.5 px-3 text-xs font-semibold text-white hover:bg-neutral-800 shadow-2xs transition-colors"
            >
              <Download className="h-4 w-4" />
              Download QR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
