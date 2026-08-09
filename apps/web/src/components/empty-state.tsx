import { Package, Star, AlertCircle } from 'lucide-react';

interface EmptyStateProps {
  icon?: 'package' | 'star' | 'alert';
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon = 'package', title, description, action }: EmptyStateProps) {
  const icons = {
    package: Package,
    star: Star,
    alert: AlertCircle,
  };
  const Icon = icons[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="p-4 rounded-2xl bg-surface mb-4">
        <Icon className="w-8 h-8 text-text-muted" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary text-center max-w-md mb-6">{description}</p>
      {action}
    </div>
  );
}
