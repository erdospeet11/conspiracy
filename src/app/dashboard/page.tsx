'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useBoard } from '@/contexts/BoardContext';
import BoardCard from '@/components/BoardCard';

const mockBoards = [
  {
    id: '1',
    name: 'Project Timeline',
    previewUrl: 'https://picsum.photos/seed/timeline/400/300',
    createdAt: '2024-03-19T10:00:00Z',
  },
  {
    id: '2',
    name: 'Mind Map',
    previewUrl: 'https://picsum.photos/seed/mindmap/400/300',
    createdAt: '2024-03-18T15:30:00Z',
  },
  {
    id: '3',
    name: 'Research Notes',
    previewUrl: 'https://picsum.photos/seed/research/400/300',
    createdAt: '2024-03-17T09:15:00Z',
  },
  {
    id: '4',
    name: 'Story Board',
    previewUrl: 'https://picsum.photos/seed/story/400/300',
    createdAt: '2024-03-16T14:20:00Z',
  },
  {
    id: '5',
    name: 'Product Roadmap',
    previewUrl: 'https://picsum.photos/seed/roadmap/400/300',
    createdAt: '2024-03-15T11:45:00Z',
  },
  {
    id: '6',
    name: 'Team Organization',
    previewUrl: 'https://picsum.photos/seed/team/400/300',
    createdAt: '2024-03-14T16:30:00Z',
  },
];

export default function DashboardPage() {
  const [boards] = useState(mockBoards);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { user } = useAuth();
  const { setCurrentBoard } = useBoard();

  const filteredBoards = boards.filter(board =>
    board.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBoardClick = async (board: typeof mockBoards[0]) => {
    try {
      await setCurrentBoard({ id: board.id, name: board.name });
      router.push('/board');
    } catch (error) {
      console.error('Error setting current board:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Boards</h1>
            <p className="mt-1 text-sm text-gray-500">
              {boards.length} board{boards.length !== 1 ? 's' : ''} created
            </p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 sm:w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Link
              href="/board/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create New Board
            </Link>
          </div>
        </div>

        {filteredBoards.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No boards found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search query.' : 'Get started by creating a new board.'}
            </p>
            <div className="mt-6">
              <Link
                href="/board/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Board
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBoards.map((board) => (
              <div key={board.id} onClick={() => handleBoardClick(board)}>
                <BoardCard {...board} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 