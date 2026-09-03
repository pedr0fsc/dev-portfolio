import { useState, useMemo, useEffect } from "react";
import { useApp } from "../context/AppContext";
import graphData from "../data/graph.json";
import profileImg from "../assets/profile.jpg";

const ROW_HEIGHT = 52;
const LANE_WIDTH = 20;
const GRAPH_PAD_X = 14;
const GRAPH_PAD_Y = 8;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function timeKey(node) {
  return parseInt(node.year, 10) * 12 + (node.month || 0);
}

function buildCommits(branches) {
  const commits = [];

  branches.forEach((branch, branchIndex) => {
    branch.nodes.forEach((node, nodeIndex) => {
      commits.push({
        ...node,
        id: `${branch.id}-${node.year}-${nodeIndex}`,
        branchId: branch.id,
        branchFrom: branch.from,
        branchLabel: branch.label,
        branchColor: branch.color,
        branchIndex,
        nodeIndex,
        final: Boolean(node.final),
        image: node.image || (branch.id === "main" ? profileImg : null),
      });
    });
  });

  commits.sort((a, b) => {
    const t = timeKey(a) - timeKey(b);
    if (t !== 0) return t;
    if (a.branchIndex !== b.branchIndex) return a.branchIndex - b.branchIndex;
    return a.nodeIndex - b.nodeIndex;
  });

  return commits.map((commit, rowIdx) => ({ ...commit, rowIdx }));
}

function assignLanes(branches) {
  const cols = {};
  let next = 0;
  branches.forEach((b) => {
    cols[b.id] = next++;
  });
  return cols;
}

function laneX(col) {
  return GRAPH_PAD_X + col * LANE_WIDTH + LANE_WIDTH / 2;
}

function rowY(rowIdx) {
  return GRAPH_PAD_Y + rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
}

function forkFromLane(px, forkY, cx, cy) {
  const dx = cx - px;
  const dy = cy - forkY;

  if (Math.abs(dx) < 0.5) {
    return `M ${px} ${forkY} L ${cx} ${cy}`;
  }

  if (Math.abs(dy) < 0.5) {
    return `M ${px} ${forkY} L ${cx} ${cy}`;
  }

  const dir = dx > 0 ? 1 : -1;
  const down = dy > 0 ? 1 : -1;
  let r = LANE_WIDTH / 2;
  r = Math.min(r, Math.abs(dx) - 1, Math.abs(dy) - 1);
  r = Math.max(4, r);

  const sweep = dir === down ? 1 : 0;

  return [
    `M ${px} ${forkY}`,
    `L ${cx - dir * r} ${forkY}`,
    `A ${r} ${r} 0 0 ${sweep} ${cx} ${forkY + down * r}`,
    `L ${cx} ${cy}`,
  ].join(" ");
}

function nearestParentCommit(parentList, childRow) {
  let anchor = parentList[0];
  for (const n of parentList) {
    if (n.rowIdx <= childRow) anchor = n;
    else break;
  }
  return anchor;
}

function forkJoinY(anchorRow, childRow) {
  const py = rowY(anchorRow);
  const cy = rowY(childRow);
  if (childRow === anchorRow) return py;
  return (py + cy) / 2;
}

