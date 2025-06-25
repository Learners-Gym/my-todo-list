import React from 'react';

interface IconProps {
  className?: string;
}

const TrashIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.242.078 3.223.226C9.305 5.884 9.305 5.884 9.305 5.884M5.158 5.758A2.25 2.25 0 012.242 2.126h8.2a2.25 2.25 0 012.242 2.126M9 11.25v4.5M12 11.25v4.5M15 11.25v4.5M3.375 5.25h17.25" />
    </svg>
  );
};

export default TrashIcon;
