const colors = {
  hadir: { bg: '#DCFCE7', text: '#166534' },
  telat: { bg: '#FEF3C7', text: '#92400E' },
  'tidak hadir': { bg: '#FEE2E2', text: '#991B1B' },
  tidak_valid: { bg: '#FEE2E2', text: '#991B1B' },
};

function StatusBadge({ status }) {
  const c = colors[status] || { bg: '#F3F4F6', text: '#6B7280' };
  const label = status === 'tidak_valid' ? 'Tidak Valid' : status;

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '4px 12px',
        borderRadius: '999px',
        fontSize: '13px',
        fontWeight: '600',
        background: c.bg,
        color: c.text,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </span>
  );
}

export default StatusBadge;
