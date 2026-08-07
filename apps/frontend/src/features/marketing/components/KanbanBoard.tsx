import { memo } from "react";
import { motion } from "framer-motion";

const CARDS = [
  {
    id: 1, col: "backlog", title: "Auth system refactor", priority: "high",
    assignee: "CK", progress: 0, tags: ["backend"], comments: 4, attachments: 2,
  },
  {
    id: 2, col: "backlog", title: "Design token migration", priority: "medium",
    assignee: "RS", progress: 0, tags: ["design"], comments: 2, attachments: 0,
  },
  {
    id: 3, col: "todo", title: "Kanban drag & drop", priority: "high",
    assignee: "CK", progress: 15, tags: ["frontend"], comments: 7, attachments: 1,
  },
  {
    id: 4, col: "todo", title: "Redis caching layer", priority: "critical",
    assignee: "RS", progress: 0, tags: ["backend", "perf"], comments: 3, attachments: 0,
  },
  {
    id: 5, col: "inprogress", title: "3D landing page", priority: "critical",
    assignee: "CK", progress: 78, tags: ["frontend", "3d"], comments: 12, attachments: 5,
  },
  {
    id: 6, col: "inprogress", title: "WebSocket presence", priority: "high",
    assignee: "RS", progress: 45, tags: ["realtime"], comments: 6, attachments: 2,
  },
  {
    id: 7, col: "review", title: "API rate limiting", priority: "medium",
    assignee: "CK", progress: 100, tags: ["security"], comments: 9, attachments: 3,
  },
  {
    id: 8, col: "done", title: "CI/CD pipeline", priority: "high",
    assignee: "RS", progress: 100, tags: ["devops"], comments: 5, attachments: 1,
  },
  {
    id: 9, col: "done", title: "Dark mode system", priority: "low",
    assignee: "CK", progress: 100, tags: ["design"], comments: 3, attachments: 0,
  },
];

const COLUMNS = [
  { id: "backlog", label: "Backlog", color: "#6b7280" },
  { id: "todo", label: "Todo", color: "#d4af37" },
  { id: "inprogress", label: "In Progress", color: "#3b82f6" },
  { id: "review", label: "Review", color: "#8b5cf6" },
  { id: "done", label: "Done", color: "#10b981" },
];

const PRIORITY_CONFIG: Record<string, { color: string; label: string }> = {
  critical: { color: "#ef4444", label: "Critical" },
  high: { color: "#f97316", label: "High" },
  medium: { color: "#d4af37", label: "Medium" },
  low: { color: "#6b7280", label: "Low" },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: {
      delay: i * 0.08,
      type: "spring" as const,
      stiffness: 220,
      damping: 20,
    },
  }),
};

const TaskCard = memo(({ card, index }: { card: typeof CARDS[0]; index: number }) => {
  const p = PRIORITY_CONFIG[card.priority];

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{
        scale: 1.025,
        rotateX: -2,
        rotateY: 3,
        z: 20,
        transition: { duration: 0.2 },
      }}
      style={{ transformStyle: "preserve-3d", perspective: 600 }}
      className="group relative bg-white/[0.04] border border-white/10 rounded-xl p-3.5 cursor-pointer
                 hover:border-[#d4af37]/40 hover:bg-white/[0.07] transition-colors duration-200
                 shadow-[0_4px_20px_rgba(0,0,0,0.6)]"
    >
      {/* Priority indicator bar */}
      <div
        className="absolute top-0 left-0 w-1 h-full rounded-l-xl"
        style={{ background: p.color }}
      />

      <div className="pl-1 space-y-2.5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t) => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-md bg-white/5 text-[#9a938a]">
              {t}
            </span>
          ))}
        </div>

        {/* Title */}
        <p className="text-[12px] font-semibold text-[#f3efe6] leading-tight">{card.title}</p>

        {/* Priority badge */}
        <motion.span
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.08 + 0.3 }}
          className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
          style={{ background: `${p.color}18`, color: p.color, border: `1px solid ${p.color}40` }}
        >
          <span className="w-1 h-1 rounded-full" style={{ background: p.color }} />
          {p.label}
        </motion.span>

        {/* Progress bar */}
        {card.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-[9px] text-[#9a938a]">Progress</span>
              <span className="text-[9px] font-bold text-[#d4af37]">{card.progress}%</span>
            </div>
            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: card.progress === 100 ? "#10b981" : "#d4af37" }}
                initial={{ width: 0 }}
                animate={{ width: `${card.progress}%` }}
                transition={{ delay: index * 0.08 + 0.4, duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Footer — assignee, comments, attachments */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5">
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 + 0.5 }}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-[#1a1206]"
              style={{ background: "linear-gradient(135deg, #f3dfa0, #d4af37)" }}
            >
              {card.assignee}
            </motion.div>
          </div>
          <div className="flex items-center gap-2.5 text-[#9a938a]">
            {card.comments > 0 && (
              <span className="flex items-center gap-0.5 text-[9px]">
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
                  <path d="M6 0C2.69 0 0 2.24 0 5c0 1.6.82 3.01 2.1 3.93L2 12l3.5-1.75C5.65 10.41 5.82 10.5 6 10.5 9.31 10.5 12 8.26 12 5.5S9.31 0 6 0z"/>
                </svg>
                {card.comments}
              </span>
            )}
            {card.attachments > 0 && (
              <span className="flex items-center gap-0.5 text-[9px]">
                <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 fill-current">
                  <path d="M10.5 4.5L5 10a3 3 0 01-4.24-4.24L6.5 0l.88.88L1.64 6.64a2 2 0 002.83 2.83L9.61 4.33a1 1 0 00-1.41-1.41L3.54 7.58a0 0 0 00.71.71L8.9 3.63l.88.88L4.24 10a1 1 0 01-1.41-1.41L8.5 2.82A2 2 0 0111.32 5.5L6.5 10.5"/>
                </svg>
                {card.attachments}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

TaskCard.displayName = "TaskCard";

export const KanbanBoard = memo(() => {
  return (
    <div className="flex gap-3 w-full overflow-x-auto pb-2 select-none" style={{ minWidth: 0 }}>
      {COLUMNS.map((col) => {
        const colCards = CARDS.filter((c) => c.col === col.id);
        return (
          <motion.div
            key={col.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: COLUMNS.indexOf(col) * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 min-w-[160px] max-w-[220px]"
          >
            {/* Column header */}
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#9a938a]">
                {col.label}
              </span>
              <span
                className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-full"
                style={{ background: `${col.color}20`, color: col.color }}
              >
                {colCards.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {colCards.map((card, i) => (
                <TaskCard key={card.id} card={card} index={i + COLUMNS.indexOf(col)} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";
