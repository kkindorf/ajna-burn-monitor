import { Dashboard } from './components/organisms/Dashboard.js';
import { DashboardError } from './components/organisms/DashboardError.js';
import { DashboardLoading } from './components/organisms/DashboardLoading.js';
import { useBurnDashboard } from './hooks/useBurnDashboard.js';

export default function App() {
  const dashboard = useBurnDashboard();

  if (dashboard.status === 'loading') {
    return <DashboardLoading />;
  }

  if (dashboard.status === 'error') {
    return (
      <DashboardError message={dashboard.message} onRetry={dashboard.onRetry} />
    );
  }

  return <Dashboard dashboard={dashboard} />;
}
