import React from 'react';
import { motion } from 'framer-motion';
import { Bus, Map, Users, AlertTriangle, MapPin, CheckCircle } from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { AnimatedPage, AnimatedButton, StaggerContainer, StaggerItem } from '@/components/ui/motion';
import { useNavigate } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { resolveSchoolProfile, getPortalLevelLabels } from '@/utils/schoolProfile';

export default function TransportDashboard() {
  const navigate = useNavigate();
  const showToast = useToastStore((state) => state.showToast);
  const schools = useDataStore((s) => s.schools);
  const user = useAuthStore((state) => state.user);
  const schoolProfile = resolveSchoolProfile(user, schools);
  const labels = getPortalLevelLabels(schoolProfile.portalLevel);

  const handleQuickAction = (action: 'route' | 'vehicle' | 'student' | 'maintenance') => {
    if (action === 'route') {
      navigate('/transport/routes');
      return;
    }

    if (action === 'vehicle') {
      navigate('/transport/vehicles');
      return;
    }

    if (action === 'student') {
      navigate('/transport/students');
      return;
    }

    if (action === 'maintenance') {
      navigate('/transport/vehicles');
      return;
    }
  };

  const routeStatuses = [
    { route: 'Route A - Downtown', bus: 'Bus 01', driver: 'Mark Johnson', status: 'On Time', stops: '4/8', color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { route: 'Route B - Westside', bus: 'Bus 05', driver: 'Sarah Smith', status: 'Delayed 5m', stops: '2/6', color: 'text-amber-600', bg: 'bg-amber-100' },
    { route: 'Route C - North Hills', bus: 'Bus 12', driver: 'David Lee', status: 'Completed', stops: '10/10', color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const maintenanceAlerts = [
    { bus: 'Bus 08', issue: 'Engine Oil Change Due', urgency: 'Medium' },
    { bus: 'Bus 15', issue: 'Brake Pad Replacement', urgency: 'High' },
    { bus: 'Bus 03', issue: 'AC Servicing', urgency: 'Low' },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="flex justify-between items-end"
        >
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome back, Transport Officer 👋</h1>
            <p className="text-slate-500 text-sm mt-1">Here's the fleet and route overview.</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <StaggerContainer staggerDelay={0.08} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Total Vehicles"
              value="24"
              icon={Bus}
              iconBgClass="bg-blue-50"
              iconColorClass="text-blue-600"
              trend={{ value: 0, label: "Active Fleet" }}
              to="/transport/vehicles"
              delay={0}
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Active Routes"
              value="18"
              icon={Map}
              iconBgClass="bg-indigo-50"
              iconColorClass="text-indigo-600"
              to="/transport/routes"
              delay={0.08}
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title={`${labels.learnerPlural} Transported`}
              value="856"
              icon={Users}
              iconBgClass="bg-emerald-50"
              iconColorClass="text-emerald-600"
              to="/transport/students"
              delay={0.16}
            />
          </StaggerItem>
          <StaggerItem variant="fadeUp">
            <KPICard
              title="Maintenance Alerts"
              value="3"
              icon={AlertTriangle}
              iconBgClass="bg-rose-50"
              iconColorClass="text-rose-600"
              trend={{ value: 0, label: "Needs attention" }}
              to="/transport/vehicles"
              delay={0.24}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Routes */}
          <AnimatedCard delay={0.1} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Live Routes Status</h3>
              <AnimatedButton>
                <button
                  onClick={() => navigate('/transport/routes')}
                  className="text-sm text-blue-600 font-medium hover:text-blue-700"
                >
                  View Map
                </button>
              </AnimatedButton>
            </div>
            <div className="space-y-4">
              {routeStatuses.map((route, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 + i * 0.1 }}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-slate-100 rounded-lg hover:border-blue-100 transition-colors gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 text-slate-600 rounded-lg">
                      <Bus className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{route.route}</h4>
                      <p className="text-xs text-slate-500 mt-1">{route.bus} • Driver: {route.driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 sm:justify-end">
                    <div className="text-center">
                      <p className="text-xs text-slate-500 mb-1">Stops Completed</p>
                      <p className="font-semibold text-slate-900">{route.stops}</p>
                    </div>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${route.bg} ${route.color}`}
                    >
                      {route.status}
                    </motion.span>
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatedCard>

          {/* Maintenance & Quick Actions */}
          <div className="space-y-6">
            <AnimatedCard delay={0.15} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Maintenance Alerts</h3>
              <div className="space-y-3">
                {maintenanceAlerts.map((alert, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, delay: 0.25 + i * 0.1 }}
                    className="flex items-start gap-3 p-3 border border-slate-100 rounded-lg bg-slate-50"
                  >
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${alert.urgency === 'High' ? 'text-rose-500' : alert.urgency === 'Medium' ? 'text-amber-500' : 'text-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{alert.bus}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{alert.issue}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedCard>

            <AnimatedCard delay={0.2} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <StaggerContainer staggerDelay={0.06} className="grid grid-cols-2 gap-3">
                <StaggerItem variant="scaleIn">
                  <AnimatedButton>
                    <button
                      onClick={() => handleQuickAction('route')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2 w-full"
                    >
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-medium text-slate-700">Add Route</span>
                    </button>
                  </AnimatedButton>
                </StaggerItem>
                <StaggerItem variant="scaleIn">
                  <AnimatedButton>
                    <button
                      onClick={() => handleQuickAction('vehicle')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2 w-full"
                    >
                      <Bus className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs font-medium text-slate-700">Add Vehicle</span>
                    </button>
                  </AnimatedButton>
                </StaggerItem>
                <StaggerItem variant="scaleIn">
                  <AnimatedButton>
                    <button
                      onClick={() => handleQuickAction('student')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2 w-full"
                    >
                      <Users className="w-5 h-5 text-purple-600" />
                      <span className="text-xs font-medium text-slate-700">Assign {labels.learnerSingular}</span>
                    </button>
                  </AnimatedButton>
                </StaggerItem>
                <StaggerItem variant="scaleIn">
                  <AnimatedButton>
                    <button
                      onClick={() => handleQuickAction('maintenance')}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors gap-2 w-full"
                    >
                      <CheckCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-xs font-medium text-slate-700">Log Maintenance</span>
                    </button>
                  </AnimatedButton>
                </StaggerItem>
              </StaggerContainer>
            </AnimatedCard>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
