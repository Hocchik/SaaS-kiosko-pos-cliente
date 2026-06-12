import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import Toaster from '../ui/Toaster';

export default function AppLayout() {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar />
        <main
          className="flex-1 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg)', padding: '1.75rem 2rem' }}
        >
          <div className="page-enter mx-auto w-full max-w-350">
            <Outlet />
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  );
}
