'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface Board {
  id: string;
  name: string;
}

interface BoardContextType {
  currentBoard: Board | null;
  setCurrentBoard: (board: Board | null) => Promise<void>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export function BoardProvider({ children }: { children: ReactNode }) {
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);

  const updateCurrentBoard = async (board: Board | null) => {
    return new Promise<void>((resolve) => {
      setCurrentBoard(board);
      resolve();
    });
  };

  return (
    <BoardContext.Provider value={{ currentBoard, setCurrentBoard: updateCurrentBoard }}>
      {children}
    </BoardContext.Provider>
  );
}

export function useBoard() {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
} 