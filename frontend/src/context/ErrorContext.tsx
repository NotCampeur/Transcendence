import { createContext, useContext, useState } from "react";
import React from "react";
import { IErrorData } from "../interfaces/IErrorData";
import { defaultErrorState, IErrorContext } from "../interfaces/IErrorContext";

const ErrorContext = createContext<IErrorContext>(defaultErrorState);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const [errorData, setErrorData] = useState(defaultErrorState.errorData);
  const [showError, setShowError] = useState(defaultErrorState.showError);

  const newError = (errorData: IErrorData) => {
    setErrorData(errorData);
    setShowError(true);
  };

  const hideError = () => {
    setShowError(false);
  };

  return (
    <ErrorContext.Provider
      value={{
        errorData,
        newError,
        hideError,
        showError,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

export function useErrorContext() {
  return useContext(ErrorContext);
}