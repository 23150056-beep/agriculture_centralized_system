import React from 'react';

const statusConfig = {
  in_stock: { label: 'In Stock', classes: 'bg-green-100 text-green-700' },
  low_stock: { label: 'Low Stock', classes: 'bg-amber-100 text-amber-700' },
  out_of_stock: { label: 'Out of Stock', classes: 'bg-red-100 text-red-700' },
  expired: { label: 'Expired', classes: 'bg-slate-100 text-slate-700' }
};

export default function StockBadge({ status }) {
  const config = statusConfig[status] || statusConfig.out_of_stock;
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      {config.label}
    </span>
  );
}
