import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Bot, Sparkles, MessageCircle, Users, ShoppingCart, GraduationCap, Gamepad2, CreditCardIcon, CheckIcon } from 'lucide-react';
import { projectsApi } from '../../api/services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { cn } from '../../utils/cn';
import Logo from '../../../public/logo2.png'
// Form validation schema
const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100, 'Project name is too long'),
  description: z.string().max(500, 'Description is too long').optional(),
  type: z.string().min(1, 'Project type is required'),
  planType: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface PlanDetails {
  id: string;
  name: string;
  description: string;
  price: string;
  features: string[];
}

const projectTypes = [
  {
    id: 'general',
    name: 'General Purpose',
    description: 'A versatile chatbot for general conversations and queries',
    icon: MessageCircle,
    color: 'from-blue-500 to-blue-600',
    features: ['Multi-language support', 'Custom responses', 'Easy training'],
  },
  {
    id: 'customer_support',
    name: 'Customer Support',
    description: 'Specialized for handling customer inquiries and support tickets',
    icon: Users,
    color: 'from-green-500 to-green-600',
    features: ['Ticket routing', 'FAQ integration', 'Escalation handling'],
  },
  {
    id: 'faq',
    name: 'FAQ Bot',
    description: 'Perfect for answering frequently asked questions',
    icon: Bot,
    color: 'from-purple-500 to-purple-600',
    features: ['Knowledge base', 'Quick answers', 'Search functionality'],
  },
  {
    id: 'sales',
    name: 'Sales Assistant',
    description: 'Help customers with product information and sales inquiries',
    icon: ShoppingCart,
    color: 'from-orange-500 to-orange-600',
    features: ['Product catalog', 'Price quotes', 'Lead generation'],
  },
  {
    id: 'educational',
    name: 'Educational',
    description: 'Interactive learning assistant for educational content',
    icon: GraduationCap,
    color: 'from-indigo-500 to-indigo-600',
    features: ['Quiz generation', 'Learning paths', 'Progress tracking'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    description: 'Fun and engaging chatbot for entertainment purposes',
    icon: Gamepad2,
    color: 'from-pink-500 to-pink-600',
    features: ['Games & quizzes', 'Storytelling', 'Interactive content'],
  },
];

const NewProjectPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    mode: 'onChange',
    defaultValues: {
      type: '',
    },
  });

  const selectedType = watch('type');

  const createMutation = useMutation({
    mutationFn: projectsApi.create,
    onSuccess: (project) => {
      toast.success(t('success.created'));
      navigate(`/app/projects/${project.id}`);
    },
    onError: () => {
      toast.error(t('error.generic'));
    },
  });

  const onSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 py-10">
      {/* Main Content */}
      <div className="flex-1 space-y-8">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link
            to="/app/projects"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('New Project')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Set up a new AI chatbot project with advanced multilingual capabilities
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Project Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Project Details
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Provide basic information about your chatbot project
              </p>
            </div>

            <div className="space-y-6">
              {/* Project Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className={cn(
                    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors',
                    errors.name
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="Enter a descriptive name for your chatbot"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className={cn(
                    'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white transition-colors resize-none',
                    errors.description
                      ? 'border-red-300 dark:border-red-600'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                  placeholder="Describe what your chatbot will do and how it will help users..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Project Type Selection */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Choose Project Type
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Select the type that best describes your chatbot's purpose
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projectTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = selectedType === type.id;

                return (
                  <div
                    key={type.id}
                    className={cn(
                      'relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md min-h-[80px] flex items-center justify-center',
                      isSelected
                        ? 'border-[#e1802b] bg-[#e1802b]/10 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                    onClick={() => {
                      setValue('type', type.id, { shouldValidate: true });
                      setValue('description', type.description, { shouldValidate: true }); // autofill description
                    }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        'p-2 rounded-lg bg-[#e1802b]',
                        type.color
                      )}>
                        <Icon className="h-4 w-4  text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                          {type.name}
                        </h3>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2">
                        <div className="w-5 h-5 bg-[#e1802b] rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.type && (
              <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              to="/app/projects"
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {t('common.cancel')}
            </Link>

            <button
              type="submit"
              disabled={!isValid || createMutation.isPending}
              className={cn(
                'px-6 py-3 rounded-lg text-sm font-medium text-white transition-all duration-200 transform',
                isValid && !createMutation.isPending
                  ? 'bg-[#e1802b] hover:bg-[#d16f1a] hover:scale-105 shadow-lg'
                  : 'bg-[#e1802b]/50 cursor-not-allowed'
              )}
            >
              {createMutation.isPending ? (
                <div className="flex items-center">
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Creating...</span>
                </div>
              ) : (
                <div className="flex items-center">
                  <Bot className="h-4 w-4 mr-2" />
                  Create Project
                </div>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar - What's Next? */}
      <div className="lg:w-1/3 h-[80vh] mt-24 bg-gradient-to-br from-orange-50 to-orange-50 dark:from-orange-900/20 dark:to-orange-900 rounded-xl border border-orange-200 dark:border-orange-800 p-6">
        <div className="flex flex-col  items-center space-x-3">
          <div className="p-4   rounded-lg">
            {/* <Bot className="h-5 w-5 text-orange-600 dark:text-orange-400" />
             */}

             <img src={Logo} alt="" srcset=""  width={100} />
          </div>
        
          <div>
            <h3 className="text-lg font-medium text-orange-900 dark:text-white mb-2">
              Proper Process to Create and Deploy Your Chatbot
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Follow these steps to build, train, and integrate your AI chatbot seamlessly:
            </p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Fill in the project name and choose the chatbot type (e.g., customer support, FAQ bot)
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Click the "Create" button to initialize your project
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Open the dashboard and enter basic details (e.g., description, target audience)
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Upload training data in supported formats: CSV, text, JSON, or TXT files
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Select and train your model: Choose from basic, medium, or advanced algorithms (pick one based on your needs)
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Proceed to bot configuration: Customize responses, multilingual support, and behavior settings
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Generate an iframe embed code or direct link for deployment
              </li>
              <li className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                Save your changes and integrate the chatbot into any website using the iframe, HTML snippet, or link
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewProjectPage;