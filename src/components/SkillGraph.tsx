import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import {
  skillNodes,
  skillLinks,
  categoryColors,
  categoryLabels,
  tierLabels,
  tierColors,
  type SkillNode,
  type SkillCategory,
} from '../data/skillTreeData';

interface GraphNode extends SkillNode {
  x?: number;
  y?: number;
}

export default function SkillGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [firingNode, setFiringNode] = useState<string | null>(null);
  const [firingTime, setFiringTime] = useState(0);
  const reducedMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    []
  );

  // Build adjacency map for quick neighbor lookup
  const adjacencyMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    skillLinks.forEach(link => {
      if (!map.has(link.source)) map.set(link.source, new Set());
      if (!map.has(link.target)) map.set(link.target, new Set());
      map.get(link.source)!.add(link.target);
      map.get(link.target)!.add(link.source);
    });
    return map;
  }, []);

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Configure forces after graph mounts — gentler to preserve brain layout
  useEffect(() => {
    const fg = graphRef.current;
    if (!fg) return;

    // Weaker charge so brain-region layout is preserved
    fg.d3Force('charge')?.strength(-80);

    // Shorter link distances to keep connected nodes close
    fg.d3Force('link')?.distance(45);

    // Collision to prevent overlapping
    const d3 = (window as any).d3;
    if (d3?.forceCollide) {
      fg.d3Force('collide', d3.forceCollide(18));
    }

    // Reduce center force to preserve brain shape
    fg.d3Force('center')?.strength(0.02);
  }, []);

  // Zoom to fit when engine stops (nodes are settled), then release fixed positions for dragging
  const handleEngineStop = useCallback(() => {
    graphRef.current?.zoomToFit(600, 80);
    // Release fixed positions so nodes become draggable
    const nodes = graphRef.current?.graphData()?.nodes;
    if (nodes) {
      nodes.forEach((node: any) => {
        node.fx = undefined;
        node.fy = undefined;
      });
    }
  }, []);

  // Also do initial zoom after a delay as fallback
  useEffect(() => {
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(600, 80);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Clear firing state after 1.2 seconds
  useEffect(() => {
    if (!firingNode) return;
    const timer = setTimeout(() => {
      setFiringNode(null);
    }, 1200);
    return () => clearTimeout(timer);
  }, [firingNode, firingTime]);

  const graphData = useMemo(() => ({
    nodes: skillNodes.map(n => ({ ...n, x: n.fx, y: n.fy })),
    links: skillLinks.map(l => ({ ...l })),
  }), []);

  const handleNodeClick = useCallback((node: any) => {
    const n = node as GraphNode;
    setSelectedNode(n);
    setFiringNode(n.id);
    setFiringTime(Date.now());
  }, []);

  const handleNodeHover = useCallback((node: any) => {
    setHoveredNode(node?.id || null);
  }, []);

  const handleBackgroundClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Check if a link is connected to a specific node
  const isLinkConnected = useCallback((link: any, nodeId: string | null) => {
    if (!nodeId) return false;
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
    return sourceId === nodeId || targetId === nodeId;
  }, []);

  // Simplified node rendering — fewer draw calls
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;
    const n = node as GraphNode;
    const color = categoryColors[n.category];
    const radius = Math.sqrt(n.val) * 3;
    const isHovered = hoveredNode === n.id;
    const isSelected = selectedNode?.id === n.id;
    const isFiring = firingNode === n.id;
    const isNeighborOfHovered = hoveredNode ? adjacencyMap.get(hoveredNode)?.has(n.id) ?? false : false;
    const fontSize = Math.max(10 / globalScale, 1.5);
    const isActive = isHovered || isSelected || isFiring;

    // Glow ring — only for active states
    if (isActive) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}30`;
      ctx.fill();
    }

    // Main body with gradient
    const gradient = ctx.createRadialGradient(
      node.x - radius * 0.3, node.y - radius * 0.3, 0,
      node.x, node.y, radius
    );
    gradient.addColorStop(0, isActive ? `${color}ff` : `${color}cc`);
    gradient.addColorStop(1, `${color}55`);

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Core dot
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius * 0.3, 0, 2 * Math.PI);
    ctx.fillStyle = isActive ? '#ffffff' : `${color}ee`;
    ctx.fill();

    // Label
    if (globalScale > 0.6) {
      const label = n.name;
      ctx.font = `500 ${fontSize}px 'Inter Variable', Inter, system-ui, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const labelY = node.y + radius + 5 / globalScale;
      const pillPadding = 3 / globalScale;

      // Background pill
      const dimmed = !isHovered && !isSelected && !isNeighborOfHovered && hoveredNode !== null;
      ctx.fillStyle = dimmed ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.6)';
      const pillRadius = 2 / globalScale;

      ctx.beginPath();
      ctx.roundRect(
        node.x - textWidth / 2 - pillPadding,
        labelY - fontSize * 0.1 - pillPadding,
        textWidth + pillPadding * 2,
        fontSize + pillPadding * 2,
        pillRadius
      );
      ctx.fill();

      // Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isActive
        ? '#f5f5f7'
        : isNeighborOfHovered
          ? '#a1a1a6'
          : hoveredNode !== null
            ? '#4a4a4e'
            : '#8e8e93';
      ctx.fillText(label, node.x, labelY);
    }
  }, [hoveredNode, selectedNode, firingNode, adjacencyMap]);

  // Custom link rendering
  const paintLink = useCallback((link: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const sourceNode = typeof link.source === 'object' ? link.source : null;
    const targetNode = typeof link.target === 'object' ? link.target : null;
    if (!sourceNode || !targetNode) return;
    if (!isFinite(sourceNode.x) || !isFinite(sourceNode.y) || !isFinite(targetNode.x) || !isFinite(targetNode.y)) return;

    const sourceId = sourceNode.id;
    const targetId = targetNode.id;
    const sourceSkill = skillNodes.find(n => n.id === sourceId);
    const targetSkill = skillNodes.find(n => n.id === targetId);
    if (!sourceSkill || !targetSkill) return;

    const sourceColor = categoryColors[sourceSkill.category];
    const targetColor = categoryColors[targetSkill.category];

    const isConnectedToHover = hoveredNode && (sourceId === hoveredNode || targetId === hoveredNode);
    const isConnectedToFiring = firingNode && (sourceId === firingNode || targetId === firingNode);
    const isConnectedToSelected = selectedNode && (sourceId === selectedNode.id || targetId === selectedNode.id);

    let opacity = '0a';
    if (isConnectedToFiring) opacity = '44';
    else if (isConnectedToSelected) opacity = '33';
    else if (isConnectedToHover) opacity = '28';

    const gradient = ctx.createLinearGradient(
      sourceNode.x, sourceNode.y,
      targetNode.x, targetNode.y
    );
    gradient.addColorStop(0, `${sourceColor}${opacity}`);
    gradient.addColorStop(1, `${targetColor}${opacity}`);

    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = isConnectedToFiring ? 2 / globalScale : isConnectedToHover ? 1.5 / globalScale : 0.8 / globalScale;
    ctx.stroke();
  }, [hoveredNode, selectedNode, firingNode]);

  const nodePointerAreaPaint = useCallback((node: any, color: string, ctx: CanvasRenderingContext2D) => {
    const radius = Math.sqrt((node as GraphNode).val) * 3 + 6;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = color;
    ctx.fill();
  }, []);

  // Particles — only on hover/firing, not constantly
  const getParticleCount = useCallback((link: any) => {
    if (reducedMotion) return 0;
    if (firingNode && isLinkConnected(link, firingNode)) return 4;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return 3;
    return 0; // No particles by default!
  }, [firingNode, hoveredNode, isLinkConnected, reducedMotion]);

  const getParticleWidth = useCallback((link: any) => {
    if (firingNode && isLinkConnected(link, firingNode)) return 2.5;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return 2;
    return 0;
  }, [firingNode, hoveredNode, isLinkConnected]);

  const getParticleSpeed = useCallback((link: any) => {
    if (firingNode && isLinkConnected(link, firingNode)) return 0.012;
    return 0.006;
  }, [firingNode, isLinkConnected]);

  const getParticleColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const sourceNode = skillNodes.find(n => n.id === sourceId);
    if (!sourceNode) return 'rgba(255,255,255,0.1)';
    const color = categoryColors[sourceNode.category];
    if (firingNode && isLinkConnected(link, firingNode)) return `${color}cc`;
    return `${color}88`;
  }, [firingNode, isLinkConnected]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={paintNode}
        nodePointerAreaPaint={nodePointerAreaPaint}
        linkCanvasObjectMode={() => 'replace' as any}
        linkCanvasObject={paintLink}
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        onBackgroundClick={handleBackgroundClick}
        onEngineStop={handleEngineStop}
        linkDirectionalParticles={getParticleCount}
        linkDirectionalParticleWidth={getParticleWidth}
        linkDirectionalParticleSpeed={getParticleSpeed}
        linkDirectionalParticleColor={getParticleColor}
        d3AlphaDecay={reducedMotion ? 1 : 0.035}
        d3VelocityDecay={0.5}
        cooldownTicks={reducedMotion ? 0 : 300}
        warmupTicks={100}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
        minZoom={0.5}
        maxZoom={5}
      />

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
        pointerEvents: 'none',
      }}>
        {(Object.entries(categoryLabels) as [SkillCategory, string][]).map(([key, label]) => (
          <div key={key} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: categoryColors[key],
              boxShadow: `0 0 6px ${categoryColors[key]}66`,
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: '0.65rem',
              color: '#6e6e73',
              letterSpacing: '0.03em',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Detail Panel */}
      {selectedNode && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '280px',
            background: 'rgba(13, 13, 13, 0.95)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${categoryColors[selectedNode.category]}22`,
            borderRadius: '12px',
            padding: '1.25rem',
            zIndex: 10,
            animation: 'fadeInPanel 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 0 40px ${categoryColors[selectedNode.category]}10`,
          }}
        >
          <button
            onClick={() => setSelectedNode(null)}
            aria-label="Close detail panel"
            style={{
              position: 'absolute',
              top: '10px',
              right: '12px',
              background: 'none',
              border: 'none',
              color: '#6e6e73',
              fontSize: '1.1rem',
              cursor: 'pointer',
              padding: '4px',
              lineHeight: 1,
            }}
          >
            x
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.5rem' }}>{selectedNode.emoji}</span>
            <h4 style={{
              fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
              fontSize: '1.1rem',
              fontWeight: 600,
              color: '#f5f5f7',
              margin: 0,
              letterSpacing: '-0.02em',
            }}>
              {selectedNode.name}
            </h4>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: '0.7rem',
              color: tierColors[selectedNode.proficiency],
              background: `${tierColors[selectedNode.proficiency]}15`,
              border: `1px solid ${tierColors[selectedNode.proficiency]}30`,
              padding: '3px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.02em',
            }}>
              {tierLabels[selectedNode.proficiency]}
            </span>
            <span style={{
              fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
              fontSize: '0.7rem',
              color: categoryColors[selectedNode.category],
              background: `${categoryColors[selectedNode.category]}15`,
              border: `1px solid ${categoryColors[selectedNode.category]}30`,
              padding: '3px 10px',
              borderRadius: '9999px',
              letterSpacing: '0.02em',
            }}>
              {categoryLabels[selectedNode.category]}
            </span>
          </div>

          <p style={{
            fontFamily: "'Inter Variable', Inter, system-ui, sans-serif",
            fontSize: '0.85rem',
            color: '#a1a1a6',
            lineHeight: 1.6,
            margin: 0,
          }}>
            {selectedNode.description}
          </p>
        </div>
      )}

      {/* Screen reader accessible list */}
      <ul aria-label="Technical skills list" style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        border: 0,
      }}>
        {skillNodes.map(node => (
          <li key={node.id}>
            {node.name} — {tierLabels[node.proficiency]} — {node.description}
          </li>
        ))}
      </ul>

      <style>{`
        @keyframes fadeInPanel {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
