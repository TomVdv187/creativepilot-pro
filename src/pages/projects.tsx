import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: string;
  updatedAt: string;
  stats: {
    creatives: number;
    impressions: number;
    ctr: number;
    cpa: number;
  };
  budget: number;
  spent: number;
}

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    budget: 1000
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data
    const mockProjects: Project[] = [
      {
        id: '1',
        name: 'Summer Sale Campaign',
        description: 'Promote summer products with 20% discount',
        status: 'active',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        stats: { creatives: 12, impressions: 245670, ctr: 3.2, cpa: 15.30 },
        budget: 5000,
        spent: 2840
      },
      {
        id: '2',
        name: 'New Product Launch',
        description: 'Launch campaign for the new skincare line',
        status: 'active',
        createdAt: '2024-01-18',
        updatedAt: '2024-01-22',
        stats: { creatives: 8, impressions: 189230, ctr: 2.8, cpa: 18.75 },
        budget: 3000,
        spent: 1250
      },
      {
        id: '3',
        name: 'Black Friday Prep',
        description: 'Preparing creatives for Black Friday campaign',
        status: 'paused',
        createdAt: '2024-01-10',
        updatedAt: '2024-01-16',
        stats: { creatives: 15, impressions: 156890, ctr: 4.1, cpa: 12.20 },
        budget: 8000,
        spent: 890
      },
      {
        id: '4',
        name: 'Customer Testimonials',
        description: 'Social proof campaign using customer reviews',
        status: 'completed',
        createdAt: '2024-01-05',
        updatedAt: '2024-01-25',
        stats: { creatives: 6, impressions: 89340, ctr: 2.4, cpa: 22.10 },
        budget: 2000,
        spent: 2000
      }
    ];
    
    setProjects(mockProjects);
    setLoading(false);
  };

  const createProject = async () => {
    if (!newProject.name.trim()) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      description: newProject.description,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      stats: { creatives: 0, impressions: 0, ctr: 0, cpa: 0 },
      budget: newProject.budget,
      spent: 0
    };

    setProjects(prev => [project, ...prev]);
    setShowCreateModal(false);
    setNewProject({ name: '', description: '', budget: 1000 });
  };

  const updateProject = async (updatedProject: Project) => {
    setProjects(prev => 
      prev.map(p => p.id === updatedProject.id 
        ? { ...updatedProject, updatedAt: new Date().toISOString().split('T')[0] }
        : p
      )
    );
    setEditingProject(null);
  };

  const deleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  const toggleProjectStatus = async (id: string) => {
    setProjects(prev => 
      prev.map(p => p.id === id 
        ? { 
            ...p, 
            status: p.status === 'active' ? 'paused' : 'active',
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : p
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBudgetColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Projects - CreativePilot Pro</title>
      </Head>

      <Sidebar>
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen">
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header with create button */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600">Manage your creative campaigns and track performance</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Create Project
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div key={project.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-600">{project.description}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-2xl font-bold text-gray-900">{project.stats.creatives}</div>
                      <div className="text-xs text-gray-500">Creatives</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-indigo-600">{project.stats.ctr}%</div>
                      <div className="text-xs text-gray-500">CTR</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">{project.stats.impressions.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Impressions</div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-700">${project.stats.cpa}</div>
                      <div className="text-xs text-gray-500">CPA</div>
                    </div>
                  </div>

                  {/* Budget */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Budget</span>
                      <span className={`font-medium ${getBudgetColor(project.spent, project.budget)}`}>
                        ${project.spent} / ${project.budget}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{ width: `${Math.min((project.spent / project.budget) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-3 rounded text-sm hover:bg-gray-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleProjectStatus(project.id)}
                      className={`flex-1 py-2 px-3 rounded text-sm font-medium ${
                        project.status === 'active' 
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                          : 'bg-green-100 text-green-800 hover:bg-green-200'
                      }`}
                    >
                      {project.status === 'active' ? 'Pause' : 'Resume'}
                    </button>
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Created: {project.createdAt}</span>
                      <span>Updated: {project.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {projects.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📁</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to start generating creatives</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Create Project
              </button>
            </div>
          )}
          </main>

          {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Holiday Campaign"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                    placeholder="Brief description of the project"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
                  disabled={!newProject.name.trim()}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Create Project
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {editingProject && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-lg font-semibold mb-4">Edit Project</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    value={editingProject.name}
                    onChange={(e) => setEditingProject(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    value={editingProject.budget}
                    onChange={(e) => setEditingProject(prev => prev ? { ...prev, budget: parseInt(e.target.value) || 0 } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={() => setEditingProject(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => updateProject(editingProject)}
                  disabled={!editingProject.name.trim()}
                  className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 disabled:bg-gray-300"
                >
                  Update Project
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </Sidebar>
    </>
  );
};

export default ProjectsPage;