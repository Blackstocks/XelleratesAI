import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const KanbanLabel = () => {
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    // Check session storage for the state
    const storedState = sessionStorage.getItem('kanbanClicked');
    if (storedState === 'true') {
      setIsClicked(true);
    }
  }, []);

  const handleClick = () => {
    setIsClicked(true);
    sessionStorage.setItem('kanbanClicked', 'true');
  };

  return (
    <Link href='/kanban'>
      <button
        onClick={handleClick}
        className={`${
          isClicked ? 'bg-slate-800 text-white' : 'bg-gray-100 text-slate-900'
        } font-bold py-2 px-4 rounded shadow hover:bg-slate-700 hover:text-white transition-colors duration-200`}
      >
        CRM
      </button>
    </Link>
  );
};

export default KanbanLabel;
