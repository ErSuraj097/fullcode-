import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Bot, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../../providers/AuthProvider';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { cn } from '../../utils/cn';
import Logo from '../../../public/SANBHASINI.png';
import Navbar from '../public/Navbar';
import Footer from '../public/Footer';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, login, isLoading } = useAuth();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);


  const from = location.state?.from?.pathname || '/app/dashboard';
  const navigate = useNavigate();
  const {
    register: formRegister,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already authenticated
  if (user) {
    const redirectTo = user.role === 'admin' ? '/admin' : from;
    return <Navigate to={redirectTo} replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login({ email: data.email, password: data.password });
    } catch (error: any) {
      // Check if we should redirect to signup
      if (error.redirectToSignup) {
        setTimeout(() => {
          navigate('/register', { 
            state: { 
              email: data.email,
              fromLogin: true 
            } 
          });
        }, 2000); // Wait 2 seconds for user to see the message
      }
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
    <>
    
    <div className="min-h-screen flex bg-white">
      {/* <Navbar/> */}
      {/* Left side - Login Form */}
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
              Sign In
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your account to continue
            </p>
          </div>

          <div className="mt-8">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                    autoComplete="current-password"
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
              {/* forgate */}

              <div className="text-center space-y-2">
                <p className="text-sm font-bold flex justify-center text-gray-600">
                  <Link
                    to="/forgot-password"
                    className="font-medium text-black hover:text-gray-700"
                  > Forgot password ?
                  </Link>
                </p>
                <p className="text-sm font-bold flex justify-center text-gray-600">
                  <Link
                    to="/reactivate-account"
                    className="font-medium text-blue-600 hover:text-blue-700"
                  > Reactivate deactivated account
                  </Link>
                </p>
              </div>
              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={cn(
                    'group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white transition-all duration-200',
                    isSubmitting
                      ? 'bg-[#e1802be0] cursor-not-allowed'
                      : 'bg-[#e1802be0] hover:bg-[#e1802be0]/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transform hover:scale-105'
                  )}
                >
                  {isSubmitting ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <div className="flex items-center">
                      <span>Sign In</span>
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </div>


              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className="font-medium text-black hover:text-gray-700"
                  >
                    Sign up
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
            </form>
          </div>
        </div>
      </div>

      {/* Right side - Feature Showcase */}
      <div className="hidden lg:block relative w-0 flex-1">
        <div className="absolute inset-0  bg-[#e1802be0]/70">
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
                className="text-white mt-8 hover:text-gray-400 flex items-center gap-2 transition-all duration-200 group"
              >
                <span className="tracking-wide">← Go Back to Home Page</span>
              </button>
            </div>
          </div>
        </div>
      </div>


    </div>
    {/* <Footer/> */}

    </>
  );
};

export default LoginPage;
