export const colors = {
  primary: '#0E7C7B',
  gradientStart: '#12958F',
  gradientEnd: '#063B3F',
  primaryDark: '#095F5E',
  background: '#F4F6F8',
  card: '#FFFFFF',
  text: '#1B2B34',
  muted: '#6B7C85',
  border: '#DDE3E8',
  danger: '#C0392B',
  success: '#2E7D32',
  warning: '#B8860B',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24 };

export const statusColor = (status) => {
  switch (status) {
    case 'Confirmed': return colors.primary;
    case 'Completed': return colors.success;
    case 'Rejected':
    case 'Cancelled': return colors.danger;
    default: return colors.warning; // Pending
  }
};

// One card look used everywhere, so every screen matches.
export const shadow = {
  shadowColor: '#0B2B2A',
  shadowOpacity: 0.07,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const radius = { sm: 8, md: 12, lg: 16 };

// Soft background for a coloured icon bubble
export const tint = (hex) => `${hex}1A`;
