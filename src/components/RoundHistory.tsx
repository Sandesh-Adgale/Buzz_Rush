import React, { useState } from 'react';
import { History, Download, Printer, ChevronDown, ChevronUp, Trophy, Clock } from 'lucide-react';
import { RoundHistoryItem } from '../types';

interface RoundHistoryProps {
  history: RoundHistoryItem[];
  roomCode: string;
}

export const RoundHistory: React.FC<RoundHistoryProps> = ({ history, roomCode }) => {
  const [expandedRounds, setExpandedRounds] = useState<Record<number, boolean>>({
    // By default expand the latest round
    [history[history.length - 1]?.roundNumber || 1]: true,
  });

  const toggleRound = (roundNum: number) => {
    setExpandedRounds((prev) => ({
      ...prev,
      [roundNum]: !prev[roundNum],
    }));
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;

    const headers = ['Round Number', 'Timestamp', 'Rank', 'Team Name', 'Split Time (ms)'];
    const rows: string[] = [headers.join(',')];

    history.forEach((round) => {
      const dateStr = new Date(round.timestamp).toISOString();
      round.buzzOrder.forEach((entry) => {
        rows.push(
          [
            round.roundNumber,
            `"${dateStr}"`,
            entry.rank,
            `"${entry.teamName.replace(/"/g, '""')}"`,
            entry.diffMs,
          ].join(',')
        );
      });
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `buzzrush-room-${roomCode}-history.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with Export Buttons */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-cyan-400" />
          <h3 className="font-display font-bold text-base tracking-wide uppercase text-white">
            Round History ({history.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={history.length === 0}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            title="Export CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPDF}
            disabled={history.length === 0}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition flex items-center gap-1.5 shadow-sm"
            title="Print / Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print/PDF</span>
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-white/10 bg-black/20">
          <History className="w-8 h-8 text-slate-600 mb-2" />
          <p className="font-display text-xs font-semibold uppercase tracking-wider text-slate-400">
            No Completed Rounds Yet
          </p>
          <p className="text-[11px] text-slate-500 mt-1 max-w-[200px]">
            Once a round finishes and a new round begins, historical records will be logged here.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-1">
          {/* Show latest round first */}
          {[...history].reverse().map((round) => {
            const isExpanded = !!expandedRounds[round.roundNumber];
            const roundTime = new Date(round.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={round.roundNumber}
                className="rounded-xl border border-white/10 bg-slate-900/70 backdrop-blur-md overflow-hidden transition"
              >
                {/* Round Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleRound(round.roundNumber)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/5 transition text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-display font-extrabold text-sm text-cyan-400">
                      Round {round.roundNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {roundTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-white text-xs">{round.winnerTeam}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </button>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-3.5 pb-3 pt-1 border-t border-white/5 bg-black/20 space-y-1.5">
                    {round.buzzOrder.length === 0 ? (
                      <div className="text-xs text-slate-500 py-1 italic">No buzzes recorded</div>
                    ) : (
                      round.buzzOrder.map((entry) => (
                        <div
                          key={entry.teamId}
                          className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-4 text-center font-bold text-slate-400 font-mono">
                              {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `${entry.rank}.`}
                            </span>
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: entry.color.hex }}
                            />
                            <span className="font-semibold text-slate-200">{entry.teamName}</span>
                          </div>
                          <span className="font-mono text-cyan-300 font-bold">
                            {entry.diffMs === 0 ? '0 ms' : `+${entry.diffMs} ms`}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
