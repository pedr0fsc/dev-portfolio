import { useState, useMemo, useEffect } from "react";
import { X } from "lucide-react";
import { useApp } from "../context/AppContext";
import graphData from "../data/graph.json";

const DESKTOP_ROW_HEIGHT = 60;
const DESKTOP_COL_WIDTH = 45;

const MOBILE_ROW_HEIGHT = 68;
const MOBILE_COL_WIDTH = 28;
const MOBILE_START_X = 24;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function buildTimeline(branches) {
  const allNodes = [];

  branches.forEach((branch, branchIndex) => {
    branch.nodes.forEach((node, nodeIndex) => {
      allNodes.push({
        ...node,
        id: `${branch.id}-${node.year}-${nodeIndex}`,
        branchId: branch.id,
        branchFrom: branch.from || (branch.id === "main" ? null : "main"),
        branchLabel: branch.label,
        branchColor: branch.color,
        branchIndex,
        final: Boolean(node.final),
        image: node.image || null,
        isFirstInBranch: nodeIndex === 0,
        isLastInBranch: nodeIndex === branch.nodes.length - 1,
      });
    });
  });

  allNodes.sort((a, b) => {
    const yearDiff = parseInt(a.year, 10) - parseInt(b.year, 10);
    if (yearDiff !== 0) return yearDiff;
    return a.branchIndex - b.branchIndex;
  });

  return allNodes;
}

