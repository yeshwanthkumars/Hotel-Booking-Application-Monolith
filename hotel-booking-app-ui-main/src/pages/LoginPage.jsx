import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { loginSchema } from '../validations/authSchemas';
import { useAuth } from '../context/AuthContext';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';
import AuthField from '../components/auth/AuthField';
import { useToast } from '../components/ui/ToastProvider';

const REMEMBERED_USER_KEY = 'rememberedUsername';

export default function LoginPage() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const toast = useToast();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: localStorage.getItem(REMEMBERED_USER_KEY) || '',
      password: '',
      rememberMe: !!localStorage.getItem(REMEMBERED_USER_KEY),
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    try {
      const response = await login(data);

      // Validate response structure
      if (!response?.token || !response?.username) {
        throw new Error('Invalid response from server');
      }

      // Handle remember me preference
      if (data.rememberMe) {
        localStorage.setItem(REMEMBERED_USER_KEY, data.username);
      } else {
        localStorage.removeItem(REMEMBERED_USER_KEY);
      }

      // Save auth session and navigate
      saveSession(response);
      toast.success(`Welcome back, ${response.username}!`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      // Comprehensive error handling
      let errorMsg = 'Something went wrong. Please try again.';

      // Network/connection errors
      if (!err.response) {
        if (err.message === 'Network Error') {
          errorMsg = 'Network error. Please check your connection and try again.';
        } else {
          errorMsg = err.message || errorMsg;
        }
      }
      // HTTP response errors
      else if (err.response?.status === 401) {
        errorMsg = 'Invalid username or password. Please check and try again.';
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data?.message || 'Invalid credentials format.';
      } else if (err.response?.status >= 500) {
        errorMsg = 'Server error. Please try again later.';
      } else {
        // Use backend message if available
        errorMsg = err.response?.data?.message || errorMsg;
      }

      setApiError(errorMsg);
      toast.error(errorMsg);
      console.error('Login error:', { status: err.response?.status, data: err.response?.data });
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Welcome Back"
      heading="Book luxury stays effortlessly"
      subheading="Discover premium hotels worldwide with one secure account and manage your travel with confidence."
      formTitle="Sign in to your account"
      formSubtitle="Use your YK StayEase credentials to continue"
    >
      {apiError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
        <AuthField
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Enter your username"
          label="Username"
          error={errors.username}
          {...register('username')}
        />

        <AuthField
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          label="Password"
          error={errors.password}
          {...register('password')}
        />

        <div className="mt-1 flex items-center justify-between gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              {...register('rememberMe')}
            />
            Remember me
          </label>

          <a
            href="mailto:support@hotelbooking.com?subject=Password%20Reset%20Request"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition duration-200 hover:-translate-y-0.5 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-indigo-600 transition hover:text-indigo-500">
          Create one
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
