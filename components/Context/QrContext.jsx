import React, { useState, createContext } from 'react';

const QrContext = createContext({
    qr: 0,
    setQr: () => {},
    minutes: 0,
    setMinutes: () => {},
    seconds: 0,
    setSeconds: () => {},
    qrModal: false,
    setQrModal: () => {}
});

const QrProvider = ({ children }) => {
    const [qr, setQr] = useState('');
    const [qrModal, setQrModal] = useState(false);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    
    return (
        <QrContext.Provider value={{ qr, setQr, qrModal, setQrModal, minutes, setMinutes, seconds, setSeconds }}>
            {children}
        </QrContext.Provider>
    );
};

export { QrContext, QrProvider };