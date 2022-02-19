import { useState } from 'react';

const useToggleDrawer = () => {
  const [state, setState] = useState(true);

  const toggle = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    setState(open);
  };

  return { state, toggle };
};

export default useToggleDrawer;
