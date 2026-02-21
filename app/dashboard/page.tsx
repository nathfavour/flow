import { Dashboard } from '@/components/dashboard';
import SudoGuard from '@/components/common/SudoGuard';

export default function DashboardPage() {
  return (
    <SudoGuard>
      <Dashboard />
    </SudoGuard>
  );
}
