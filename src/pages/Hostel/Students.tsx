import React, { useMemo, useState } from 'react';
import { Search, Filter, Users, Home, UserCheck, ShieldAlert, ChevronRight, Mail } from 'lucide-react';
import { cn } from '@/utils';
import { KPICard } from '@/components/ui/KPICard';
import { useDataStore } from '@/store/useDataStore';
import { useToastStore } from '@/store/useToastStore';

export default function WardenStudents() {
  const { students } = useDataStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'All Blocks' | 'Block A' | 'Block B' | 'Block C'>('All Blocks');
  const showToast = useToastStore((state) => state.showToast);

  const blockCycle = ['Block A', 'Block B', 'Block C'] as const;

  const hostelStudents = useMemo(
    () =>
      students.slice(0, 15).map((student, index) => {
        const block = blockCycle[index % blockCycle.length];
        const roomNumber = 101 + index;

        return {
          ...student,
          block,
          room: `${block} - ${roomNumber}`,
          feesStatus: index % 4 === 0 ? 'Pending' : 'Cleared',
        };
      }),
    [students]
  );

  const filteredStudents = hostelStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.regNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.room.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBlock = selectedBlock === 'All Blocks' || student.block === selectedBlock;

    return matchesSearch && matchesBlock;
  });

  const pendingCount = filteredStudents.filter((student) => student.feesStatus === 'Pending').length;

  const cycleBlockFilter = () => {
    setSelectedBlock((current) => {
      const order: Array<'All Blocks' | 'Block A' | 'Block B' | 'Block C'> = ['All Blocks', 'Block A', 'Block B', 'Block C'];
      const nextIndex = (order.indexOf(current) + 1) % order.length;
      const nextValue = order[nextIndex];

      showToast({
        title: 'Resident filter updated',
        description: `Showing ${nextValue.toLowerCase()}.`,
        variant: 'info',
      });

      return nextValue;
    });
  };

  const handleNotifyParents = () => {
    const recipients = pendingCount || filteredStudents.length;

    showToast({
      title: 'Parent notice queued',
      description:
        pendingCount > 0
          ? `Prepared hostel and fee reminder notices for ${recipients} resident families.`
          : `Prepared general hostel update for ${recipients} resident families.`,
      variant: 'success',
    });
  };

  const handleViewStudent = (studentName: string, room: string, feesStatus: string) => {
    showToast({
      title: 'Student profile',
      description: `Viewing detailed profile for ${studentName}.`,
      variant: 'info',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hostel Residents</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage student boarding records and safety status.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleNotifyParents}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Mail className="w-4 h-4" />
            Notify Parents
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Residents" 
          value="248" 
          icon={Users} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
        />
        <KPICard 
          title="In Hostel" 
          value="242" 
          icon={UserCheck} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
        />
        <KPICard 
          title="On Leave" 
          value="6" 
          icon={Home} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
        />
        <KPICard 
          title="Fee Defaulters" 
          value="14" 
          icon={ShieldAlert} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/50">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search resident..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-blue-500 transition-all dark:text-white"
            />
          </div>
          <button
            onClick={cycleBlockFilter}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            <Filter className="w-4 h-4" />
            {selectedBlock}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                <th className="py-4 px-6">Student Name</th>
                <th className="py-4 px-6">Class</th>
                <th className="py-4 px-6">Room / Block</th>
                <th className="py-4 px-6">Fee Status</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.map((student, i) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${student.name.replace(' ', '+')}&background=eff6ff&color=2563eb&bold=true`} 
                        className="w-8 h-8 rounded-lg"
                        alt={student.name}
                      />
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{student.name}</p>
                        <p className="text-[10px] font-mono font-bold text-slate-400">{student.regNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-600 dark:text-slate-400">{student.class}</td>
                  <td className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">{student.room}</td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      student.feesStatus === 'Cleared' ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                    )}>
                      {student.feesStatus}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <button
                      onClick={() => handleViewStudent(student.name, student.room, student.feesStatus)}
                      className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredStudents.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            No residents match the current search and block filter.
          </div>
        ) : null}
      </div>
    </div>
  );
}
