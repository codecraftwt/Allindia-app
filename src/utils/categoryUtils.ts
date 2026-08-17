export const getCategoryColor = (name: string, isDark?: boolean) => {
  if (isDark) {
    return 'rgba(59, 130, 246, 0.2)';
  }
  return '#BFDBFE';
};

export const getCategoryIcon = (name: string) => {
  if (!name) return 'briefcase';
  const n = name.toLowerCase();
  
  if (n.includes('automobile')) return 'car';
  if (n.includes('banking')) return 'university';
  if (n.includes('bpm') || n.includes('bpo')) return 'headphones';
  if (n.includes('engineering')) return 'gears';
  if (n.includes('internet')) return 'globe';
  if (n.includes('textile')) return 'scissors';
  if (n.includes('beauty')) return 'magic';
  if (n.includes('construction')) return 'building';
  if (n.includes('content') || n.includes('journalism')) return 'pencil';
  if (n.includes('data science') || n.includes('analytics')) return 'database';
  if (n.includes('delivery') || n.includes('driver')) return 'truck';
  if (n.includes('design') || n.includes('architecture')) return 'paint-brush';
  if (n.includes('hardware') || n.includes('network')) return 'server';
  if (n.includes('fashion') || n.includes('tailoring')) return 'scissors';
  if (n.includes('healthcare') || n.includes('doctor') || n.includes('hospital')) return 'user-md';
  if (n.includes('hospitality') || n.includes('restaurant') || n.includes('tourism')) return 'coffee';
  if (n.includes('house help') || n.includes('worker')) return 'home';
  if (n.includes('human resources') || n.includes('hr')) return 'users';
  if (n.includes('it services') || n.includes('development')) return 'code';
  if (n.includes('labour') || n.includes('factory')) return 'industry';
  if (n.includes('legal')) return 'balance-scale';
  if (n.includes('marketing')) return 'bullhorn';
  if (n.includes('media') || n.includes('entertainment')) return 'film';
  if (n.includes('operations')) return 'cogs';
  if (n.includes('purchase') || n.includes('supply chain')) return 'shopping-cart';
  if (n.includes('sales')) return 'line-chart';
  if (n.includes('security')) return 'shield';
  if (n.includes('sport') || n.includes('fitness')) return 'heartbeat';
  if (n.includes('technician') || n.includes('vehicle')) return 'wrench';
  return 'briefcase';
};
