import React, { useState, createContext } from 'react';

const BalanceContext = createContext({
    balance: 0,
    setBalance: () => {},
});

const BalanceProvider = ({ children }) => {
    const [balance, setBalance] = useState(0);
    
    return (
        <BalanceContext.Provider value={{ balance, setBalance }}>
            {children}
        </BalanceContext.Provider>
    );
};

export { BalanceContext, BalanceProvider };