import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import graphData from "../data/graph.json";

const ROW_HEIGHT = 60; // Espaçamento vertical
const COL_WIDTH = 45;  // Espaçamento horizontal entre colunas

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

  allNodes.sort((a, b) => {
    const yearDiff = parseInt(a.year) - parseInt(b.year);
    if (yearDiff !== 0) return yearDiff;
    return a.branchIndex - b.branchIndex;
  });

  return allNodes;
}

export function GitGraph() {
  const { lang, theme } = useApp();
  const isDark = theme === "dark";
  const sectionCopy = graphData.sectionTitle[lang] || graphData.sectionTitle["en"];

  // Mapeia colunas alternando entre direita (+1) e esquerda (-1) ao redor do Main (0)
  const branchColumns = useMemo(() => {
    const cols = {};
    let rightOffset = 1;
    let leftOffset = -1;

    graphData.branches.forEach((b) => {
      if (b.id === "main") {
        cols[b.id] = 0; // Main sempre centralizado em 0
      } else {
        if (Math.abs(rightOffset) <= Math.abs(leftOffset)) {
          cols[b.id] = rightOffset;
          rightOffset++;
        } else {
          cols[b.id] = leftOffset;
          leftOffset--;
        }
      }
    });

    return cols;
  }, []);

  const timeline = useMemo(() => buildTimeline(graphData.branches), []);

  // Define uma largura fixa suficiente para acomodar os desvios laterais
  // O centro exato (Main Trunk) será rigorosamente em graphWidth / 2
  const maxBranchesSide = Math.ceil((graphData.branches.length - 1) / 2);
  const graphWidth = (maxBranchesSide * 2 + 1) * COL_WIDTH + 60;
  const CENTER_X = graphWidth / 2;

  const renderSvgConnections = () => {
    const paths = [];

    // 1. Linha do Main Trunk rigorosamente centralizada
    paths.push(
      <line
        key="main-trunk"
        x1={CENTER_X}
        y1={0}
        x2={CENTER_X}
        y2={timeline.length * ROW_HEIGHT}
        stroke={graphData.branches.find((b) => b.id === "main")?.color || "#3b82f6"}
        strokeWidth="3.5"
        strokeOpacity="0.8"
      />
    );

    // 2. Mapear histórico das branches
    const branchNodes = {};
    timeline.forEach((node, idx) => {
      if (!branchNodes[node.branchId]) branchNodes[node.branchId] = [];
      branchNodes[node.branchId].push({ ...node, rowIdx: idx });
    });

    Object.keys(branchNodes).forEach((bId) => {
      if (bId === "main") return;

      const nodes = branchNodes[bId];
      const colOffset = branchColumns[bId];
      const targetX = CENTER_X + colOffset * COL_WIDTH;

      const firstNode = nodes[0];
      const startX = CENTER_X;
      const startY = (firstNode.rowIdx - 0.5) * ROW_HEIGHT;
      const endY = firstNode.rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

      const tension = ROW_HEIGHT * 0.45;

      // Desenha a curva do Main Trunk para o primeiro nó
      paths.push(
        <path
          key={`branch-start-${bId}`}
          d={`M ${startX} ${startY} C ${startX} ${startY + tension}, ${targetX} ${endY - tension}, ${targetX} ${endY}`}
          stroke={firstNode.branchColor}
          strokeWidth="3.5"
          fill="none"
          strokeOpacity="0.9"
          strokeLinecap="round"
        />
      );

      // Linhas verticais que conectam os pontos da mesma branch
      for (let i = 0; i < nodes.length - 1; i++) {
        const n1 = nodes[i];
        const n2 = nodes[i + 1];
        const y1 = n1.rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        const y2 = n2.rowIdx * ROW_HEIGHT + ROW_HEIGHT / 2;

        paths.push(
          <line
            key={`branch-line-${bId}-${i}`}
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
    <section id="journey" className="py-16 px-4 transition-colors duration-300 bg-[var(--bg-hero)] text-[var(--text-hero)]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-4 text-[var(--text-hero-title)]">
          {sectionCopy}
        </h2>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {graphData.branches.map((branch) => (
            <div key={branch.id} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: branch.color }} />
              <span className={`text-xs font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {branch.label[lang] || branch.label["en"]}
              </span>
            </div>
          ))}
        </div>

        {/* Timeline Container */}
        <div className="journey-timeline">
          <div className="journey-timeline-content relative flex justify-center">
            {/* SVG Overlay perfeitamente alinhado */}
            <svg
              className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none overflow-visible"
              style={{
                width: `${graphWidth}px`,
                height: timeline.length * ROW_HEIGHT,
              }}
            >
              {renderSvgConnections()}
            </svg>

            {/* Nós e Cards */}
            <div className="w-full max-w-7xl flex flex-col z-10">
              {timeline.map((node, idx) => (
                <CommitRow
                  key={`${node.branchId}-${node.year}-${idx}`}
                  node={node}
                  lang={lang}
                  isDark={isDark}
                  side={idx % 2 === 0 ? "left" : "right"}
                  colOffset={branchColumns[node.branchId]}
                  centerX={CENTER_X}
                  graphWidth={graphWidth}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CommitRow({ node, lang, isDark, side, colOffset, centerX, graphWidth }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const copy = node[lang] || node["en"];
  const dotX = centerX + colOffset * COL_WIDTH;

  return (
    <div
      className="flex items-center w-full"
      style={{ height: `${ROW_HEIGHT}px` }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Lado Esquerdo */}
      <div className="flex-1 min-w-0 flex justify-end pr-4">
        {side === "left" && (
          <NodeCard copy={copy} node={node} isDark={isDark} isExpanded={isExpanded} lang={lang} />
        )}
      </div>

      {/* Coluna Central do Grafo */}
      <div className="relative flex-shrink-0" style={{ width: `${graphWidth}px`, height: "100%" }}>
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full border-[3px] transition-all duration-300 cursor-pointer"
          style={{
            left: `${dotX}px`,
            width: isExpanded ? "20px" : "16px",
            height: isExpanded ? "20px" : "16px",
            borderColor: node.branchColor,
            backgroundColor: isDark ? "#0f172a" : "#ffffff",
            boxShadow: isExpanded ? `0 0 16px ${node.branchColor}` : "none",
          }}
        />
      </div>

      {/* Lado Direito */}
      <div className="flex-1 min-w-0 flex justify-start pl-4">
        {side === "right" && (
          <NodeCard copy={copy} node={node} isDark={isDark} isExpanded={isExpanded} lang={lang} />
        )}
      </div>
    </div>
  );
}

function NodeCard({ copy, node, isDark, isExpanded, lang }) {
  return (
    <div
      className={`transition-all duration-300 ease-out rounded-xl overflow-hidden border shadow-lg max-w-xs w-full ${
        isExpanded ? "opacity-100 scale-100 z-30" : "opacity-0 scale-95 pointer-events-none"
      } ${
        isDark ? "bg-slate-800/90 border-slate-700/60 backdrop-blur-sm" : "bg-white/90 border-slate-200/80 backdrop-blur-sm"
      }`}
    >
      {node.banner && <img src={node.banner} alt={copy.title} className="w-full h-24 object-cover" />}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: node.branchColor }} />
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70" style={{ color: node.branchColor }}>
            {node.branchLabel[lang] || node.branchLabel["en"]}
          </span>
          <span className={`text-[10px] ml-auto ${isDark ? "text-slate-500" : "text-slate-400"}`}>
            {node.age !== undefined && node.age !== null ? `${node.age}y` : ""}
          </span>
        </div>
        <h4 className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{copy.title}</h4>
        <p className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{copy.description}</p>
      </div>
    </div>
  );
}
