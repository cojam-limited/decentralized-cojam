import React from "react";
import { createContext, useContext } from "react";

const LoadingContextProvider = createContext({});

export default function LoadingContext({ children, loading, setLoading }) {
  return (
    <LoadingContextProvider.Provider
      value={{
        loading,
        setLoading
      }}
    >
      {children}
    </LoadingContextProvider.Provider>
  );
}

// export the hook so we can use it in other components.
export const useLoadingState = () => useContext(LoadingContextProvider);
