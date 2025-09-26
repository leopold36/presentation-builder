import React, { useState, useEffect } from 'react';
import { Project, ProjectType } from './types';
import ProjectDialog from './components/ProjectDialog';
import DatabaseViewer from './components/DatabaseViewer';
import './App.css';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [showDatabaseViewer, setShowDatabaseViewer] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const projectList = await window.electronAPI.projects.getAll();
      setProjects(projectList);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = () => {
    setShowDialog(true);
  };

  const handleConfirmProject = async (name: string, type: ProjectType) => {
    try {
      setIsCreating(true);
      setShowDialog(false);
      const newProject = await window.electronAPI.projects.create(name, type);
      setProjects(prev => [newProject, ...prev]);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-2 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Presentation Builder</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setShowDatabaseViewer(true)}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors"
            >
              View Database
            </button>
            <button
              onClick={handleCreateProject}
              disabled={isCreating}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'New Project'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">No projects yet</div>
            <div className="text-sm text-gray-500">Create your first project to get started</div>
          </div>
        ) : (
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white p-3 rounded border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900 text-sm">{project.name}</h3>
                      <span className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {project.type === 'slides' ? 'Slides' : 'Document'}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-gray-600 mt-1">{project.description}</p>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(project.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onConfirm={handleConfirmProject}
      />

      <DatabaseViewer
        isOpen={showDatabaseViewer}
        onClose={() => setShowDatabaseViewer(false)}
      />
    </div>
  );
};

export default App;