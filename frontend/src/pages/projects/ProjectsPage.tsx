import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  MessageCircle, 
  Settings, 
  Calendar,
  Zap,
  Bot,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Copy,
  ExternalLink,
  Archive,
  Download,
  Settings2,
} from 'lucide-react';
import { projectsApi } from '../../api/services/api';
import { LoadingSpinner, SectionLoader } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { toast } from 'react-toastify';
import type { Project } from '../../types';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'created_at' | 'updated_at' | 'training_status';
type SortOrder = 'asc' | 'desc';

// Project Dropdown Menu Component
interface ProjectDropdownMenuProps {
  project: Project;
  onDelete: () => void;
  onEdit?: () => void;
}

const ProjectDropdownMenu: React.FC<ProjectDropdownMenuProps> = ({ project, onDelete, onEdit }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyId = () => {
    navigator.clipboard.writeText(project.id);
    toast.success('Project ID copied to clipboard');
    setIsOpen(false);
  };

  const handleViewWidget = () => {
    window.open(`/widget/${project.id}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-8 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
          {/* <button
            onClick={() => {
              navigate(`/app/projects/${project.id}`);
              setIsOpen(false);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </button> */}
          
          <button
            onClick={() => {
              navigate(`/app/projects/${project.id}/widget/advanced`);
              setIsOpen(false);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Widget Settings
          </button>

          <button
            onClick={handleViewWidget}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Widget
          </button>

          <button
            onClick={handleCopyId}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Project ID
          </button>

          <div className="border-t border-gray-200 dark:border-gray-700 my-1" />

          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

// Project Update Modal Component
interface ProjectUpdateModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (projectId: string, data: Partial<Project>) => void;
  isLoading?: boolean;
}

const ProjectUpdateModal: React.FC<ProjectUpdateModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'general'
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description || '',
        type: project.type
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (project) {
      onUpdate(project.id, formData);
    }
  };

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Update Project
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Project Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="general">General</option>
              <option value="customer_support">Customer Support</option>
              <option value="faq">FAQ</option>
              <option value="sales">Sales</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
            </select>
          </div>

          <div className="flex space-x-3 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="xs" className="mr-2" />
                  Updating...
                </>
              ) : (
                'Update Project'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  const [updateProject, setUpdateProject] = useState<Project | null>(null);

  // Fetch projects
  const { data: projects = [], isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getAll,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project deleted successfully');
      setDeleteProjectId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to delete project');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Project> }) =>
      projectsApi.update(projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast.success('Project updated successfully');
      setUpdateProject(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Failed to update project');
    },
  });

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = projects.filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.training_status === statusFilter;
      const matchesType = typeFilter === 'all' || project.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    // Sort projects
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'created_at' || sortField === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [projects, searchTerm, statusFilter, typeFilter, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    await deleteMutation.mutateAsync(projectId);
  };

  const handleUpdateProject = async (projectId: string, data: Partial<Project>) => {
    await updateMutation.mutateAsync({ projectId, data });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'trained': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'training': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'error': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getModelTypeColor = (type: string) => {
    switch (type) {
      case 'advanced': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'basic': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return <SectionLoader text={t('common.loading')} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{t('error.generic')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('projects.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('projects.subtitle')}
          </p>
        </div>
        {/* <Link
          to="/app/projects/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium 
          text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
        >
          <Plus className="h-5 w-5 mr-2" />
          {t('projects.newProject')}
        </Link> */}
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t('projects.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('All Status')}</option>
              <option value="untrained">Untrained</option>
              <option value="training">Training</option>
              <option value="trained">Trained</option>
              <option value="error">Error</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('All Types')}</option>
              <option value="general">General</option>
              <option value="customer_support">Customer Support</option>
              <option value="faq">FAQ</option>
              <option value="sales">Sales</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 rounded-l-lg',
                  viewMode === 'grid'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <List className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 rounded-r-lg',
                  viewMode === 'list'
                    ? 'bg-orange-600 text-white'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Display */}
      {filteredAndSortedProjects.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Bot className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
              ? t('projects.noProjectsFound') 
              : t('projects.noProjects')
            }
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? t('projects.tryAdjustingFilters')
              : t('projects.getStartedDesc')
            }
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <div className="mt-6">
              <Link
                to="/app/projects/new"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t('projects.newProject')}
              </Link>
            </div>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map((project) => (
            <div key={project.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      <Link 
                        to={`/app/projects/${project.id}`} 
                        className="hover:text-orange-600 dark:hover:text-orange-400"
                      >
                        {project.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                      {project.description || t('common.noDescription')}
                    </p>
                    
                    {/* <div className="flex flex-wrap gap-2 mb-4">
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(project.training_status)
                      )}>
                        {project.training_status}
                      </span>
                      {project.model_type && (
                        <span className={cn(
                          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                          getModelTypeColor(project.model_type)
                        )}>
                          {project.model_type}
                        </span>
                      )}
                      {project.accuracy && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {Math.round(project.accuracy * 100)}% accuracy
                        </span>
                      )}
                    </div> */}

                    <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 mb-4">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="relative">
                    <ProjectDropdownMenu 
                      project={project}
                      onDelete={() => setDeleteProjectId(project.id)}
                      onEdit={() => setUpdateProject(project)}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  {/* <Link
                    to={`/app/projects/${project.id}/chat`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    {t('common.test')}
                  </Link> */}
                  <Link
                    to={`/app/projects/${project.id}`}
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md
                     text-white bg-[#e1802be0] hover:bg-[#e1802be0]/70  transition-all duration-200 transform hover:scale-105"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    {t('common.manage')}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-2 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex items-center space-x-8 px-32 gap-48 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <button
                onClick={() => handleSort('name')}
                className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                Name
                {sortField === 'name' && (
                  sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                )}
              </button>
              {/* <span className='px-6'>Status</span> */}
              <span>Type</span>
              <button
                onClick={() => handleSort('created_at')}
                className="flex items-center hover:text-gray-700 dark:hover:text-gray-300"
              >
                Created
                {sortField === 'created_at' && (
                  sortOrder === 'asc' ? <SortAsc className="ml-1 h-3 w-3" /> : <SortDesc className="ml-1 h-3 w-3" />
                )}
              </button>
              <span className='px-8'>Actions</span>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSortedProjects.map((project) => (
              <div key={project.id} className="px-32 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                    <div>
                      <Link 
                        to={`/app/projects/${project.id}`}
                        className="text-sm font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        {project.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {project.description || t('common.noDescription')}
                      </p>
                    </div>
                    {/* <div>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(project.training_status)
                      )}>
                        {project.training_status}
                      </span>
                    </div> */}
                    <div>
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {project.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/app/projects/${project.id}/widget/advanced`}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <Settings2 className="h-6  mr-1" />
                        chatbot Setting
                      </Link>
                      <Link
                        to={`/app/projects/${project.id}`}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-[#e1802be0] hover:bg-[#e1802be0]/70
                         hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
                      >
                        <a className="h-8 mr-1" />
                        Manage
                      </Link>
                      <button
                        onClick={() => setUpdateProject(project)}
                        className="inline-flex items-center px-2 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      >
                        <Edit className="h-8 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteProjectId(project.id)}
                        className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-[#e1802be0] hover:bg-red-700"
                      >
                        <Trash2 className="h-8 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteProjectId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Delete Project
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this project? This action cannot be undone and will permanently remove all project data, including intents, training data, and chat history.
            </p>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteProjectId(null)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProject(deleteProjectId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 flex items-center"
              >
                {deleteMutation.isPending ? (
                  <>
                    <LoadingSpinner size="xs" className="mr-2" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Project
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Project Modal */}
      <ProjectUpdateModal
        project={updateProject}
        isOpen={!!updateProject}
        onClose={() => setUpdateProject(null)}
        onUpdate={handleUpdateProject}
        isLoading={updateMutation.isPending}
      />
    </div>
  );
};

export default ProjectsPage;