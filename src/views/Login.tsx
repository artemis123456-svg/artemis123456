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
    <div className="flex min-h-screen items-center justify-center bg-verini-black px-4 py-12 sm:px-6 lg:px-8 relative">
      {/* Decorative background visual elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[60%] h-[60%] rounded-full bg-verini-purple/5 blur-3xl"></div>
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-verini-blue/5 blur-3xl"></div>
      </div>

      <motion.div
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex flex-col items-center mb-10">
          {/* Brand Signature Bars on top of the logo */}
          <div className="flex gap-1 mb-3.5 h-1.5">
            <div className="w-2.5 h-1.5 bg-[#F5B301] rounded-full"></div>
            <div className="w-2.5 h-1.5 bg-[#E84A8A] rounded-full"></div>
            <div className="w-2.5 h-1.5 bg-[#3B82C4] rounded-full"></div>
            <div className="w-2.5 h-1.5 bg-[#2FA69A] rounded-full"></div>
            <div className="w-2.5 h-1.5 bg-[#8B4A9C] rounded-full"></div>
          </div>
          
          <h1 className="font-sans font-black tracking-[0.25em] text-4xl text-white select-none">
            VERINI
          </h1>
          <p className="mt-2 text-xs font-semibold tracking-widest text-verini-grey uppercase">
            ESPAI CREATIU
          </p>
          <p className="mt-1 text-[11px] text-slate-500 font-medium">
            Gestión de reformas e interiorismo
          </p>
        </div>

        <Card className="border-white/10 shadow-2xl bg-verini-charcoal rounded-2xl">
          <CardHeader className="space-y-1 pb-6 border-b border-white/5">
            <CardTitle className="text-xl font-bold text-white">Iniciar sesión</CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Acceso restringido para personal autorizado
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-6">
              {displayedError && (
                <motion.div
                  className="flex gap-2.5 rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 text-xs font-medium text-rose-300"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{displayedError}</span>
                </motion.div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
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
                  className="rounded-xl bg-verini-black border-white/10 text-white placeholder-slate-500 focus:border-white/30 focus:ring-white/20"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
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
                    className="rounded-xl bg-verini-black border-white/10 text-white placeholder-slate-500 pr-10 focus:border-white/30 focus:ring-white/20"
                    required
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-300"
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

            <CardFooter className="flex flex-col pt-4">
              <Button
                type="submit"
                className="w-full rounded-xl bg-white text-verini-black font-semibold py-2.5 hover:bg-slate-100 transition-all cursor-pointer shadow-lg shadow-black/30"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-verini-black" />
                    Iniciando sesión...
                  </>
                ) : (
                  'Iniciar sesión'
                )}
              </Button>
              <p className="mt-4 text-center text-xs text-slate-500 font-medium">
                ¿Problemas para acceder?{' '}
                <span className="text-slate-400 font-semibold cursor-default">
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
