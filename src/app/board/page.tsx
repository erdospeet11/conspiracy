'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBoard } from '@/contexts/BoardContext';
import Canvas, { CanvasRef } from '@/components/Canvas';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

export default function BoardPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { currentBoard } = useBoard();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const canvasRef = useRef<CanvasRef>(null);

  if (!user) {
    router.push('/login');
    return null;
  }

  if (!currentBoard) {
    router.push('/dashboard');
    return null;
  }

  const handleAddImage = () => {
    // TODO: Implement image upload
  };

  const handleAddRectangle = () => {
    canvasRef.current?.addRectangle();
  };

  const handleAddText = () => {
    canvasRef.current?.addText();
  };

  const handleStartConnection = () => {
    canvasRef.current?.startConnectionMode();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        boardName={currentBoard.name}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        onSignOut={signOut}
      />
      
      <div className="relative h-[calc(100vh-4rem)]">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddImage={handleAddImage}
          onAddRectangle={handleAddRectangle}
          onAddText={handleAddText}
          onStartConnection={handleStartConnection}
          isConnectionMode={canvasRef.current?.isConnectionMode ?? false}
        />
        
        <div className="h-full">
          <Canvas ref={canvasRef} />
        </div>
      </div>
    </div>
  );
} 