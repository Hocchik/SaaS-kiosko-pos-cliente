import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { MonthlySales } from '../../types';

interface Props {
  data: MonthlySales[];
  height: number;
}

export default function MonthlySalesChart({ data, height }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const container = ref.current.parentElement!;
    const width  = container.clientWidth;
    const margin = { top: 24, right: 24, bottom: 56, left: 70 };

    svg.attr('width', width).attr('height', height);

    const x = d3.scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)! * 1.1])
      .range([height - margin.bottom, margin.top]);

    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'bar-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', 'var(--primary)').attr('stop-opacity', 1);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', 'var(--primary)').attr('stop-opacity', 0.4);

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'var(--border)').attr('stroke-dasharray', '3,3'));

    svg.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.label)!)
      .attr('width', x.bandwidth())
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('rx', 4)
      .attr('fill', 'url(#bar-gradient)')
      .transition()
      .duration(600)
      .delay((_, i) => i * 60)
      .attr('y', (d) => y(d.total))
      .attr('height', (d) => height - margin.bottom - y(d.total));

    svg.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => x(d.label)! + x.bandwidth() / 2)
      .attr('y', (d) => y(d.total) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', 'var(--fg-muted)')
      .attr('font-size', '11px')
      .attr('opacity', 0)
      .text((d) => `S/${d.total.toFixed(0)}`)
      .transition()
      .duration(600)
      .delay((_, i) => i * 60 + 300)
      .attr('opacity', 1);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .call((g) => g.select('.domain').attr('stroke', 'var(--border)'))
      .call((g) =>
        g.selectAll('.tick text')
          .attr('fill', 'var(--fg-muted)')
          .attr('font-size', '11px')
          .attr('transform', 'rotate(-25)')
          .attr('text-anchor', 'end'),
      );

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `S/${d}`))
      .call((g) => g.select('.domain').attr('stroke', 'var(--border)'))
      .call((g) => g.selectAll('.tick text').attr('fill', 'var(--fg-muted)').attr('font-size', '11px'));
  }, [data, height]);

  return <svg ref={ref} className="w-full" />;
}