export function GitGraph() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();
  const [activeId, setActiveId] = useState(null);

  const sectionCopy = graphData.sectionTitle[lang] || graphData.sectionTitle.en;
  const commits = useMemo(() => buildCommits(graphData.branches), []);
  const lanes = useMemo(() => assignLanes(graphData.branches), []);
  const laneCount = Object.keys(lanes).length;
  const graphWidth = GRAPH_PAD_X * 2 + laneCount * LANE_WIDTH;
  const graphHeight = GRAPH_PAD_Y * 2 + commits.length * ROW_HEIGHT;

  const renderSvg = () => {
    const paths = [];
    const byBranch = {};

    commits.forEach((commit) => {
      if (!byBranch[commit.branchId]) byBranch[commit.branchId] = [];
      byBranch[commit.branchId].push(commit);
    });

    const childIds = (parentId) =>
      graphData.branches.filter((b) => b.from === parentId).map((b) => b.id);

    graphData.branches.forEach((branch) => {
      const list = byBranch[branch.id];
      if (!list?.length) return;
      const x = laneX(lanes[branch.id]);
      let yEnd = rowY(list[list.length - 1].rowIdx);

      childIds(branch.id).forEach((id) => {
        const first = byBranch[id]?.[0];
        if (!first) return;
        const anchor = nearestParentCommit(list, first.rowIdx);
        yEnd = Math.max(yEnd, forkJoinY(anchor.rowIdx, first.rowIdx));
      });

      if (yEnd <= rowY(list[0].rowIdx)) return;

      paths.push(
        <line
          key={`spine-${branch.id}`}
          x1={x}
          y1={rowY(list[0].rowIdx)}
          x2={x}
          y2={yEnd}
          stroke={branch.color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      );
    });

    graphData.branches.forEach((branch) => {
      if (!branch.from) return;
      const childList = byBranch[branch.id];
      const parentList = byBranch[branch.from];
      if (!childList?.length || !parentList?.length) return;

      const first = childList[0];
      const anchor = nearestParentCommit(parentList, first.rowIdx);
      const px = laneX(lanes[branch.from]);
      const cx = laneX(lanes[branch.id]);
      const cy = rowY(first.rowIdx);
      const forkY = forkJoinY(anchor.rowIdx, first.rowIdx);

      paths.push(
        <path
          key={`fork-${branch.id}`}
          d={forkFromLane(px, forkY, cx, cy)}
          stroke={branch.color}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    });

    return paths;
  };

  return (
    <section
      id="journey"
      className="py-16 px-3 sm:px-4 md:px-6 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)]"
    >
      <div className="w-full max-w-[1400px] mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-8 text-[var(--text-hero-title)]">
          {sectionCopy}
        </h2>

        <div
          className={`rounded-xl overflow-hidden border ${
            isDark ? "border-slate-800 bg-slate-950/40" : "border-slate-200 bg-white/70"
          }`}
        >
          <div className="overflow-x-auto">
            <div
              className="relative"
              style={{ minWidth: `${graphWidth + (isMobile ? 220 : 420)}px` }}
            >
              {commits.map((commit) => {
                const copy = commit[lang] || commit.en;
                const isActive = activeId === commit.id;
                return (
                  <div
                    key={`bg-${commit.id}`}
                    className="absolute left-0 right-0 transition-colors duration-150"
                    style={{
                      top: `${GRAPH_PAD_Y + commit.rowIdx * ROW_HEIGHT}px`,
                      height: `${ROW_HEIGHT}px`,
                      backgroundColor: isActive
                        ? isDark
                          ? "rgba(148,163,184,0.12)"
                          : "rgba(15,23,42,0.05)"
                        : "transparent",
                    }}
                  />
                );
              })}

              <div className="relative flex">
                <svg
                  className="shrink-0 relative z-10"
                  width={graphWidth}
                  height={graphHeight}
                >
                  <defs>
                    {commits.map((commit) => {
                      const x = laneX(lanes[commit.branchId]);
                      const y = rowY(commit.rowIdx);
                      return (
                        <clipPath key={`clip-${commit.id}`} id={`kraken-clip-${commit.id}`}>
                          <circle cx={x} cy={y} r="7" />
                        </clipPath>
                      );
                    })}
                  </defs>
                  {renderSvg()}
                  {commits.map((commit) => {
                    const x = laneX(lanes[commit.branchId]);
                    const y = rowY(commit.rowIdx);
                    const isActive = activeId === commit.id;
                    const hasImg = Boolean(commit.image);
                    const size = hasImg ? (isActive ? 18 : 16) : isActive ? 12 : 10;

                    return (
                      <g key={`dot-${commit.id}`}>
                        <circle
                          cx={x}
                          cy={y}
                          r={size / 2 + 1.25}
                          fill={isDark ? "#0b1220" : "#ffffff"}
                          stroke={commit.branchColor}
                          strokeWidth="2.25"
                        />
                        {hasImg ? (
                          <image
                            href={commit.image}
                            x={x - 7}
                            y={y - 7}
                            width="14"
                            height="14"
                            clipPath={`url(#kraken-clip-${commit.id})`}
                            preserveAspectRatio="xMidYMid slice"
                          />
                        ) : (
                          <circle
                            cx={x}
                            cy={y}
                            r={Math.max(2.5, size / 2 - 1.5)}
                            fill={commit.branchColor}
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                <div className="flex-1 min-w-0 relative z-10" style={{ height: `${graphHeight}px` }}>
                  {commits.map((commit) => {
                    const copy = commit[lang] || commit.en;
                    const isActive = activeId === commit.id;
                    const label = commit.branchLabel[lang] || commit.branchLabel.en;

                    return (
                      <button
                        key={commit.id}
                        type="button"
                        onMouseEnter={() => setActiveId(commit.id)}
                        onMouseLeave={() => setActiveId(null)}
                        onFocus={() => setActiveId(commit.id)}
                        className="absolute left-0 right-0 flex items-center gap-2.5 px-2 sm:px-3 text-left"
                        style={{
                          top: `${GRAPH_PAD_Y + commit.rowIdx * ROW_HEIGHT}px`,
                          height: `${ROW_HEIGHT}px`,
                        }}
                      >
                        <span
                          className="shrink-0 rounded-full"
                          style={{
                            width: "3px",
                            height: isMobile ? "28px" : "32px",
                            backgroundColor: commit.branchColor,
                          }}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline gap-2 min-w-0">
                            <span
                              className={`text-sm sm:text-[15px] font-semibold truncate ${
                                isDark ? "text-slate-100" : "text-slate-900"
                              }`}
                            >
                              {copy.title}
                            </span>
                            <span
                              className="text-[10px] sm:text-[11px] font-medium shrink-0 uppercase tracking-wide"
                              style={{ color: commit.branchColor }}
                            >
                              {label}
                            </span>
                            <span
                              className={`text-[11px] shrink-0 tabular-nums ${
                                isDark ? "text-slate-500" : "text-slate-400"
                              }`}
                            >
                              {commit.year}
                            </span>
                          </span>
                          {!isMobile && (
                            <span
                              className={`block text-xs truncate mt-0.5 ${
                                isActive
                                  ? isDark
                                    ? "text-slate-300"
                                    : "text-slate-600"
                                  : isDark
                                    ? "text-slate-500"
                                    : "text-slate-500"
                              }`}
                            >
                              {copy.description}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
