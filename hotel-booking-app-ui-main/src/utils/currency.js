const INR_FORMATTER = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(value) {
  const amount = Number(value ?? 0);

  if (Number.isNaN(amount)) {
    return '₹0';
  }

  return INR_FORMATTER.format(amount);
}