export function GitGraph() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const isMobile = useIsMobile();
  const [selectedMobileNode, setSelectedMobileNode] = useState(null);

  const sectionCopy = graphData.sectionTitle[lang] || graphData.sectionTitle.en;

  // Desktop: Upside-down tree branch column mapping
  const desktopBranchColumns = useMemo(() => {
    const cols = { main: 0 };
    let nextRight = 1;
    let nextLeft = -1;

    // First pass: direct children of main
    graphData.branches.forEach((b) => {
      if (b.id === "main") return;
      const parentId = b.from || "main";
      if (parentId === "main") {
        if (Math.abs(nextRight) <= Math.abs(nextLeft)) {
          cols[b.id] = nextRight++;
        } else {
          cols[b.id] = nextLeft--;
        }
      }
    });

    // Second pass: sub-branches (children of other branches)
    graphData.branches.forEach((b) => {
      if (b.id === "main" || cols[b.id] !== undefined) return;
      const parentId = b.from || "main";
      const parentCol = cols[parentId] ?? 0;

      if (parentCol >= 0) {
        cols[b.id] = nextRight++;
      } else {
        cols[b.id] = nextLeft--;
      }
    });

    return cols;
  }, []);

  // Mobile: Main is on the far-left (0), other branches fan out to the right (1, 2, 3...)
  const mobileBranchColumns = useMemo(() => {
    const cols = { main: 0 };
    let offset = 1;

    graphData.branches.forEach((b) => {
      if (b.id !== "main") {
        cols[b.id] = offset++;
      }
    });

    return cols;
  }, []);

  const timeline = useMemo(() => buildTimeline(graphData.branches), []);

  // Close mobile popup on Escape
  useEffect(() => {
    if (!selectedMobileNode) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedMobileNode(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedMobileNode]);

  // Desktop dimensions
  const maxCol = Math.max(...Object.values(desktopBranchColumns).map(Math.abs), 1);
  const desktopGraphWidth = (maxCol * 2 + 1) * DESKTOP_COL_WIDTH + 60;
  const DESKTOP_CENTER_X = desktopGraphWidth / 2;

  // Mobile dimensions
  const maxMobileCol = Math.max(...Object.values(mobileBranchColumns), 0);
  const mobileGraphWidth = MOBILE_START_X + maxMobileCol * MOBILE_COL_WIDTH + 24;

  const renderDesktopSvgConnections = () => {
    const paths = [];
    const branchNodes = {};

    timeline.forEach((node, idx) => {
      if (!branchNodes[node.branchId]) branchNodes[node.branchId] = [];
      branchNodes[node.branchId].push({ ...node, rowIdx: idx });
    });

    // 1. Main trunk line handling
    const mainNodes = branchNodes["main"] || [];
    const mainColor = graphData.branches.find((b) => b.id === "main")?.color || "#3b82f6";

    if (mainNodes.length > 0) {
      // Connect top to first main node
      paths.push(
        <line
          key="desktop-main-start"
          x1={DESKTOP_CENTER_X}
          y1={0}
          x2={DESKTOP_CENTER_X}
          y2={mainNodes[0].rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2}
          stroke={mainColor}
          strokeWidth="3.5"
          strokeOpacity="0.8"
        />
      );

      // Connect between main nodes
      for (let i = 0; i < mainNodes.length - 1; i++) {
        const n1 = mainNodes[i];
        const n2 = mainNodes[i + 1];
        if (n1.final) break; // If final is true, stop drawing line

        paths.push(
          <line
            key={`desktop-main-line-${i}`}
            x1={DESKTOP_CENTER_X}
            y1={n1.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2}
            x2={DESKTOP_CENTER_X}
            y2={n2.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2}
            stroke={mainColor}
            strokeWidth="3.5"
            strokeOpacity="0.8"
          />
        );
      }

      // If last main node is not final, extend main down for child branches
      const lastMain = mainNodes[mainNodes.length - 1];
      if (!lastMain.final && timeline.length > lastMain.rowIdx + 1) {
        paths.push(
          <line
            key="desktop-main-end"
            x1={DESKTOP_CENTER_X}
            y1={lastMain.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2}
            x2={DESKTOP_CENTER_X}
            y2={(timeline.length - 0.5) * DESKTOP_ROW_HEIGHT}
            stroke={mainColor}
            strokeWidth="3.5"
            strokeOpacity="0.8"
          />
        );
      }
    }

    // 2. Non-main branches
    Object.keys(branchNodes).forEach((bId) => {
      if (bId === "main") return;

      const nodes = branchNodes[bId];
      const branchObj = graphData.branches.find((b) => b.id === bId);
      const parentBranchId = branchObj?.from || "main";

      const parentCol = desktopBranchColumns[parentBranchId] ?? 0;
      const targetCol = desktopBranchColumns[bId] ?? 0;

      const parentX = DESKTOP_CENTER_X + parentCol * DESKTOP_COL_WIDTH;
      const targetX = DESKTOP_CENTER_X + targetCol * DESKTOP_COL_WIDTH;

      const firstNode = nodes[0];
      const startY = (firstNode.rowIdx - 0.5) * DESKTOP_ROW_HEIGHT;
      const endY = firstNode.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2;
      const tension = DESKTOP_ROW_HEIGHT * 0.45;

      // Branch curve from parent branch
      paths.push(
        <path
          key={`desktop-branch-start-${bId}`}
          d={`M ${parentX} ${startY} C ${parentX} ${startY + tension}, ${targetX} ${endY - tension}, ${targetX} ${endY}`}
          stroke={firstNode.branchColor}
          strokeWidth="3.5"
          fill="none"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />
      );

      // Connect sequential nodes of this branch
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        if (n1.final) break; // If final is true, stop drawing line after this dot

        const y1 = n1.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2;
        const y2 = n2.rowIdx * DESKTOP_ROW_HEIGHT + DESKTOP_ROW_HEIGHT / 2;

        paths.push(
          <line
            key={`desktop-branch-line-${bId}-${i}`}
            x1={targetX}
            y1={y1}
            x2={targetX}
            y2={y2}
            stroke={n1.branchColor}
            strokeWidth="3.5"
            strokeOpacity="0.9"
          />
        );
      }
    });

    return paths;
  };

  const renderMobileSvgConnections = () => {
    const paths = [];
    const branchNodes = {};

    timeline.forEach((node, idx) => {
      if (!branchNodes[node.branchId]) branchNodes[node.branchId] = [];
      branchNodes[node.branchId].push({ ...node, rowIdx: idx });
    });

    // 1. Main trunk line handling on Mobile (at MOBILE_START_X)
    const mainNodes = branchNodes["main"] || [];
    const mainColor = graphData.branches.find((b) => b.id === "main")?.color || "#3b82f6";

    if (mainNodes.length > 0) {
      paths.push(
        <line
          key="mobile-main-start"
          x1={MOBILE_START_X}
          y1={0}
          x2={MOBILE_START_X}
          y2={mainNodes[0].rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2}
          stroke={mainColor}
          strokeWidth="3.5"
          strokeOpacity="0.8"
        />
      );

      for (let i = 0; i < mainNodes.length - 1; i++) {
        const n1 = mainNodes[i];
        const n2 = mainNodes[i + 1];
        if (n1.final) break;

        paths.push(
          <line
            key={`mobile-main-line-${i}`}
            x1={MOBILE_START_X}
            y1={n1.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2}
            x2={MOBILE_START_X}
            y2={n2.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2}
            stroke={mainColor}
            strokeWidth="3.5"
            strokeOpacity="0.8"
          />
        );
      }

      const lastMain = mainNodes[mainNodes.length - 1];
      if (!lastMain.final && timeline.length > lastMain.rowIdx + 1) {
        paths.push(
          <line
            key="mobile-main-end"
            x1={MOBILE_START_X}
            y1={lastMain.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2}
            x2={MOBILE_START_X}
            y2={(timeline.length - 0.5) * MOBILE_ROW_HEIGHT}
            stroke={mainColor}
            strokeWidth="3.5"
            strokeOpacity="0.8"
          />
        );
      }
    }

    // 2. Non-main branches on Mobile
    Object.keys(branchNodes).forEach((bId) => {
      if (bId === "main") return;

      const nodes = branchNodes[bId];
      const branchObj = graphData.branches.find((b) => b.id === bId);
      const parentBranchId = branchObj?.from || "main";

      const parentCol = mobileBranchColumns[parentBranchId] ?? 0;
      const targetCol = mobileBranchColumns[bId] ?? 1;

      const parentX = MOBILE_START_X + parentCol * MOBILE_COL_WIDTH;
      const targetX = MOBILE_START_X + targetCol * MOBILE_COL_WIDTH;

      const firstNode = nodes[0];
      const startY = (firstNode.rowIdx - 0.5) * MOBILE_ROW_HEIGHT;
      const endY = firstNode.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2;
      const tension = MOBILE_ROW_HEIGHT * 0.45;

      paths.push(
        <path
          key={`mobile-branch-start-${bId}`}
          d={`M ${parentX} ${startY} C ${parentX} ${startY + tension}, ${targetX} ${endY - tension}, ${targetX} ${endY}`}
          stroke={firstNode.branchColor}
          strokeWidth="3.5"
          fill="none"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />
      );

      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        if (n1.final) break;

        const y1 = n1.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2;
        const y2 = n2.rowIdx * MOBILE_ROW_HEIGHT + MOBILE_ROW_HEIGHT / 2;

        paths.push(
          <line
            key={`mobile-branch-line-${bId}-${i}`}
            x1={targetX}
            y1={y1}
            x2={targetX}
            y2={y2}
            stroke={n1.branchColor}
            strokeWidth="3.5"
            strokeOpacity="0.9"
          />
        );
      }
    });

    return paths;
  };

  return (
    <section
      id="journey"
      className="py-16 px-4 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)]"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-10 text-[var(--text-hero-title)]">
          {sectionCopy}
        </h2>

        {/* Timeline Container */}
        {isMobile ? (
          /* Mobile View: Single-sided with centralized dots and responsive popups */
          <div className="w-full relative px-1">
            <svg
              className="absolute top-0 left-0 pointer-events-none overflow-visible w-full"
              style={{
                height: timeline.length * MOBILE_ROW_HEIGHT,
              }}
            >
              {renderMobileSvgConnections()}
            </svg>

            <div className="flex flex-col w-full z-10">
              {timeline.map((node) => {
                const copy = node[lang] || node.en;
                const col = mobileBranchColumns[node.branchId] ?? 0;
                const dotX = MOBILE_START_X + col * MOBILE_COL_WIDTH;
                const isSelected = selectedMobileNode?.id === node.id;

                return (
                  <div
                    key={node.id}
                    className="flex items-center w-full relative"
                    style={{ height: `${MOBILE_ROW_HEIGHT}px` }}
                  >
                    {/* Graph Dot Column with Centralized Dot */}
                    <div
                      className="relative shrink-0"
                      style={{ width: `${mobileGraphWidth}px`, height: "100%" }}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedMobileNode(isSelected ? null : node)}
                        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 flex items-center justify-center cursor-pointer touch-manipulation z-20"
                        style={{ left: `${dotX}px` }}
                        aria-label={`${node.year} - ${copy.title}`}
                      >
                        <span
                          className="rounded-full border-[3px] transition-all duration-300 flex items-center justify-center overflow-hidden"
                          style={{
                            width: node.image ? (isSelected ? "26px" : "22px") : isSelected ? "20px" : "15px",
                            height: node.image ? (isSelected ? "26px" : "22px") : isSelected ? "20px" : "15px",
                            borderColor: node.branchColor,
                            backgroundColor: isDark ? "#0f172a" : "#ffffff",
                            boxShadow: isSelected
                              ? `0 0 16px ${node.branchColor}`
                              : node.final
                              ? `0 0 8px ${node.branchColor}80`
                              : "none",
                          }}
                        >
                          {node.image ? (
                            <img
                              src={node.image}
                              alt=""
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : node.final ? (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: node.branchColor }}
                            />
                          ) : null}
                        </span>
                      </button>
                    </div>

                    {/* Node Row Button */}
                    <div className="flex-1 min-w-0 pr-1">
                      <button
                        type="button"
                        onClick={() => setSelectedMobileNode(isSelected ? null : node)}
                        className={`text-left flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl transition-all w-full border ${
                          isSelected
                            ? isDark
                              ? "bg-slate-800 border-blue-500/70 shadow-md"
                              : "bg-blue-50 border-blue-300 shadow-md"
                            : isDark
                            ? "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60"
                            : "bg-white/70 border-slate-200 hover:bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="text-xs font-bold shrink-0"
                            style={{ color: node.branchColor }}
                          >
                            {node.year}
                          </span>
                          <span
                            className={`text-xs font-medium truncate ${
                              isDark ? "text-slate-200" : "text-slate-800"
                            }`}
                          >
                            {copy.title}
                          </span>
                        </div>
                        {node.age !== undefined && node.age !== null && (
                          <span
                            className={`text-[10px] shrink-0 font-medium ${
                              isDark ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            {node.age}y
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mobile Responsive Popup Card Modal */}
            {selectedMobileNode && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
                role="dialog"
                aria-modal="true"
                onClick={() => setSelectedMobileNode(null)}
              >
                <div
                  className={`relative w-full max-w-sm rounded-2xl border shadow-2xl overflow-hidden transition-all duration-300 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-white"
                      : "bg-white border-slate-200 text-slate-900"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  style={{ borderTop: `4px solid ${selectedMobileNode.branchColor}` }}
                >
                  {selectedMobileNode.banner ? (
                    <img
                      src={selectedMobileNode.banner}
                      alt={
                        selectedMobileNode[lang]?.title ||
                        selectedMobileNode.en?.title
                      }
                      className="w-full h-32 object-cover"
                    />
                  ) : selectedMobileNode.image ? (
                    <div className="w-full h-24 flex items-center justify-center bg-slate-800/40 p-3">
                      <img
                        src={selectedMobileNode.image}
                        alt=""
                        className="w-16 h-16 object-cover rounded-full border-2"
                        style={{ borderColor: selectedMobileNode.branchColor }}
                      />
                    </div>
                  ) : null}

                  <div className="p-5">
                    {/* Non-overlapping Header with dedicated close button slot */}
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: selectedMobileNode.branchColor }}
                        />
                        <span
                          className="text-xs font-bold uppercase tracking-wider truncate"
                          style={{ color: selectedMobileNode.branchColor }}
                        >
                          {selectedMobileNode.branchLabel[lang] ||
                            selectedMobileNode.branchLabel.en}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            isDark
                              ? "bg-slate-800 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {selectedMobileNode.year}
                          {selectedMobileNode.age !== undefined &&
                          selectedMobileNode.age !== null
                            ? ` · ${selectedMobileNode.age}y`
                            : ""}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedMobileNode(null)}
                          className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition"
                          aria-label="Close"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-base font-extrabold mt-1">
                      {selectedMobileNode[lang]?.title ||
                        selectedMobileNode.en?.title}
                    </h3>

                    <p
                      className={`text-sm mt-2 leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      {selectedMobileNode[lang]?.description ||
                        selectedMobileNode.en?.description}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Desktop View: Inverted Tree Structure */
          <div className="journey-timeline">
            <div className="journey-timeline-content relative flex justify-center">
              <svg
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none overflow-visible"
                style={{
                  width: `${desktopGraphWidth}px`,
                  height: timeline.length * DESKTOP_ROW_HEIGHT,
                }}
              >
                {renderDesktopSvgConnections()}
              </svg>

              <div className="w-full max-w-7xl flex flex-col z-10">
                {timeline.map((node, idx) => (
                  <CommitRow
                    key={node.id}
                    node={node}
                    lang={lang}
                    isDark={isDark}
                    side={idx % 2 === 0 ? "left" : "right"}
                    colOffset={desktopBranchColumns[node.branchId] ?? 0}
                    centerX={DESKTOP_CENTER_X}
                    graphWidth={desktopGraphWidth}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CommitRow({ node, lang, isDark, side, colOffset, centerX, graphWidth }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const copy = node[lang] || node.en;
  const dotX = centerX + colOffset * DESKTOP_COL_WIDTH;

  return (
    <div
      className="flex items-center w-full"
      style={{ height: `${DESKTOP_ROW_HEIGHT}px` }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Left side card */}
      <div className="flex-1 min-w-0 flex justify-end pr-4">
        {side === "left" && (
          <NodeCard
            copy={copy}
            node={node}
            isDark={isDark}
            isExpanded={isExpanded}
            lang={lang}
          />
        )}
      </div>

      {/* Center Graph Column with Centralized Tree Dot */}
      <div
        className="relative flex-shrink-0"
        style={{ width: `${graphWidth}px`, height: "100%" }}
      >
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-[3px] transition-all duration-300 cursor-pointer overflow-hidden flex items-center justify-center"
          style={{
            left: `${dotX}px`,
            width: node.image ? (isExpanded ? "26px" : "22px") : isExpanded ? "20px" : "16px",
            height: node.image ? (isExpanded ? "26px" : "22px") : isExpanded ? "20px" : "16px",
            borderColor: node.branchColor,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            boxShadow: isExpanded
              ? `0 0 16px ${node.branchColor}`
              : node.final
              ? `0 0 8px ${node.branchColor}80`
              : "none",
          }}
        >
          {node.image ? (
            <img
              src={node.image}
              alt=""
              className="w-full h-full object-cover rounded-full"
            />
          ) : node.final ? (
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: node.branchColor }}
            />
          ) : null}
        </div>
      </div>

      {/* Right side card */}
      <div className="flex-1 min-w-0 flex justify-start pl-4">
        {side === "right" && (
          <NodeCard
            copy={copy}
            node={node}
            isDark={isDark}
            isExpanded={isExpanded}
            lang={lang}
          />
        )}
      </div>
    </div>
  );
}

function NodeCard({ copy, node, isDark, isExpanded, lang }) {
  return (
    <div
      className={`transition-all duration-300 ease-out rounded-xl overflow-hidden border shadow-lg max-w-xs w-full ${
        isExpanded
          ? "opacity-100 scale-100 z-30"
          : "opacity-0 scale-95 pointer-events-none"
      } ${
        isDark
          ? "bg-slate-800/90 border-slate-700/60 backdrop-blur-sm"
          : "bg-white/90 border-slate-200/80 backdrop-blur-sm"
      }`}
    >
      {node.banner ? (
        <img
          src={node.banner}
          alt={copy.title}
          className="w-full h-24 object-cover"
        />
      ) : node.image ? (
        <div className="w-full h-20 flex items-center justify-center bg-slate-800/30 p-2">
          <img
            src={node.image}
            alt=""
            className="w-14 h-14 object-cover rounded-full border-2"
            style={{ borderColor: node.branchColor }}
          />
        </div>
      ) : null}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: node.branchColor }}
          />
          <span
            className="text-[10px] font-semibold uppercase tracking-wider opacity-70"
            style={{ color: node.branchColor }}
          >
            {node.branchLabel[lang] || node.branchLabel.en}
          </span>
          <span
            className={`text-[10px] ml-auto ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {node.age !== undefined && node.age !== null ? `${node.age}y` : ""}
          </span>
        </div>
        <h4
          className={`text-sm font-bold ${
            isDark ? "text-white" : "text-slate-900"
          }`}
        >
          {copy.title}
        </h4>
        <p
          className={`text-xs mt-1 ${
            isDark ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {copy.description}
        </p>
      </div>
    </div>
  );
}
