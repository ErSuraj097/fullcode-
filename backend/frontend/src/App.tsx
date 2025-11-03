import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Providers
import { AuthProvider } from './providers/AuthProvider';
import { ThemeProvider } from './providers/ThemeProvider';
import { I18nProvider } from './providers/I18nProvider';
import { ThemeProvider as JetHatThemeProvider } from './contexts/ThemeContext';

// Import JetHat AI theme styles
import './styles/theme.css';

// Components
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';

// Pages - Lazy loaded for better performance
const LandingPage = React.lazy(() => import('./pages/public/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/auth/RegisterPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ReactivateAccountPage = React.lazy(() => import('./pages/auth/ReactivateAccount'));
const AdminLoginPage = React.lazy(() => import('./pages/auth/AdminLoginPage'));
const AdminRegisterPage = React.lazy(() => import('./pages/auth/AdminRegisterPage'));
const AdminPanel = React.lazy(() => import('./pages/admin/AdminPanel'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ProjectsPage = React.lazy(() => import('./pages/projects/ProjectsPage'));
const ProjectDetailPage = React.lazy(() => import('./pages/projects/BasicProjectDetailPage'));
const MediumProjectDetailPage = React.lazy(() => import('./pages/projects/MediumProjectDetailPage'));
const AdvancedProjectDetailPage = React.lazy(() => import('./pages/projects/AdvancedProjectDetailPage'));
const NewProjectPage = React.lazy(() => import('./pages/projects/NewProjectPage'));
const ModelSelectionPage = React.lazy(() => import('./pages/projects/ModelSelectionPage'));
const PaymentPage = React.lazy(() => import('./pages/projects/PaymentPage'));
const PaymentSuccessPage = React.lazy(() => import('./pages/projects/PaymentSuccessPage'));
const PaymentFailurePage = React.lazy(() => import('./pages/projects/PaymentFailurePage'));

// const DataUploadPage = React.lazy(() => import('../../pages/DataUploadPage'));
// const BasicConfigPage = React.lazy(() => import('../../pages/BasicConfigPage'));
// const MediumModelPage = React.lazy(() => import('../../pages/MediumModelPage'));
// const AdvancedConfigPage = React.lazy(() => import('../../pages/AdvancedConfigPage'));
// const DeployPage = React.lazy(() => import('../../pages/DeployPage'));
// const PlanSelectionPage = React.lazy(() => import('./pages/plans/PlanSelectionPage'));
// const ConfigurationPage = React.lazy(() => import('./pages/projects/ConfigurationPage'));
const SubscriptionPage = React.lazy(() => import('./pages/subscription/SubscriptionPage'));

const ChatPage = React.lazy(() => import('./pages/chat/ChatPage'));
const WidgetConfigPage = React.lazy(() => import('./pages/widget/BasicWidgetConfigPage'));
const MediumWidgetConfigPage = React.lazy(() => import('./pages/widget/MediumWidgetConfigPage'));
const AdvancedWidgetConfigPage = React.lazy(() => import('./pages/widget/AdvancedWidgetConfigPage'));
// const WidgetDemoPage = React.lazy(() => import('./pages/widget/WidgetDemoPage'));
// const StandaloneWidget = React.lazy(() => import('./pages/widget/StandaloneWidget'));
const PureChatWidget = React.lazy(() => import('./pages/widget/PureChatWidget'));
const WidgetDemo = React.lazy(() => import('./pages/widget/WidgetDemo'));
const PredictionPage = React.lazy(() => import('./pages/prediction/PredictionPage'));
const SettingsPage = React.lazy(() => import('./pages/settings/SettingsPage'));
const AccountSettingsPage = React.lazy(() => import('./pages/account/AccountSettings'));
import HowToUse from './pages/help/HowToUse';

// Public policy pages
const SupportPage = React.lazy(() => import('./pages/public/SupportPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/public/PrivacyPolicyPage'));
const TermsConditionsPage = React.lazy(() => import('./pages/public/TermsConditionsPage'));
const CancellationPolicyPage = React.lazy(() => import('./pages/public/CancellationPolicyPage'));
const ContactPage = React.lazy(() => import('./pages/public/Contact'));

// const SubscriptionPage = React.lazy(() => import('./pages/subscription/SubscriptionPage'));

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" text="Loading..." />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <JetHatThemeProvider>
          <I18nProvider>
            <ThemeProvider>
              <AuthProvider>
                <Router
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <div className="App">
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/reactivate-account" element={<ReactivateAccountPage />} />

                        {/* Public Policy Pages */}
                        <Route path="/support" element={<SupportPage />} />
                        <Route path="/contact" element={<ContactPage />} />
                        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                        <Route path="/terms-conditions" element={<TermsConditionsPage />} />
                        <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />

                        {/* Admin Routes */}
                        <Route path="/admin/login" element={<AdminLoginPage />} />
                        <Route path="/admin/register" element={<AdminRegisterPage />} />

                        {/* Widget Routes - Public */}
                        <Route path="/widget/:projectId" element={<PureChatWidget />} />
                        <Route path="/widget/:projectId/basic" element={<PureChatWidget />} />
                        <Route path="/widget/:projectId/medium" element={<PureChatWidget />} />
                        <Route path="/widget/:projectId/advanced" element={<PureChatWidget />} />
                        <Route path="/widget-demo" element={<WidgetDemo />} />
                        {/* <Route path="/widget/:projectId/demo" element={<StandaloneWidget />} /> */}
                        {/* <Route path="/widget/:projectId/preview" element={<WidgetDemoPage />} /> */}
                        <Route path="/chat/:projectId" element={<PureChatWidget />} />

                        {/* Protected App Routes */}
                        <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                          <Route index element={<Navigate to="/app/dashboard" replace />} />
                          <Route path="dashboard" element={<DashboardPage />} />
                          <Route path="projects" element={<ProjectsPage />} />
                          <Route path="projects/new" element={<NewProjectPage />} />
                          <Route path="projects/:projectId/model-selection" element={<ModelSelectionPage />}
                           />
                          <Route path="projects/:projectId/payment" element={<PaymentPage />} />
                          <Route path="payment/success" element={<PaymentSuccessPage />} />
                          <Route path="payment/failure" element={<PaymentFailurePage />} />

                           <Route path="projects/:projectId/basic-project" element={<ProjectDetailPage />} />
                           {/* <Route path="projects/:projectId/basic-project" element={<ProjectDetailPage />} /> */}
                           <Route path="projects/:projectId/medium-project" element={<MediumProjectDetailPage />} />
                           <Route path="projects/:projectId/advanced-project" element={<AdvancedProjectDetailPage />} />
                           {/* <Route path="projects/:projectId/basic-project" element={<ProjectDetailPage />} */}
                           {/* /> */}
                          {/* <Route path="projects/:projectId/data-upload" element={<DataUploadPage />} />
                          <Route path="projects/:projectId/basic-config" element={<BasicConfigPage />} />
                          <Route path="projects/:projectId/medium-config" element={<MediumModelPage />} />
                          <Route path="projects/:projectId/advanced-config" element={<AdvancedConfigPage />} />
                          <Route path="projects/:projectId/deploy" element={<DeployPage />} /> */}
                          {/* <Route path="projects/new/configure/:planType" element={<ConfigurationPage />} /> */}

                          <Route path="projects/:projectId" element={<ProjectDetailPage />} />
                          <Route path="projects/:projectId/chat" element={<ChatPage />} />
                          <Route path="projects/:projectId/widget" element={<WidgetConfigPage />} />
                          <Route path="projects/:projectId/widget/basic" element={<WidgetConfigPage />} />
                          <Route path="projects/:projectId/widget/medium" element={<MediumWidgetConfigPage />} />
                          <Route path="projects/:projectId/widget/advanced" element={<AdvancedWidgetConfigPage />} />
                          <Route path="prediction" element={<PredictionPage />} />
                          <Route path="subscription" element={<SubscriptionPage />} />
                          <Route path="settings" element={<SettingsPage />} />
                          <Route path="account/settings" element={<AccountSettingsPage />} />
                        </Route>

                        {/* How to Use Page */}
                        <Route path="/how-to-use" element={<HowToUse />} />

                        {/* Separate Admin Route */}
                        <Route path="/admin" element={<ProtectedRoute redirectTo="/admin/login" requiredRole="admin"><AdminPanel /></ProtectedRoute>} />

                        {/* Legacy Redirects */}
                        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                        <Route path="/projects" element={<Navigate to="/app/projects" replace />} />

                        {/* 404 - Redirect to landing */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Suspense>

                    {/* Global Toast Container */}
                    <ToastContainer
                      position="top-right"
                      autoClose={5000}
                      hideProgressBar={false}
                      newestOnTop
                      closeOnClick
                      rtl={false}
                      pauseOnFocusLoss
                      draggable
                      pauseOnHover
                      theme="light"
                      className="z-50"
                    />
                  </div>
                </Router>
                {/* <iframe src="http://localhost:5173/widget/d83dae13-9838-484c-a957-97a2cf46f07e?disable-hmr=true" frameborder="0"></iframe> */}
              </AuthProvider>
            </ThemeProvider>

          </I18nProvider>
        </JetHatThemeProvider>
        {/* <ReactQueryDevtools initialIsOpen={true} /> */}

      </QueryClientProvider>
    </ErrorBoundary>


  );
}

export default App;
