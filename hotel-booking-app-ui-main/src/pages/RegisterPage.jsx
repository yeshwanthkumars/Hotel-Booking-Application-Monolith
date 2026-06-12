import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerUser } from '../services/authService';
import { registerSchema } from '../validations/authSchemas';
import AuthSplitLayout from '../components/auth/AuthSplitLayout';
import AuthField from '../components/auth/AuthField';
import { useToast } from '../components/ui/ToastProvider';

export default function RegisterPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'USER',
    },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');
    try {
      const { username, email, password, role } = data;

      // Validate payload structure before sending
      if (!username || !email || !password || !role) {
        throw new Error('Missing required fields');
      }

      await registerUser({ username, email, password, role });

      setSuccessMsg('Account created successfully! Redirecting to login…');
      toast.success('Account created successfully. Please sign in.');

      // Reset form on success
      reset();

      // Navigate after delay
      setTimeout(() => navigate('/login', { replace: true }), 1500);
    } catch (err) {
      let errorMsg = 'Registration failed. Please try again.';

      // Network/connection errors
      if (!err.response) {
        if (err.message === 'Network Error') {
          errorMsg = 'Network error. Please check your connection and try again.';
        } else {
          errorMsg = err.message || errorMsg;
        }
      }
      // HTTP response errors
      else if (err.response?.status === 409) {
        const detail = err.response.data?.message || '';
        if (detail.includes('username')) {
          errorMsg = 'Username already exists. Please choose a different one.';
        } else if (detail.includes('email')) {
          errorMsg = 'Email already registered. Please use a different email or sign in.';
        } else {
          errorMsg = 'Username or email already exists.';
        }
      } else if (err.response?.status === 400) {
        errorMsg = err.response.data?.message || 'Invalid input. Please check your information.';
      } else if (err.response?.status >= 500) {
        errorMsg = 'Server error. Please try again later.';
      } else {
        errorMsg = err.response?.data?.message || errorMsg;
      }

      setApiError(errorMsg);
      toast.error(errorMsg);
      console.error('Registration error:', { status: err.response?.status, data: err.response?.data });
    }
  };

  return (
    <AuthSplitLayout
      eyebrow="Create Your Account"
      heading="Start your premium stay journey"
      subheading="Sign up to unlock curated properties, effortless bookings, and seamless travel experiences across the globe."
      formTitle="Create your YK StayEase account"
      formSubtitle="Set up your profile in a few quick steps"
    >
      {apiError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-700">
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-2">
        <AuthField
          id="username"
          type="text"
          autoComplete="username"
          placeholder="Choose a username"
          label="Username"
          error={errors.username}
          {...register('username')}
        />

        <AuthField
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          label="Email address"
          error={errors.email}
          {...register('email')}
        />

        <AuthField
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          label="Password"
          error={errors.password}
          {...register('password')}
        />

        <AuthField
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          placeholder="Re-enter password"
          label="Confirm password"
          error={errors.confirmPassword}
          {...register('confirmPassword')}
        />

        <AuthField
          id="role"
          as="select"
          label="Role"
          error={errors.role}
          {...register('role')}
        >
          <option value="USER">USER - Browse and book hotels</option>
          <option value="ADMIN">ADMIN - Manage hotels and rooms</option>
        </AuthField>

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
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-indigo-600 transition hover:text-indigo-500">
          Sign in
        </Link>
      </p>
    </AuthSplitLayout>
  );
}
