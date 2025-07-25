import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import SocialLoginButtons from '../components/ui/SocialLoginButtons';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled in AuthContext
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Connexion à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Ou{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
            >
              créez un nouveau compte
            </Link>
          </p>
        </div>

        {/* Authentification sociale */}
        <div className="space-y-6">
          <SocialLoginButtons />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Ou continuez avec votre email
              </span>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="relative">
              <Input
                label="Adresse email"
                type="email"
                autoComplete="email"
                placeholder="votre@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Mail className="absolute right-3 top-9 h-5 w-5 text-gray-400" />
            </div>

            <div className="relative">
              <Input
                label="Mot de passe"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-9 h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isSubmitting}
          >
            Se connecter
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Nouveau ici ?
              </span>
            </div>
          </div>

          <div className="mt-6">
            <Link to="/register">
              <Button variant="ghost" className="w-full">
                Créer un compte
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 