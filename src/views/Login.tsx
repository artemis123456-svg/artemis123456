import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { TrendingUp, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { signInWithEmail, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLocalError('Por favor, introduce tu email y contraseña.');
      return;
    }

    setLocalError(null);
    setIsSubmitting(true);

    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        // Map common Supabase error messages to friendly Spanish ones
        if (error.message.includes('Invalid login credentials')) {
          setLocalError('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
        } else {
          setLocalError(error.message);
        }
      }
    } catch (err: any) {
      console.error('Error in login submit:', err);
      setLocalError('Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = localError || authError;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative background visual elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-50/40 blur-3xl"></div>
        <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-slate-100/60 blur-3xl"></div>
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/20"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <TrendingUp className="h-6 w-6" />
          </motion.div>
          <h1 className="mt-4 font-heading text-3xl font-extrabold tracking-tight text-slate-900">
            Verini<span className="text-indigo-600">CRM</span>
          </h1>
          <p className="mt-1.5 text-sm font-medium text-slate-500">
            Gestión de reformas e interiorismo
          </p>
        </div>

        <Card className="border-slate-200/80 shadow-xl shadow-slate-100 bg-white rounded-2xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold text-slate-900">Iniciar sesión</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Acceso restringido para personal autorizado
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {displayedError && (
                <motion.div
                  className="flex gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-xs font-medium text-rose-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                  <span>{displayedError}</span>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@veriniglobal.com"
                  autoComplete="email"
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border-slate-200/80 focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isSubmitting}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border-slate-200/80 pr-10 focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col pt-2">
              <Button
                type="submit"
                className="w-full rounded-xl bg-indigo-600 py-2.5 font-semibold text-white shadow-lg shadow-indigo-600/10 hover:bg-indigo-700 hover:shadow-indigo-600/20 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
              <p className="mt-4 text-center text-xs text-slate-400 font-medium">
                ¿Problemas para acceder?{' '}
                <span className="text-slate-500 font-semibold cursor-default">
                  Contacta con el administrador.
                </span>
              </p>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
