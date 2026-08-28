import React from 'react';
import { Sparkles, ArrowRight, Home } from 'lucide-react';

interface NotFoundPageProps {
  onNavigate: (path: string) => void;
  requestedPath?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onNavigate, requestedPath = '' }) => {
  const cleanUsername = requestedPath.replace(/^\//, '').trim();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FFFDF5] text-neutral-900">
      <div className="w-full max-w-md rounded-3xl border-2 border-black bg-white p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD600] text-black mb-4 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles className="h-8 w-8" />
        </div>

        {cleanUsername && (
          <span className="rounded-full bg-[#FFFDF5] px-3.5 py-1 text-xs font-mono font-black text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            /{cleanUsername}
          </span>
        )}

        <h1 className="text-3xl font-black text-[#1A1A1A] mt-4">
          Page Not Found
        </h1>

        <p className="text-xs font-bold text-slate-600 mt-2 mb-6 leading-relaxed">
          {cleanUsername ? (
            <>
              The creator handle <span className="font-black text-black">@{cleanUsername}</span> is not registered yet.
              You can claim it right now!
            </>
          ) : (
            'The requested page or creator profile could not be found.'
          )}
        </p>

        <div className="space-y-3">
          {cleanUsername && (
            <button
              id="notfound-claim-btn"
              onClick={() => onNavigate(`/signup?username=${encodeURIComponent(cleanUsername)}`)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD600] border-2 border-black py-3 text-xs font-black uppercase tracking-wider text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFE033] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <span>Claim @{cleanUsername} on OneLink</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          <button
            id="notfound-home-btn"
            onClick={() => onNavigate('/')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-white py-2.5 text-xs font-black text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-50 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
          >
            <Home className="h-4 w-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
