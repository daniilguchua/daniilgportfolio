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

  // Zoom to fit after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      graphRef.current?.zoomToFit(400, 60);
    }, 500);
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
    nodes: skillNodes.map(n => ({ ...n })),
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

  // Neural network node rendering
  const paintNode = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    if (node.x == null || node.y == null || !isFinite(node.x) || !isFinite(node.y)) return;
    const n = node as GraphNode;
    const color = categoryColors[n.category];
    const baseRadius = Math.sqrt(n.val) * 3;
    const isHovered = hoveredNode === n.id;
    const isSelected = selectedNode?.id === n.id;
    const isFiring = firingNode === n.id;
    const isNeighborOfHovered = hoveredNode ? adjacencyMap.get(hoveredNode)?.has(n.id) ?? false : false;
    const isNeighborOfFiring = firingNode ? adjacencyMap.get(firingNode)?.has(n.id) ?? false : false;
    const fontSize = Math.max(10 / globalScale, 1.5);

    // Pulse animation
    const time = Date.now() / 1000;
    const nodeHash = n.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const pulse = reducedMotion ? 0 : Math.sin(time * 1.5 + nodeHash) * 1;
    const radius = baseRadius + pulse;

    // Outer glow ring (pulsing)
    const glowIntensity = isSelected || isFiring ? 0.25 : isHovered ? 0.18 : isNeighborOfFiring ? 0.12 : 0.06;
    const glowPulse = reducedMotion ? glowIntensity : glowIntensity + Math.sin(time * 2 + nodeHash) * 0.03;
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI);
    ctx.fillStyle = `${color}${Math.round(Math.max(0, Math.min(1, glowPulse)) * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();

    // Middle ring for active states
    if (isHovered || isSelected || isFiring) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI);
      ctx.fillStyle = `${color}33`;
      ctx.fill();
    }

    // Main neuron body with radial gradient
    const gradient = ctx.createRadialGradient(
      node.x - radius * 0.3, node.y - radius * 0.3, 0,
      node.x, node.y, radius
    );
    gradient.addColorStop(0, isSelected || isFiring ? `${color}ff` : `${color}dd`);
    gradient.addColorStop(0.7, `${color}aa`);
    gradient.addColorStop(1, `${color}66`);

    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Bright core dot (nucleus)
    const coreRadius = radius * 0.35;
    ctx.beginPath();
    ctx.arc(node.x, node.y, coreRadius, 0, 2 * Math.PI);
    ctx.fillStyle = isSelected || isFiring ? '#ffffff' : color;
    ctx.fill();

    // Border ring
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = isHovered || isSelected || isFiring ? `${color}88` : `${color}33`;
    ctx.lineWidth = (isSelected ? 2 : 1) / globalScale;
    ctx.stroke();

    // Label with background pill
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
      const pillX = node.x - textWidth / 2 - pillPadding;
      const pillY = labelY - fontSize * 0.1 - pillPadding;
      const pillW = textWidth + pillPadding * 2;
      const pillH = fontSize + pillPadding * 2;

      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillRadius);
      ctx.fill();

      // Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillStyle = isHovered || isSelected || isFiring
        ? '#f5f5f7'
        : isNeighborOfHovered
          ? '#a1a1a6'
          : hoveredNode !== null
            ? '#4a4a4e'
            : '#8e8e93';
      ctx.fillText(label, node.x, labelY);
    }
  }, [hoveredNode, selectedNode, firingNode, adjacencyMap, reducedMotion]);

  // Custom link rendering with gradient colors
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

  // Dynamic particle config based on firing state
  const getParticleWidth = useCallback((link: any) => {
    if (firingNode && isLinkConnected(link, firingNode)) return 3;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return 2;
    return 1.5;
  }, [firingNode, hoveredNode, isLinkConnected]);

  const getParticleCount = useCallback((link: any) => {
    if (reducedMotion) return 0;
    if (firingNode && isLinkConnected(link, firingNode)) return 6;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return 4;
    return 2;
  }, [firingNode, hoveredNode, isLinkConnected, reducedMotion]);

  const getParticleSpeed = useCallback((link: any) => {
    if (firingNode && isLinkConnected(link, firingNode)) return 0.012;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return 0.006;
    return 0.003;
  }, [firingNode, hoveredNode, isLinkConnected]);

  const getParticleColor = useCallback((link: any) => {
    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
    const sourceNode = skillNodes.find(n => n.id === sourceId);
    if (!sourceNode) return 'rgba(255,255,255,0.1)';

    const color = categoryColors[sourceNode.category];
    if (firingNode && isLinkConnected(link, firingNode)) return `${color}cc`;
    if (hoveredNode && isLinkConnected(link, hoveredNode)) return `${color}88`;
    return `${color}44`;
  }, [firingNode, hoveredNode, isLinkConnected]);

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
        linkDirectionalParticles={getParticleCount}
        linkDirectionalParticleWidth={getParticleWidth}
        linkDirectionalParticleSpeed={getParticleSpeed}
        linkDirectionalParticleColor={getParticleColor}
        d3AlphaDecay={reducedMotion ? 1 : 0.01}
        d3AlphaMin={reducedMotion ? undefined : 0.005}
        d3VelocityDecay={0.4}
        cooldownTicks={reducedMotion ? 0 : Infinity}
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
