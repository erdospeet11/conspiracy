import { FC } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAddImage: () => void;
  onAddRectangle: () => void;
  onAddText: () => void;
  onStartConnection: () => void;
  isConnectionMode: boolean;
}

const Sidebar = ({ 
  isOpen, 
  onClose, 
  onAddImage, 
  onAddRectangle, 
  onAddText, 
  onStartConnection,
  isConnectionMode 
}: SidebarProps) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out z-10 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Tools</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <button
            onClick={onAddImage}
            className="w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Image
          </button>
          <button
            onClick={onAddRectangle}
            className="w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Rectangle
          </button>
          <button
            onClick={onAddText}
            className="w-full px-4 py-2 text-left text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Text
          </button>
          <button
            onClick={onStartConnection}
            className={`w-full px-4 py-2 text-left text-gray-700 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isConnectionMode 
                ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            Connect Objects
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 