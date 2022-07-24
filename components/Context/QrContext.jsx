import React, { useState, createContext } from 'react';

const QrContext = createContext({
    qr: 0,
    setQr: () => {},
    qrModal: false,
    setQrModal: () => {}
});

const QrProvider = ({ children }) => {
    const [qr, setQr] = useState('');
    const [qrModal, setQrModal] = useState(false);
    
    return (
        <QrContext.Provider value={{ qr, setQr, qrModal, setQrModal }}>
            {children}
        </QrContext.Provider>
    );
};

export { QrContext, QrProvider };