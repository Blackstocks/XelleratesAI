'use client';
import React, { createContext, useContext, useState } from 'react';

const DocumentContext = createContext();

export const DocumentProvider = ({ children }) => {
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  return (
    <DocumentContext.Provider
      value={{ selectedDocuments, setSelectedDocuments }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocumentContext = () => useContext(DocumentContext);
