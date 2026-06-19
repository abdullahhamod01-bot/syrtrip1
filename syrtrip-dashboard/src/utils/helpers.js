export const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('ar-SY');
};

export const formatCurrency = (amount) => {
  if (!amount) return '0 ل.س';
  return `${amount.toLocaleString()} ل.س`;
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'warning',
    confirmed: 'success',
    cancelled: 'error',
  };
  return colors[status] || 'default';
};

export const getStatusLabel = (status) => {
  const labels = {
    pending: 'معلق',
    confirmed: 'مؤكد',
    cancelled: 'ملغي',
  };
  return labels[status] || status;
};