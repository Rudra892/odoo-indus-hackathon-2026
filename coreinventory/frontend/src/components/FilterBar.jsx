export default function FilterBar({ filters, onChange, onApply, onReset }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {filters.map((filter) => (
        <select key={filter.name} value={filter.value} onChange={(e) => onChange(filter.name, e.target.value)}
          className="px-3 py-2 rounded-lg bg-white border border-card-border text-sm text-text-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors">
          <option value="">{filter.label}</option>
          {filter.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
      {onApply && (
        <button onClick={onApply} className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-colors">
          Apply Filters
        </button>
      )}
      {onReset && (
        <button onClick={onReset} className="px-4 py-2 rounded-lg border border-card-border text-sm font-medium text-text-secondary hover:bg-gray-50 transition-colors">
          Reset
        </button>
      )}
    </div>
  );
}
