import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { TopProduct } from '../../types';

interface Props {
  data: TopProduct[];
  height: number;
}

export default function TopProductsChart({ data, height }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const container = ref.current.parentElement!;
    const width  = container.clientWidth;
    const margin = { top: 16, right: 90, bottom: 16, left: 140 };

    // barHeight adapts to available space, capped at 36px
    const availableHeight = height - margin.top - margin.bottom;
    const barHeight = Math.min(36, Math.floor(availableHeight / data.length));

    const chartHeight = margin.top + margin.bottom + data.length * barHeight;
    // Use the larger of the two so bars don't overflow
    const svgHeight = Math.max(chartHeight, height);

    svg.attr('width', width).attr('height', svgHeight);

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.totalQuantity)! * 1.1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(data.map((d) => d.productName))
      .range([margin.top, margin.top + data.length * barHeight])
      .padding(0.25);

    const color = d3.scaleSequential()
      .domain([0, data.length - 1])
      .interpolator(d3.interpolateWarm);

    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', margin.left)
      .attr('y', (d) => y(d.productName)!)
      .attr('height', y.bandwidth())
      .attr('rx', 4)
      .attr('fill', (_, i) => color(i))
      .attr('opacity', 0.85)
      .attr('width', 0)
      .transition()
      .duration(700)
      .delay((_, i) => i * 70)
      .attr('width', (d) => x(d.totalQuantity) - margin.left);

    svg.selectAll('.qty-label')
      .data(data)
      .join('text')
      .attr('class', 'qty-label')
      .attr('x', (d) => x(d.totalQuantity) + 6)
      .attr('y', (d) => y(d.productName)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('fill', 'var(--fg)')
      .attr('font-size', '12px')
      .attr('font-weight', '600')
      .attr('opacity', 0)
      .text((d) => `${d.totalQuantity} uds`)
      .transition()
      .duration(400)
      .delay((_, i) => i * 70 + 400)
      .attr('opacity', 1);

    svg.selectAll('.name-label')
      .data(data)
      .join('text')
      .attr('class', 'name-label')
      .attr('x', margin.left - 8)
      .attr('y', (d) => y(d.productName)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .attr('fill', 'var(--fg-muted)')
      .attr('font-size', '12px')
      .text((d) => d.productName.length > 18 ? d.productName.slice(0, 18) + '…' : d.productName);
  }, [data, height]);

  return <svg ref={ref} className="w-full" />;
}
