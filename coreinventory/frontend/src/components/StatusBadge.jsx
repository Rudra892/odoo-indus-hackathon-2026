export default function StatusBadge({ status }) {
  const styles = {
    Draft: 'bg-gray-100 text-gray-600',
    Waiting: 'bg-yellow-100 text-yellow-700',
    Ready: 'bg-blue-100 text-blue-700',
    Done: 'bg-green-100 text-green-700',
    Canceled: 'bg-red-100 text-red-700',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
}
