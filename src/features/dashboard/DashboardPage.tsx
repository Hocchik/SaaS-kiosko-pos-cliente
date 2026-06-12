import useSWR from 'swr';
import { statisticsApi } from '../../api/statistics.api';
import Spinner from '../../components/ui/Spinner';
import MonthlySalesChart from './MonthlySalesChart';
import DailySalesAreaChart from './DailySalesAreaChart';
import TopProductsChart from './TopProductsChart';
import CategoryDonutChart from './CategoryDonutChart';

const CHART_HEIGHT = 272;

export default function DashboardPage() {
  const { data: stats, isLoading } = useSWR('statistics', statisticsApi.get);

  if (isLoading || !stats) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }

  const kpis = [
    { label: 'Total Ventas',      value: `S/${stats.totalSales.toFixed(2)}`,        color: 'var(--primary)' },
    { label: 'Deuda Total',       value: `S/${stats.totalDebt.toFixed(2)}`,          color: 'var(--danger)' },
    { label: 'Clientes Deudores', value: stats.totalDebtorClients.toString(),        color: 'var(--warning)' },
    { label: 'Nº Ventas',         value: stats.totalSalesCount.toString(),           color: 'var(--accent)' },
    { label: 'Productos',         value: stats.totalProductsCount.toString(),        color: 'var(--primary)' },
    { label: 'Clientes',          value: stats.totalClientsCount.toString(),         color: 'var(--accent)' },
    { label: 'Ticket Promedio',   value: `S/${stats.averageTicket.toFixed(2)}`,      color: 'var(--primary)' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>
        Dashboard
      </h1>

      {/* KPI Cards — 4 col máximo para que respiren */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-1.5 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs font-medium" style={{ color: 'var(--fg-muted)' }}>{kpi.label}</p>
            <p className="text-xl font-bold" style={{ color: kpi.color, fontFamily: 'var(--font-heading)' }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartCard title="Ventas por Mes" subtitle="Ingresos mensuales" height={CHART_HEIGHT}>
          <MonthlySalesChart data={stats.salesByMonth} height={CHART_HEIGHT} />
        </ChartCard>

        <ChartCard title="Ventas Últimos 30 Días" subtitle="Tendencia diaria" height={CHART_HEIGHT}>
          <DailySalesAreaChart data={stats.salesLast30Days} height={CHART_HEIGHT} />
        </ChartCard>

        <ChartCard title="Top Productos" subtitle="Por cantidad vendida" height={CHART_HEIGHT}>
          <TopProductsChart data={stats.topProducts} height={CHART_HEIGHT} />
        </ChartCard>

        <ChartCard title="Ventas por Categoría" subtitle="Distribución de ingresos" height={CHART_HEIGHT}>
          <CategoryDonutChart data={stats.salesByCategory} height={CHART_HEIGHT} />
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  height,
  children,
}: {
  title: string;
  subtitle: string;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{title}</h3>
        <p className="text-xs mt-0.5" style={{ color: 'var(--fg-muted)' }}>{subtitle}</p>
      </div>
      <div style={{ height: `${height}px`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}
