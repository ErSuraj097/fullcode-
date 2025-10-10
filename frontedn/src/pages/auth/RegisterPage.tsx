import React, { useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Mail, Lock, User, Eye, EyeOff, ArrowRight, Globe, Sparkles, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import { authApi } from '../../api/services/api';
import { toast } from 'react-toastify';

import Logo from '../../../public/SANBHASINI.png'

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

const RegisterPage: React.FC = () => {
  const { user, register, isLoading, sendOtp } = useAuth();
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
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const from = location.state?.from?.pathname || '/app/dashboard';
  const navigate = useNavigate();
  
  // Get email from location state if redirected from login
  const prefilledEmail = location.state?.email || '';
  const fromLogin = location.state?.fromLogin || false;
  
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: prefilledEmail,
    },
  });

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (countdown === 0 && otpSent) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, otpSent]);

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
    setIsSendingOtp(true);
    try {
      await sendOtp(email);
      setOtpSent(true);
      setOtpError('');
      setCountdown(300); // 5 minutes countdown
      setCanResend(false);
      toast.success('📧 OTP sent successfully! Check your email.', {
        position: "top-right",
        autoClose: 4000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send OTP. Please try again.';
      setOtpError(errorMessage);
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const resendOtp = async () => {
    if (!registerData || !canResend) return;
    setIsSendingOtp(true);
    setOtpSent(false);
    setOtp('');
    setOtpError('');
    
    try {
      await sendOtp(registerData.email);
      setOtpSent(true);
      setCountdown(300); // Reset 5 minutes countdown
      setCanResend(false);
      toast.success('📧 New OTP sent successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend OTP. Please try again.';
      setOtpError(errorMessage);
      toast.error(`❌ ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtpAndRegister = async () => {
    if (!registerData || otp.length !== 4) return;
    
    setOtpError('');
    setIsVerifying(true);
    
    try {
      console.log('Starting OTP verification for:', registerData.email);
      
      // First, verify the OTP
      await authApi.verifyOtp({ email: registerData.email, otp });
      
      console.log('OTP verified successfully, proceeding with registration');
      
      toast.success('✅ OTP verified successfully!', {
        position: "top-right",
        autoClose: 2000,
      });
      
      // Small delay to show the verification success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Then register the user
      await register({ 
        name: registerData.name, 
        email: registerData.email, 
        password: registerData.password, 
        confirmPassword: registerData.confirmPassword, 
        otp 
      });
      
      console.log('Registration completed successfully');
      
      toast.success('🎉 Account created successfully! Check your email for welcome message.', {
        position: "top-right",
        autoClose: 5000,
      });
      
      setShowOtpModal(false);
    } catch (error: any) {
      console.error('OTP verification or registration error:', error.response?.data);
      
      const errorMessage = error.response?.data?.error || 'Verification failed. Please try again.';
      
      if (errorMessage.toLowerCase().includes('invalid') || errorMessage.toLowerCase().includes('expired') || errorMessage.toLowerCase().includes('otp')) {
        setOtpError('❌ Invalid or expired OTP. Please check your code or request a new one.');
        toast.error('❌ Invalid or expired OTP. Please try again.', {
          position: "top-right",
          autoClose: 5000,
        });
      } else {
        setOtpError(`❌ ${errorMessage}`);
        toast.error(`❌ ${errorMessage}`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
      {/* <Navbar/> */}
      {/* Left side - Registration Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <div className="flex items-center space-x-2 mb-8">
              <div className="w-[30vh]   h-16  rounded-xl flex items-center justify-center">

                <img src={Logo} alt="Sambhāṣinī Logo" />
              </div>
              <span className="text-4xl font-extrabold text-[#e1802be0]">
                {/* Sambhāṣinī संभाषिणी <br /> */}
              </span>
            </div>

            <h2 className="text-3xl font-bold text-black">
              Create Your Account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {fromLogin ? 'Account not found. Please create a new account.' : 'Sign up to start building amazing chatbots'}
            </p>
            {fromLogin && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  We couldn't find an account with that email. Let's create one for you!
                </p>
              </div>
            )}
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
              <div>


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
                      <span>Create Account</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>

              {/* Sign In Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-medium text-black hover:text-gray-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {/* ← Go Back to Home Page{' '} */}

                  <Link
                    to="/app/public"
                    className="font-medium  lg:hidden text-black hover:text-gray-700"
                  >
                    ← Go Back to Home Page

                    {/* <HomeModernIcon/> */}
                  </Link>
                </p>
              </div>


              {/* <button
                onClick={() => navigate('/app/public')}
                className="text-white mt-8  hover:text-gray-400    flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="tracking-wide">← Go Back to Home Page</span>
              </button> */}
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
                Build Sambhāṣinī संभाषिणी AI Chatbots
              </h1>
              <p className="text-xl mb-8 text-gray-300">
                Create powerful chatbots with advanced AI capabilities and seamless integration
              </p>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Globe className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Multi-language Support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Advanced AI Training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <span className="text-lg">Beautiful Customization</span>
                </div>
              </div>

              <div className="mt-12 p-6 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm">
                <p className="text-sm text-gray-300 mb-2">Trusted by thousands of businesses</p>
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-white rounded-full" />
                  ))}
                  <span className="text-sm ml-2">Excellent rating</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/app/public')}
                className="text-white mt-8  hover:text-gray-400    flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="tracking-wide">← Go Back to Home Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#e1802be0] rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h3>
              <p className="text-gray-600">
                We've sent a 4-digit verification code to
              </p>
              <p className="font-semibold text-[#e1802be0] break-all">
                {registerData?.email}
              </p>
            </div>

            {isSendingOtp && (
              <div className="flex items-center justify-center mb-4">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-gray-600">Sending OTP...</span>
              </div>
            )}

            {otpError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                <p className="text-red-700 text-sm">{otpError}</p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Verification Code
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, ''); // Only allow digits
                  setOtp(value);
                  if (otpError) setOtpError(''); // Clear error when user types
                }}
                placeholder="0000"
                className={cn(
                  "w-full p-4 text-center text-2xl font-mono tracking-widest border rounded-xl focus:outline-none focus:ring-2 transition-all",
                  otpError 
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500" 
                    : "border-gray-300 focus:ring-[#e1802be0] focus:border-[#e1802be0]",
                  otp.length === 4 ? "border-green-300 bg-green-50" : ""
                )}
                maxLength={4}
                autoComplete="one-time-code"
              />
              {otp.length === 4 && (
                <div className="flex items-center mt-2 text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Code entered</span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-6">
              <button
                type="button"
                onClick={resendOtp}
                disabled={!canResend || isSendingOtp}
                className={cn(
                  "text-sm font-medium transition-all",
                  canResend && !isSendingOtp
                    ? "text-[#e1802be0] hover:text-[#e1802be0]/80 cursor-pointer"
                    : "text-gray-400 cursor-not-allowed"
                )}
              >
                {isSendingOtp ? 'Sending...' : 'Resend Code'}
              </button>
              
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-1" />
                {countdown > 0 ? (
                  <span>Expires in {formatTime(countdown)}</span>
                ) : (
                  <span className="text-red-500">Code expired</span>
                )}
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpModal(false);
                  setOtp('');
                  setOtpError('');
                  setCountdown(0);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={verifyOtpAndRegister}
                disabled={isVerifying || otp.length !== 4 || countdown === 0}
                className={cn(
                  "flex-1 px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center",
                  isVerifying || otp.length !== 4 || countdown === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#e1802be0] text-white hover:bg-[#e1802be0]/90 transform hover:scale-105"
                )}
              >
                {isVerifying ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Verify & Register
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Didn't receive the code? Check your spam folder or try resending.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterPage;