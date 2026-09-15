import React, { useState } from 'react';

export interface PieChartItem {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

interface PieChartProps {
  title: string;
  items: PieChartItem[];
  centerLabel?: string;
  centerSublabel?: string;
  emptyMessage?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  items,
  centerLabel,
  centerSublabel,
  emptyMessage = 'No data to display',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const validItems = items.filter((item) => item.value > 0);
  const totalValue = validItems.reduce((acc, item) => acc + item.value, 0);

  // SVG Coordinates calculation for pie slices
  const radius = 80;
  const innerRadius = 50; // Donut hole
  const centerX = 100;
  const centerY = 100;

  // Compute slice angles
  let cumulativeAngle = -Math.PI / 2; // Start from top (12 o'clock)

  const slices = validItems.map((item, index) => {
    const sliceAngle = (item.value / totalValue) * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + sliceAngle;
    cumulativeAngle += sliceAngle;

    // Outer arc
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    // Inner arc
    const x3 = centerX + innerRadius * Math.cos(endAngle);
    const y3 = centerY + innerRadius * Math.sin(endAngle);
    const x4 = centerX + innerRadius * Math.cos(startAngle);
    const y4 = centerY + innerRadius * Math.sin(startAngle);

    const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    const percentage = Math.round((item.value / totalValue) * 100);

    return {
      pathData,
      item,
      percentage,
      index,
    };
  });

  return (
    <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex flex-col justify-between">
      <h3 className="text-sm font-bold text-white tracking-tight mb-4 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs font-mono font-normal text-slate-400">
          Total: {totalValue}
        </span>
      </h3>

      {totalValue === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-800 mx-auto mb-2 flex items-center justify-center text-slate-600 font-mono text-[10px]">
            0%
          </div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Round Pie / Donut SVG */}
          <div className="relative w-44 h-44 shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform transition-transform">
              {slices.map((slice) => {
                const isHovered = hoveredIndex === slice.index;
                return (
                  <path
                    key={slice.index}
                    d={slice.pathData}
                    fill={slice.item.color}
                    className="cursor-pointer transition-all duration-200 hover:opacity-90"
                    style={{
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: `${centerX}px ${centerY}px`,
                      filter: isHovered ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' : 'none',
                    }}
                    onMouseEnter={() => setHoveredIndex(slice.index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                );
              })}
            </svg>

            {/* Center Donut Hole Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
              {hoveredIndex !== null && slices[hoveredIndex] ? (
                <>
                  <span className="text-xl font-extrabold text-white font-mono leading-none">
                    {slices[hoveredIndex].percentage}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium line-clamp-1 px-2">
                    {slices[hoveredIndex].item.value} {slices[hoveredIndex].item.value === 1 ? 'co.' : 'cos.'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-xl font-extrabold text-white font-mono leading-none">
                    {centerLabel || totalValue}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {centerSublabel || 'Companies'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Color-Coded Legend */}
          <div className="flex-1 w-full space-y-2">
            {slices.map((slice) => {
              const isHovered = hoveredIndex === slice.index;
              return (
                <div
                  key={slice.index}
                  onMouseEnter={() => setHoveredIndex(slice.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isHovered ? 'bg-[#0B0F19] border border-slate-700' : 'hover:bg-[#0B0F19]/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: slice.item.color }}
                    />
                    <span className="text-xs font-semibold text-slate-200">
                      {slice.item.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-xs text-slate-400">
                      {slice.item.value}
                    </span>
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {slice.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
