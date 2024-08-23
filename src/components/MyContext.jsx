import React, { createContext, useState } from 'react';

const MyContext = createContext();

export const MyContextProvider = ({ children }) => {
    // Your context logic here
    const [contextValue, setContextValue] = useState(null);

    return (
        <MyContext.Provider value={{ contextValue, setContextValue }}>
            {children}
        </MyContext.Provider>
    );
};

export default MyContext;
