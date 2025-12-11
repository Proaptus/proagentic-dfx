'use client';

/**
 * MeshTriangle Component
 * Renders a single triangular mesh element for FEA stress visualization
 */

import type { MeshTriangleProps, TooltipData } from './stress-contour.types';

export function MeshTriangle({
  element,
  nodeMap,
  xScale,
  yScale,
  colorScale,
  onHover,
  isHovered,
}: MeshTriangleProps) {
  const [n1Id, n2Id, n3Id] = element.nodes;
  const n1 = nodeMap.get(n1Id);
  const n2 = nodeMap.get(n2Id);
  const n3 = nodeMap.get(n3Id);

  if (!n1 || !n2 || !n3) return null;

  const x1 = xScale(n1.r);
  const y1 = yScale(n1.z);
  const x2 = xScale(n2.r);
  const y2 = yScale(n2.z);
  const x3 = xScale(n3.r);
  const y3 = yScale(n3.z);

  const fillColor = colorScale(element.centroid_stress);
  const centroidX = (x1 + x2 + x3) / 3;
  const centroidY = (y1 + y2 + y3) / 3;

  const handleMouseEnter = () => {
    if (onHover) {
      onHover({
        element,
        stress: element.centroid_stress,
        region: element.region,
        x: centroidX,
        y: centroidY,
      } as TooltipData);
    }
  };

  const handleMouseLeave = () => {
    if (onHover) {
      onHover(null);
    }
  };

  return (
    <polygon
      points={`${x1},${y1} ${x2},${y2} ${x3},${y3}`}
      fill={fillColor}
      stroke={isHovered ? '#fff' : fillColor}
      strokeWidth={isHovered ? 2 : 0.5}
      strokeLinejoin="round"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        cursor: 'crosshair',
        transition: 'fill 0.4s ease-out, stroke 0.4s ease-out, stroke-width 0.1s ease',
      }}
    />
  );
}
