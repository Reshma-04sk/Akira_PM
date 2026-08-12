import React, { useState, useEffect } from "react";

interface CardItem {
  id: string;
  title: string;
  tag: string;
  isHigh?: boolean;
  avatar: string;
  pts: number;
}

export const ProductDemoBoard: React.FC = () => {
  const [columns, setColumns] = useState<{ [key: string]: CardItem[] }>({
    backlog: [
      { id: "AK-124", title: "Define API rate-limit policy", tag: "security", avatar: "JT", pts: 3 },
      { id: "AK-127", title: "Redesign onboarding empty state", tag: "design", avatar: "RS", pts: 2 },
      { id: "AK-131", title: "Add webhook retry strategy", tag: "infra", avatar: "AK", pts: 5 },
    ],
    inProgress: [
      { id: "AK-118", title: "Realtime collaboration cursors", tag: "high", isHigh: true, avatar: "MN", pts: 5 },
      { id: "AK-121", title: "Command palette navigation", tag: "core", avatar: "RS", pts: 3 },
      { id: "AK-116", title: "Sprint velocity calculation", tag: "core", avatar: "AK", pts: 2 },
    ],
    review: [
      { id: "AK-109", title: "Workspace permission model", tag: "security", avatar: "JT", pts: 5 },
      { id: "AK-111", title: "AI standup summary", tag: "ai", isHigh: true, avatar: "MN", pts: 3 },
    ],
    shipped: [
      { id: "AK-097", title: "Keyboard-first navigation", tag: "core", avatar: "RS", pts: 2 },
      { id: "AK-103", title: "Sprint analytics dashboard", tag: "analytics", avatar: "AK", pts: 8 },
    ],
  });

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [draggedFromCol, setDraggedFromCol] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  const [bumpCol, setBumpCol] = useState<string | null>(null);

  // Simulated live workflow transition: move AK-121 to Review after initial view
  useEffect(() => {
    const timer = setTimeout(() => {
      setColumns((prev) => {
        const inProg = [...prev.inProgress];
        const cardIdx = inProg.findIndex((c) => c.id === "AK-121");
        if (cardIdx !== -1) {
          const [card] = inProg.splice(cardIdx, 1);
          return {
            ...prev,
            inProgress: inProg,
            review: [card, ...prev.review],
          };
        }
        return prev;
      });
      setBumpCol("review");
      setTimeout(() => setBumpCol(null), 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const handleDragStart = (cardId: string, colKey: string) => {
    setDraggedCardId(cardId);
    setDraggedFromCol(colKey);
  };

  const handleDragOver = (e: React.DragEvent, colKey: string) => {
    e.preventDefault();
    setDragOverCol(colKey);
  };

  const handleDrop = (colKey: string) => {
    if (!draggedCardId || !draggedFromCol || draggedFromCol === colKey) {
      setDragOverCol(null);
      return;
    }

    const sourceCards = [...columns[draggedFromCol]];
    const targetCards = [...columns[colKey]];
    const cardIndex = sourceCards.findIndex((c) => c.id === draggedCardId);

    if (cardIndex !== -1) {
      const [movedCard] = sourceCards.splice(cardIndex, 1);
      targetCards.push(movedCard);

      setColumns({
        ...columns,
        [draggedFromCol]: sourceCards,
        [colKey]: targetCards,
      });

      setBumpCol(colKey);
      setTimeout(() => setBumpCol(null), 250);
    }

    setDraggedCardId(null);
    setDraggedFromCol(null);
    setDragOverCol(null);
  };

  return (
    <section id="board" className="w-full relative z-20 py-24 select-none">
      <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="font-mono text-xs text-[#ff4d2e] uppercase tracking-[3px] mb-3">
            Act II · Clarity in Motion
          </div>
          <h2 className="font-serif italic text-3xl md:text-5xl text-[#f3f1ec] font-normal mb-3">
            Every ticket moving in real time.
          </h2>
          <p className="text-[#8b8a90] font-mono text-xs tracking-wider">
            drag any card to simulate live velocity
          </p>
        </div>

        {/* 4-Column Board Wrapper */}
        <div className="relative bg-[#131316] border border-[#26262b] rounded-2xl p-5 md:p-6 shadow-2xl overflow-hidden">
          {/* Collaborative Cursor 1: RS · Reviewing */}
          <div className="absolute top-[18%] right-[32%] z-30 pointer-events-none flex items-center gap-1.5 bg-[#ff4d2e] text-[#1a0a06] text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg animate-bounce">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1a0a06]" />
            RS · Reviewing
          </div>

          {/* Collaborative Cursor 2: MN · Editing */}
          <div className="absolute top-[48%] left-[36%] z-30 pointer-events-none flex items-center gap-1.5 bg-white text-black text-[10px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d2e]" />
            MN · Editing
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Column Render Helper */}
            {[
              { key: "backlog", label: "Backlog" },
              { key: "inProgress", label: "In Progress" },
              { key: "review", label: "Review" },
              { key: "shipped", label: "Shipped" },
            ].map((colDef) => {
              const cards = columns[colDef.key] || [];
              const isOver = dragOverCol === colDef.key;
              const isBump = bumpCol === colDef.key;

              return (
                <div
                  key={colDef.key}
                  onDragOver={(e) => handleDragOver(e, colDef.key)}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => handleDrop(colDef.key)}
                  className={`bg-[#1b1b1f] rounded-xl p-3.5 min-h-[360px] flex flex-col justify-between transition-all ${
                    isOver
                      ? "outline outline-1 outline-dashed outline-[#ff4d2e] outline-offset-4"
                      : ""
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between text-xs font-semibold text-[#8b8a90] uppercase tracking-wider mb-4 px-0.5">
                      <span>{colDef.label}</span>
                      <span
                        className={`bg-[#26262b] text-[#f3f1ec] text-[11px] px-2 py-0.5 rounded-full font-mono transition-transform duration-250 ${
                          isBump ? "scale-135 bg-[#ff4d2e] text-[#1a0a06]" : ""
                        }`}
                      >
                        {cards.length}
                      </span>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-3">
                      {cards.map((card) => (
                        <div
                          key={card.id}
                          draggable
                          onDragStart={() => handleDragStart(card.id, colDef.key)}
                          className={`bg-[#131316] border border-[#26262b] rounded-lg p-3.5 cursor-grab active:cursor-grabbing hover:border-white/20 transition-all ${
                            draggedCardId === card.id ? "opacity-30" : ""
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-[11px] text-[#ff4d2e]">
                              {card.id}
                            </span>
                            <span className="font-mono text-[10px] text-[#8b8a90]">
                              {card.pts} pts
                            </span>
                          </div>

                          <p className="text-[13.5px] text-[#f3f1ec] leading-snug mb-3 font-normal">
                            {card.title}
                          </p>

                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                                card.isHigh
                                  ? "bg-[#ff4d2e]/12 text-[#ff4d2e]"
                                  : "bg-white/6 text-[#8b8a90]"
                              }`}
                            >
                              {card.tag}
                            </span>
                            <div className="w-5 h-5 rounded-full bg-[#ff4d2e]/14 text-[#ff4d2e] text-[9px] font-semibold flex items-center justify-center font-sans">
                              {card.avatar}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProductDemoBoard;
