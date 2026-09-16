import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import './Alert.css';

const ICONS = {
  error: AlertCircle,
  success: CheckCircle,
  warning: AlertTriangle,
  info: Info,
};

export default function Alert({ variant = 'info', children }) {
  const Icon = ICONS[variant] || Info;
  return (
    <div className={`alert alert-${variant}`} role="alert">
      <Icon size={18} className="alert-icon" />
      <span>{children}</span>
    </div>
  );
}
