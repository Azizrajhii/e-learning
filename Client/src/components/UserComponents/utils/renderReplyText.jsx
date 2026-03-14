export const renderReplyText = (text) => {
  // Split text into parts while keeping the mentions intact
  const parts = text.split(/(@[\w]+\s[\w]+)/g); // Matches "@Firstname Lastname"
  
  return parts.map((part, index) => {
    if (part.startsWith('@')) {
      return <span key={index} style={{ color: '#1da1f2' }}>{part}</span>;
    }
    return part;
  });
};