export default function KPICard({ title, value, subtitle, icon: Icon, color }) {
  const colorMap = {
    blue: { border: 'border-l-primary', iconBg: 'bg-blue-100 text-primary' },
    orange: { border: 'border-l-warning', iconBg: 'bg-orange-100 text-warning' },
    red: { border: 'border-l-danger', iconBg: 'bg-red-100 text-danger' },
    green: { border: 'border-l-success', iconBg: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-glass', bg: 'bg-white' },
    purple: { border: 'border-l-primary', iconBg: 'bg-gradient-to-br from-indigo-500 to-primary-dark text-white shadow-glass', bg: 'bg-white' },
    teal: { border: 'border-l-info', iconBg: 'bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-glass', bg: 'bg-white' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-2xl border border-card-border p-6 h-[130px] flex items-center gap-5 shadow-sm hover:shadow-md hover:-translate-y-1 ${c.bg} transition-all duration-300 relative overflow-hidden group`}>
      <div className={`w-14 h-14 rounded-2xl ${c.iconBg} flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110`}>
        <Icon size={22} />
      </div>
      <div className="flex-1 z-10">
        <p className="text-xs font-semibold text-text-label uppercase tracking-wider mb-1 mt-1">{title}</p>
        <p className="text-3xl font-extrabold text-text-primary mb-1 tracking-tight">{value}</p>
        <p className="text-[13px] text-text-secondary font-medium">{subtitle}</p>
      </div>
      {/* Decorative background blob */}
      <div className={`absolute -right-8 -bottom-8 w-32 h-32 rounded-full opacity-[0.03] transition-transform group-hover:scale-150 ${c.iconBg.split(' ')[0]}`}></div>
    </div>
  );
}
