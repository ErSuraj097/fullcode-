import React, { useState, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { authApi } from '../../api/services/api';

// Form validation schema
const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const resetSchema = z.object({
  otp: z.string().min(4, 'OTP must be 4 digits').max(4, 'OTP must be 4 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Confirm password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ForgotFormData = z.infer<typeof forgotSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'email' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [canResend, setCanResend] = useState(false);

  const emailForm = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  // Timer effect for OTP expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft]);

  // Format time display
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  // Start countdown timer
  const startTimer = useCallback(() => {
    setTimeLeft(300); // 5 minutes = 300 seconds
    setCanResend(false);
  }, []);

  // Show warning when OTP is about to expire
  const showExpiryWarning = timeLeft > 0 && timeLeft <= 60;

  const handleSendOtp = async (data: ForgotFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(data.email);
      setEmail(data.email);
      setOtpSent(true);
      setStep('reset');
      setSuccess('OTP sent successfully! Check your email.');
      startTimer();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: ResetFormData) => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    // Check if OTP has expired
    if (timeLeft === 0 && !canResend) {
      setError('OTP has expired. Please request a new one.');
      setIsLoading(false);
      return;
    }
    
    try {
      await authApi.resetPassword(email, data.otp, data.newPassword);
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully. Please log in with your new password.' }
        });
      }, 2000);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend && timeLeft > 0) {
      setError(`Please wait ${formatTime(timeLeft)} before requesting a new OTP`);
      return;
    }
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    try {
      await authApi.forgotPassword(email);
      setSuccess('New OTP sent successfully! Check your email.');
      startTimer();
      resetForm.reset({ otp: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <span className="text-4xl font-extrabold text-[#e1802be0]">
                Sambhāṣinī संभाषिणी
              </span>
            </div>

            <h2 className="text-3xl font-bold text-black">
              {step === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {step === 'email'
                ? 'Enter your email address and we\'ll send you a reset code'
                : (
                  <>
                    Enter the OTP sent to <span className="font-semibold text-black">{email}</span> and your new password
                  </>
                )
              }
            </p>
          </div>

          <div className="mt-8">
            {step === 'email' ? (
              <form className="space-y-6" onSubmit={emailForm.handleSubmit(handleSendOtp)}>
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
                      {...emailForm.register('email')}
                      className={cn(
                        'appearance-none block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                        emailForm.formState.errors.email ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Enter your email address"
                    />
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {emailForm.formState.errors.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {emailForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200',
                      isLoading
                        ? 'bg-[#e1802be0]/90 cursor-not-allowed'
                        : 'bg-[#e1802be0] hover:bg-[#e1802be0]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform hover:scale-105'
                    )}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <div className="flex items-center">
                        <span>Send Reset Code</span>
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </button>
                </div>

                
              </form>
            ) : (
              <form className="space-y-6" onSubmit={resetForm.handleSubmit(handleResetPassword)}>
                {/* OTP Field */}
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-black">
                    OTP Code
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="otp"
                      type="text"
                      {...resetForm.register('otp')}
                      className={cn(
                        'appearance-none block w-full px-3 py-3 pl-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black',
                        resetForm.formState.errors.otp ? 'border-red-500' : 'border-gray-300',
                        timeLeft === 0 ? 'bg-red-50 border-red-300' : 'bg-white'
                      )}
                      placeholder="Enter 4-digit OTP"
                      maxLength={4}
                      disabled={timeLeft === 0}
                    />
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                  {resetForm.formState.errors.otp && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetForm.formState.errors.otp.message}
                    </p>
                  )}
                </div>

                {/* New Password Field */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-black">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      {...resetForm.register('newPassword')}
                      className={cn(
                        'appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                        resetForm.formState.errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Enter new password"
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
                  {resetForm.formState.errors.newPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-black">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...resetForm.register('confirmPassword')}
                      className={cn(
                        'appearance-none block w-full px-3 py-3 pl-10 pr-10 border rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black bg-white text-black',
                        resetForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      )}
                      placeholder="Confirm new password"
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
                  {resetForm.formState.errors.confirmPassword && (
                    <p className="mt-2 text-sm text-red-600">
                      {resetForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Success/Error Messages */}
                {success && (
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-sm text-green-700">{success}</p>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Expiry Warning */}
                {showExpiryWarning && (
                  <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-500 mr-2" />
                    <p className="text-sm text-orange-700">
                      OTP expires in {formatTime(timeLeft)}. Please complete the reset soon.
                    </p>
                  </div>
                )}

                {/* OTP Expired Warning */}
                {timeLeft === 0 && (
                  <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">
                      Your OTP has expired. Please request a new one to continue.
                    </p>
                  </div>
                )}

                {/* Timer and Resend OTP */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={!canResend && timeLeft > 0}
                    className={cn(
                      "text-sm underline transition-colors",
                      canResend || timeLeft === 0
                        ? "text-black hover:text-gray-700 cursor-pointer"
                        : "text-gray-400 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? "Sending..." : "Resend OTP"}
                  </button>
                  
                  <div className="flex items-center text-sm">
                    {timeLeft > 0 ? (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-orange-500" />
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            "font-mono text-xs",
                            timeLeft <= 60 ? "text-red-500 font-semibold" : "text-gray-600"
                          )}>
                            {formatTime(timeLeft)}
                          </span>
                          <div className="w-16 h-1 bg-gray-200 rounded-full mt-1">
                            <div 
                              className={cn(
                                "h-full rounded-full transition-all duration-1000",
                                timeLeft <= 60 ? "bg-red-500" : "bg-orange-500"
                              )}
                              style={{ width: `${(timeLeft / 300) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        OTP Expired
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isLoading || timeLeft === 0}
                    className={cn(
                      'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200',
                      isLoading || timeLeft === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-[#e1802be0] hover:bg-[#e1802be0]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform hover:scale-105'
                    )}
                  >
                    {isLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <div className="flex items-center">
                        <span>{timeLeft === 0 ? 'OTP Expired' : 'Reset Password'}</span>
                        {timeLeft > 0 && <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                      </div>
                    )}
                  </button>
                </div>


              </form>
            )}

            {/* Navigation Links */}
            <div className="text-center mt-6 space-y-3">
              {step === 'reset' && (
                <button
                  type="button"
                  onClick={() => {
                    setStep('email');
                    setTimeLeft(0);
                    setCanResend(false);
                    setError('');
                    setSuccess('');
                    emailForm.reset();
                    resetForm.reset();
                  }}
                  className="font-medium text-gray-600 hover:text-black flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Change Email Address
                </button>
              )}
              
              <Link
                to="/login"
                className="font-medium text-black hover:text-gray-700 flex items-center justify-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Feature Showcase */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0 bg-[#e1802be0]/70">
          <div className="absolute inset-0 bg-black bg-opacity-20" />
          <div className="relative h-full flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6">
                Secure Password Recovery
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Reset your password securely with email verification
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Email Verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Secure Reset Process</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/app/public')}
                className="text-white mt-8 hover:text-gray-400 flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="tracking-wide">← Go Back to Home Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
