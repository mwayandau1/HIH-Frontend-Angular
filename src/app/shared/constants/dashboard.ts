import { DashboardNavigation } from '@shared/models/dashboard';
import { ClipboardCheck, Home, ReceiptText, Search, Settings, Users } from 'lucide-angular';

export const adminDashboardNavigation: DashboardNavigation[] = [
  {
    label: 'Dashboard',
    icon: Home,
    route: '/admin',
  },
  {
    label: 'Audtit Logs',
    icon: ReceiptText,
    route: '/admin/logs',
  },
  {
    label: 'User Management',
    icon: Users,
    route: '/admin/users',
  },
  {
    label: 'System Settings',
    icon: Settings,
    route: '/admin/settings',
  },
  {
    label: 'Compliance',
    icon: ClipboardCheck,
    route: '/admin/compliance',
  },
];

export const providerDashboardNavigation: DashboardNavigation[] = [
  {
    label: 'Dashboard',
    icon: Home,
    route: '/provider',
  },
  {
    label: 'Patients',
    icon: Search,
    route: '/provider/patients',
  },
  {
    label: 'Settings',
    icon: Settings,
    route: '/provider/settings',
  },
];
