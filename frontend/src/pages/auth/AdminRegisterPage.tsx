import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { authApi } from '../../api/services/api';

// Form validation schema
const registerSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

const AdminRegisterPage: React.FC = () => {
  const { user, register, isLoading, sendOtp, refreshUser } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterFormData | null>(null);
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [checkError, setCheckError] = useState('');

  const from = location.state?.from?.pathname || '/admin';
  const navigate = useNavigate();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  // Redirect if already authenticated
  if (user) {
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setCheckError('');
      const checkResult = await authApi.checkUserExistence(data.email);

      if (checkResult.exists) {
        setCheckError('User already exists. Please login instead.');
        return;
      }

      setRegisterData(data);
      await handleSendOtp(data.email);
      setShowOtpModal(true);
    } catch (error) {
      setCheckError('Failed to check user. Please try again.');
      // Error is handled by the auth provider
    }
  };

  const handleSendOtp = async (email: string) => {
    try {
      await sendOtp(email);
      setOtpSent(true);
      setOtpError('');
    } catch (error) {
      setOtpError('Failed to send OTP. Please try again.');
    }
  };

  const resendOtp = async () => {
    if (!registerData) return;
    setOtpSent(false);
    setOtp('');
    await sendOtp(registerData.email);
  };

  const verifyOtpAndRegister = async () => {
    if (!registerData) return;
    setOtpError('');
    setIsVerifying(true);
    try {
      const data = await authApi.adminRegister({
        name: registerData.name,
        email: registerData.email,
        password: registerData.password,
        confirmPassword: registerData.confirmPassword,
        otp
      });
      
      localStorage.setItem('auth_token', data.access_token);
      await refreshUser();
      setShowOtpModal(false);
      navigate('/admin');
    } catch (error: any) {
      setOtpError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <Shield className="h-8 w-8 text-[#e1802be0]" />
              <span className="text-4xl font-extrabold text-[#e1802be0]">
                Sambhāṣinī संभाषिणी <br />
              </span>
            </div>

            <h2 className="text-3xl font-bold text-black">
              Create Admin Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign up for admin access
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-black">
                  Full Name
                </label>
                <div className="mt-1 relative">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    {...formRegister('name')}
                    className={cn(
                      'appearance-none block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-black">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...formRegister('email')}
                    className={cn(
                      'appearance-none block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="Enter your email address"
                  />
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
                {checkError && (
                  <p className="mt-2 text-sm text-red-600">
                    {checkError}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-black">
                  Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...formRegister('password')}
                    className={cn(
                      'appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="Enter your password"
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...formRegister('confirmPassword')}
                    className={cn(
                      'appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                      errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    )}
                    placeholder="Confirm your password"
                  />
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-black" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-black" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200',
                    isSubmitting
                      ? 'bg-[#e1802be0]/90 cursor-not-allowed'
                      : 'bg-[#e1802be0] hover:bg-[#e1802be0]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform hover:scale-105'
                  )}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="flex items-center">
                      <span>Create Admin Account</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an admin account?{' '}
                  <Link
                    to="/admin/login"
                    className="font-medium text-black hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <Link
                    to="/"
                    className="font-medium text-black hover:text-gray-700"
                  >
                    ← Go Back to Home Page
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Feature Showcase */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-[#e1802be0]/70 ">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6">
                Admin Panel Access
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Register for admin privileges to manage the system
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Admin Privileges</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-lg">User Management</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-lg">System Control</span>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-2">Secure admin registration</p>
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full" />
                  ))}
                  <span className="text-sm ml-2">Protected setup</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-white mt-8 hover:text-gray-400 flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="tracking-wide">← Go Back to Home Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Verify Your Email</h3>
            {otpSent && (
              <p className="mb-4 text-gray-600">
                We've sent a 4-digit OTP to <strong>{registerData?.email}</strong>. Please enter it below to complete admin registration.
              </p>
            )}
            {otpError && (
              <p className="mb-4 text-red-600 text-sm">{otpError}</p>
            )}
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 4-digit OTP"
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-black focus:border-black"
              maxLength={4}
            />
            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={resendOtp}
                className="text-sm text-black hover:text-gray-700 underline"
                disabled={!otpSent}
              >
                Resend OTP
              </button>
              <span className="text-sm text-gray-500">
                OTP expires in 5 minutes
              </span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtpAndRegister}
                disabled={isVerifying || otp.length !== 4}
                className="px-4 py-2 bg-gradient-to-r from-black to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Verify & Register as Admin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegisterPage;
