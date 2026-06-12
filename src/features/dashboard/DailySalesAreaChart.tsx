import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import type { DailySales } from '../../types';

interface Props {
  data: DailySales[];
  height: number;
}

export default function DailySalesAreaChart({ data, height }: Props) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current || data.length === 0) return;

    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();

    const container = ref.current.parentElement!;
    const width  = container.clientWidth;
    const margin = { top: 24, right: 24, bottom: 40, left: 70 };

    svg.attr('width', width).attr('height', height);

    const parseDate = (s: string) => new Date(s + 'T00:00:00');

    const x = d3.scaleTime()
      .domain(d3.extent(data, (d) => parseDate(d.date)) as [Date, Date])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.total)! * 1.15])
      .range([height - margin.bottom, margin.top]);

    const defs = svg.append('defs');
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'area-gradient')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    areaGradient.append('stop').attr('offset', '0%').attr('stop-color', 'var(--accent)').attr('stop-opacity', 0.3);
    areaGradient.append('stop').attr('offset', '100%').attr('stop-color', 'var(--accent)').attr('stop-opacity', 0.02);

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat(() => ''))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'var(--border)').attr('stroke-dasharray', '3,3'));

    const area = d3.area<DailySales>()
      .x((d) => x(parseDate(d.date)))
      .y0(height - margin.bottom)
      .y1((d) => y(d.total))
      .curve(d3.curveMonotoneX);

    svg.append('path').datum(data).attr('fill', 'url(#area-gradient)').attr('d', area);

    const line = d3.line<DailySales>()
      .x((d) => x(parseDate(d.date)))
      .y((d) => y(d.total))
      .curve(d3.curveMonotoneX);

    const path = svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--accent)')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    const totalLength = path.node()!.getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(1200)
      .attr('stroke-dashoffset', 0);

    svg.selectAll('.dot')
      .data(data.filter((d) => d.total > 0))
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(parseDate(d.date)))
      .attr('cy', (d) => y(d.total))
      .attr('r', 3.5)
      .attr('fill', 'var(--accent)')
      .attr('stroke', 'var(--bg-surface)')
      .attr('stroke-width', 2)
      .attr('opacity', 0)
      .transition()
      .duration(400)
      .delay(1200)
      .attr('opacity', 1);

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(7).tickFormat((d) => d3.timeFormat('%d/%m')(d as Date)))
      .call((g) => g.select('.domain').attr('stroke', 'var(--border)'))
      .call((g) => g.selectAll('.tick text').attr('fill', 'var(--fg-muted)').attr('font-size', '11px'));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `S/${d}`))
      .call((g) => g.select('.domain').attr('stroke', 'var(--border)'))
      .call((g) => g.selectAll('.tick text').attr('fill', 'var(--fg-muted)').attr('font-size', '11px'));
  }, [data, height]);

  return <svg ref={ref} className="w-full" />;
}
