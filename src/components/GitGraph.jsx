import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import graphData from "../data/graph.json";

function buildTimeline(branches) {
  const allNodes = [];

  branches.forEach((branch, branchIndex) => {
    branch.nodes.forEach((node, nodeIndex) => {
      allNodes.push({
        ...node,
        branchId: branch.id,
        branchLabel: branch.label,
        branchColor: branch.color,
        branchIndex,
        isFirstInBranch: nodeIndex === 0,
        isLastInBranch: nodeIndex === branch.nodes.length - 1,
      });
    });
  });

  // Sort chronologically by year, then by branch index for stable ordering
  allNodes.sort((a, b) => {
    const yearDiff = parseInt(a.year) - parseInt(b.year);
    if (yearDiff !== 0) return yearDiff;
    return a.branchIndex - b.branchIndex;
  });

  return allNodes;
}

/**
 * Commit dot — the "ball" on the graph line.
 * Expands into a mini card on hover / tap.
 */
function CommitNode({ node, lang, isDark, side, branchColumns, totalColumns }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const copy = node[lang] || node["en"];
  const colIndex = branchColumns[node.branchId];

  return (
    <div
      className="group relative flex items-start gap-0"
      style={{ minHeight: "80px" }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      onTouchStart={() => setIsExpanded((v) => !v)}
    >
      {/* ── Left-side card (even rows) ── */}
      {side === "left" && (
        <div className="flex-1 flex justify-end pr-4 md:pr-6">
          <NodeCard
            copy={copy}
            node={node}
            isDark={isDark}
            isExpanded={isExpanded}
            align="right"
            lang={lang}
          />
        </div>
      )}
      {side === "right" && <div className="flex-1" />}

      {/* ── Graph column (dots + lines) ── */}
      <div
        className="relative flex flex-col items-center"
        style={{ width: `${totalColumns * 28 + 20}px` }}
      >
        {/* Vertical line — main trunk */}
        <div
          className="absolute top-0 bottom-0 w-0.5 opacity-40"
          style={{
            left: `${0 * 28 + 10}px`,
            backgroundColor: graphData.branches[0]?.color || "#3b82f6",
          }}
        />

        {/* Vertical line for this branch */}
        {colIndex > 0 && (
          <div
            className="absolute top-0 bottom-0 w-0.5 opacity-25"
            style={{
              left: `${colIndex * 28 + 10}px`,
              backgroundColor: node.branchColor,
            }}
          />
        )}

        {/* Horizontal connector from main trunk to branch column */}
        {colIndex > 0 && (
          <div
            className="absolute h-0.5 opacity-30"
            style={{
              top: "18px",
              left: `${0 * 28 + 10}px`,
              width: `${colIndex * 28}px`,
              backgroundColor: node.branchColor,
            }}
          />
        )}

        {/* The commit dot */}
        <div
          className="relative z-10 mt-2 rounded-full border-[3px] transition-all duration-300 cursor-pointer shrink-0"
          style={{
            width: isExpanded ? "18px" : "14px",
            height: isExpanded ? "18px" : "14px",
            borderColor: node.branchColor,
            backgroundColor: isExpanded
              ? node.branchColor
              : isDark
              ? "#0f172a"
              : "#f8fafc",
            marginLeft: `${colIndex * 28}px`,
            boxShadow: isExpanded
              ? `0 0 12px ${node.branchColor}66`
              : "none",
          }}
        />

        {/* Year label under the dot */}
        <span
          className="mt-1 text-[10px] font-bold tracking-wide opacity-60 whitespace-nowrap"
          style={{
            marginLeft: `${colIndex * 28}px`,
            color: isDark ? "#94a3b8" : "#64748b",
          }}
        >
          {node.year}
        </span>
      </div>

      {/* ── Right-side card (odd rows) ── */}
      {side === "right" && (
        <div className="flex-1 flex justify-start pl-4 md:pl-6">
          <NodeCard
            copy={copy}
            node={node}
            isDark={isDark}
            isExpanded={isExpanded}
            align="left"
            lang={lang}
          />
        </div>
      )}
      {side === "left" && <div className="flex-1" />}
    </div>
  );
}

/**
 * The expandable mini-card that shows when hovering a commit dot.
 */
function NodeCard({ copy, node, isDark, isExpanded, align, lang }) {
  return (
    <div
      className={`
        transition-all duration-300 ease-out rounded-xl overflow-hidden
        border shadow-lg max-w-xs w-full
        ${isExpanded
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-2 scale-95 pointer-events-none"
        }
        ${isDark
          ? "bg-slate-800/90 border-slate-700/60 backdrop-blur-sm"
          : "bg-white/90 border-slate-200/80 backdrop-blur-sm"
        }
      `}
      style={{
        maxHeight: isExpanded ? "400px" : "0px",
      }}
    >
      {/* Banner image */}
      {node.banner && (
        <img
          src={node.banner}
          alt={copy.title}
          className="w-full h-28 object-cover"
        />
      )}

      <div className="p-3">
        {/* Branch badge */}
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="inline-block w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: node.branchColor }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider opacity-70"
            style={{ color: node.branchColor }}
          >
            {node.branchLabel[lang] || node.branchLabel["en"]}
          </span>
          <span className={`text-[10px] ml-auto ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {node.age !== undefined && node.age !== null
              ? `${node.age}y`
              : ""}
          </span>
        </div>

        <h4
          className={`text-sm font-bold leading-snug ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {copy.title}
        </h4>
        <p
          className={`text-xs mt-1 leading-relaxed ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {copy.description}
        </p>
      </div>
    </div>
  );
}

/**
 * Git-graph timeline section.
 * Reads graph.json and renders a vertical branch-aware timeline.
 */
export function GitGraph() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const sectionCopy = graphData.sectionTitle[lang] || graphData.sectionTitle["en"];

  // Assign each branch a column index (0 = main trunk, 1+  = branches)
  const branchColumns = useMemo(() => {
    const cols = {};
    graphData.branches.forEach((b, i) => {
      cols[b.id] = i;
    });
    return cols;
  }, []);

  const totalColumns = graphData.branches.length;

  const timeline = useMemo(
    () => buildTimeline(graphData.branches),
    []
  );

  return (
    <section
      id="journey"
      className="py-16 px-4 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)]"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section title */}
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 text-[var(--text-hero-title)]">
          {sectionCopy}
        </h2>

        {/* Branch legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {graphData.branches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: branch.color }}
              />
              <span
                className={`text-xs font-medium ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {branch.label[lang] || branch.label["en"]}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          {timeline.map((node, idx) => (
            <CommitNode
              key={`${node.branchId}-${node.year}-${idx}`}
              node={node}
              lang={lang}
              isDark={isDark}
              side={idx % 2 === 0 ? "left" : "right"}
              branchColumns={branchColumns}
              totalColumns={totalColumns}
            />
          ))}

          {/* Terminal dot at the bottom */}
          <div className="flex justify-center pt-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: graphData.branches[0]?.color || "#3b82f6",
                boxShadow: `0 0 10px ${graphData.branches[0]?.color || "#3b82f6"}44`,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
