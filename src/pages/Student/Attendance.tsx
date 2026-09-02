import React from 'react';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, TrendingUp, UserCheck, KeyRound } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

export default function StudentAttendance() {
  const [monthOffset, setMonthOffset] = React.useState(0);
  const [token, setToken] = React.useState('');
  const { students, attendance, redeemAttendanceToken, attendanceTokens } = useDataStore();
  const user = useAuthStore((state) => state.user);
  const showToast = useToastStore((state) => state.showToast);

  const myStudent = React.useMemo(
    () => students.find((s) => s.id === user?.id || s.email === user?.email || s.name === user?.name),
    [students, user?.email, user?.id, user?.name],
  );

  const today = new Date().toISOString().split('T')[0];
  const myAttendance = attendance.filter((a) => a.targetId === myStudent?.id);
  const myPresent = myAttendance.filter((a) => a.status === 'Present').length;
  const myLate = myAttendance.filter((a) => a.status === 'Late').length;
  const myAbsent = myAttendance.filter((a) => a.status === 'Absent').length;
  const attendanceRate = myAttendance.length > 0 ? Math.round((myPresent / myAttendance.length) * 100) : 0;

  const handleRedeem = () => {
    if (!myStudent) {
      showToast({ title: 'Student profile not found', description: 'Could not locate your student record to mark attendance.', variant: 'warning' });
      return;
    }
    if (!token.trim()) {
      showToast({ title: 'Enter a token', description: 'Type the token code shared by your lecturer.', variant: 'warning' });
      return;
    }
    const result = redeemAttendanceToken(token, {
      targetId: myStudent.id,
      targetName: myStudent.name,
      date: today,
      classId: myStudent.class,
    });
    showToast(
      result.ok
        ? { title: 'Attendance marked', description: result.message, variant: 'success' }
        : { title: 'Token rejected', description: result.message, variant: 'error' },
    );
    if (result.ok) setToken('');
  };

  const myActiveTokens = attendanceTokens.filter((t) => Date.now() <= t.expiresAt);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const now = new Date();
  const currentMonthIndex = (now.getMonth() + monthOffset + 12) % 12;
  const currentYear = now.getFullYear() + Math.floor((now.getMonth() + monthOffset) / 12);
  const currentMonth = `${months[currentMonthIndex]} ${currentYear}`;
  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const attendanceByDate = myAttendance.reduce((map, a) => {
    map[a.date] = a.status;
    return map;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Attendance</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track your daily presence and academic consistency.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 shadow-sm">
          <button onClick={() => setMonthOffset(m => m - 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold min-w-[100px] text-center">{currentMonth}</span>
          <button onClick={() => setMonthOffset(m => m + 1)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Attendance Rate" 
          value={`${attendanceRate}%`} 
          icon={TrendingUp} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="Days Present" 
          value={myPresent.toString()} 
          icon={CheckCircle} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="Days Absent" 
          value={myAbsent.toString()} 
          icon={XCircle} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
        <KPICard 
          title="Late Arrivals" 
          value={myLate.toString()} 
          icon={Clock} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Token Entry Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl border border-indigo-700 shadow-xl shadow-indigo-900/20 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="p-3 bg-white/20 rounded-2xl">
              <KeyRound className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-white">Mark Attendance with a Token</h3>
              <p className="text-indigo-100 text-xs mt-0.5">
                Your lecturer shares a code during lecture. Enter it below to mark today's attendance as present.
              </p>
              {myActiveTokens.length > 0 && (
                <p className="text-indigo-200 text-[11px] font-bold mt-1 uppercase tracking-widest">
                  {myActiveTokens.length} active token{myActiveTokens.length > 1 ? 's' : ''} available
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              placeholder="Enter token code"
              className="flex-1 px-4 py-3 bg-white/95 dark:bg-slate-900 border-2 border-transparent focus:border-white rounded-xl font-mono font-bold text-lg tracking-[0.3em] text-indigo-800 placeholder:text-indigo-300 outline-none uppercase"
              style={{ minWidth: '180px' }}
            />
            <button
              onClick={handleRedeem}
              className="px-6 py-3 bg-white text-indigo-700 rounded-xl text-sm font-black hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Mark Present
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Monthly Calendar</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Present</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Absent</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pb-2">
                    {day}
                  </div>
                ))}
                {days.map(day => {
                  const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const status = attendanceByDate[dateStr];
                  const isWeekend = day % 7 === 6 || day % 7 === 0;
                  const isAbsent = status === 'Absent';
                  const isLate = status === 'Late';
                  const nowDate = new Date();
                  const isFuture = (currentYear === nowDate.getFullYear() && currentMonthIndex === nowDate.getMonth() && day > nowDate.getDate()) || (currentYear === nowDate.getFullYear() && currentMonthIndex > nowDate.getMonth()) || currentYear > nowDate.getFullYear();
                  
                  return (
                    <div 
                      key={day}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center border transition-all relative group cursor-pointer",
                        isWeekend ? "bg-slate-50 dark:bg-slate-800/50 border-transparent text-slate-400" :
                        isFuture ? "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300" :
                        isAbsent ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-600 shadow-sm shadow-rose-100" :
                        isLate ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-600 shadow-sm shadow-amber-100" :
                        "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-600 shadow-sm shadow-emerald-100"
                      )}
                    >
                      <span className="text-xs font-bold">{day}</span>
                      {!isFuture && !isWeekend && (
                        <div className="mt-1">
                          {isAbsent ? <XCircle className="w-3 h-3" /> : 
                           isLate ? <Clock className="w-3 h-3" /> : 
                           status ? <CheckCircle className="w-3 h-3" /> : null}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Attendance Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Total Records</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{myAttendance.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase">Days Attended</span>
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{myPresent + myLate}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-rose-50 dark:bg-rose-900/20 rounded-xl">
                <span className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase">Days Missed</span>
                <span className="text-sm font-bold text-rose-700 dark:text-rose-400">{myAbsent}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase">Late Arrivals</span>
                <span className="text-sm font-bold text-amber-700 dark:text-amber-400">{myLate}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl text-white shadow-xl shadow-blue-900/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-bold">Perfect Attendance?</h3>
            </div>
            <p className="text-blue-100 text-xs leading-relaxed mb-6">
              Maintain 100% attendance this month to earn the "Academic Consistency" badge on your profile!
            </p>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div className="bg-white h-full rounded-full" style={{ width: `${attendanceRate}%` }}></div>
            </div>
            <p className="text-[10px] text-blue-200 font-bold mt-2 uppercase tracking-widest">{attendanceRate}% Progress</p>
          </div>
        </div>
      </div>
    </div>
  );
}
