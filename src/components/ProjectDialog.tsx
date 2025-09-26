import React, { useState, useEffect, useRef } from 'react';
import { ProjectType } from '../types';

interface ProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, type: ProjectType) => void;
}

const ProjectDialog: React.FC<ProjectDialogProps> = ({ isOpen, onClose, onConfirm }) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<ProjectType>('document');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setProjectType('document');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (projectName.trim()) {
      onConfirm(projectName.trim(), projectType);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-lg shadow-lg w-96 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Create New Project</h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter project name"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <div className="flex gap-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="document"
                  checked={projectType === 'document'}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="mr-1.5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Document</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="slides"
                  checked={projectType === 'slides'}
                  onChange={(e) => setProjectType(e.target.value as ProjectType)}
                  className="mr-1.5 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Slides</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectDialog;