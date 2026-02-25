import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Lock, AlertCircle, GraduationCap, Briefcase } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import loginIllustration from '@/assets/login-illustration.png';

const BLOCKED_EMAIL_DOMAINS = [
  'tempmail.com', 'throwaway.email', 'guerrillamail.com', 'guerrillamail.net',
  'mailinator.com', 'yopmail.com', 'sharklasers.com', 'guerrillamailblock.com',
  'grr.la', 'dispostable.com', 'trashmail.com', 'trashmail.me', 'trashmail.net',
  'tempail.com', 'temp-mail.org', 'temp-mail.io', 'fakeinbox.com', 'mailnesia.com',
  'maildrop.cc', 'discard.email', 'mohmal.com', 'getnada.com', 'emailondeck.com',
  'tempinbox.com', '10minutemail.com', '10minutemail.net', 'minutemail.com',
  'tempr.email', 'throwaway.email', 'tmpmail.org', 'tmpmail.net', 'bupmail.com',
  'mytemp.email', 'tempmailo.com', 'tempmailaddress.com', 'burnermail.io',
  'inboxkitten.com', 'mailsac.com', 'harakirimail.com', 'tmail.ws',
  'crazymailing.com', 'mailcatch.com', 'mintemail.com', 'tempomail.fr',
  'spamgourmet.com', 'safetymail.info', 'filzmail.com', 'mailexpire.com',
  'tempsky.com', 'mail-temporaire.fr', 'jetable.org', 'emailfake.com',
  'generator.email', 'emltmp.com', 'disposableemailcheck.com',
];

const emailSchema = z.string().email('Please enter a valid email address').refine(
  (email) => {
    const domain = email.split('@')[1]?.toLowerCase();
    return !BLOCKED_EMAIL_DOMAINS.includes(domain);
  },
  { message: 'Temporary or disposable email addresses are not allowed' }
);
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type Profession = 'student' | 'professional';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showProfessionSelection, setShowProfessionSelection] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    profession: '' as Profession | '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user, signUp, signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (user) {
        // Check if profile exists and has profession
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('profession')
            .eq('user_id', user.id)
            .single();

          if (!profile?.profession) {
            setShowProfessionSelection(true);
          } else {
            navigate('/home');
          }
        } catch (error) {
          console.error("Error checking profile", error);
          navigate('/home');
        }
      }
    };
    checkUser();
  }, [user, navigate]);


  const handleProfessionSelect = async (profession: Profession) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          profession,
          full_name: user.user_metadata?.full_name || formData.fullName || 'User',
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) {
        toast.error('Failed to update profile');
        console.error(error);
      } else {
        navigate('/home');
      }
    } catch (err) {
      console.error(err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(formData.email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(formData.password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }

    if (isSignUp) {
      try {
        nameSchema.parse(formData.fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }

      if (!formData.profession) {
        newErrors.profession = 'Please select your profession';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName, formData.profession as Profession);
        if (error) {
          if (error.message.includes('already registered')) {
            toast.error('This email is already registered. Please sign in instead.');
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success('Account created successfully!');
          navigate('/home');
        }
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login')) {
            toast.error('Invalid email or password. Please try again.');
          } else {
            toast.error(error.message);
          }
        } else {
          // Success handled by useEffect
          toast.success('Welcome back!');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // No profession check needed here, we do it after login in useEffect
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
    }
    setIsLoading(false);
  };

  if (showProfessionSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
        <div className="w-full max-w-md bg-background rounded-2xl p-8 shadow-lg text-center">
          <GraduationCap className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-2xl font-bold mb-2">One Last Step</h1>
          <p className="text-muted-foreground mb-8">Please select your profession to complete your profile.</p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleProfessionSelect('student')}
              disabled={isLoading}
              className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
            >
              <GraduationCap className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold">Student</span>
            </button>
            <button
              onClick={() => handleProfessionSelect('professional')}
              disabled={isLoading}
              className="p-6 rounded-2xl border-2 border-border hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center gap-3 group"
            >
              <Briefcase className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="font-semibold">Professional</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col-reverse lg:flex-row bg-background">
      {/* Left Side - Illustration (Now falls to bottom on mobile due to flex-col-reverse) */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 pt-0 lg:pt-16 pb-12 lg:pb-16">
        <div className="w-full max-w-md text-center mx-auto">
          <img
            src={loginIllustration}
            alt="Student with laptop"
            className="w-48 sm:w-64 lg:w-full max-w-sm h-auto mx-auto object-contain drop-shadow-sm"
          />
          <p className="text-center text-muted-foreground mt-4 lg:mt-8 font-medium text-sm lg:text-base max-w-[280px] lg:max-w-md mx-auto leading-relaxed">
            Join thousands of students and professionals building the future together
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-16 pt-12 lg:pt-16">
        <div className="w-full max-w-[380px] lg:max-w-md mx-auto">
          <div className="mb-8 lg:mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-bold mb-2">Flow Labs</h1>
            <p className="text-muted-foreground">
              Connect with professionals and find your dream opportunity
            </p>
          </div>

          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-2xl font-semibold mb-6">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="pl-12 h-14 rounded-2xl border-border bg-secondary/50"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Profession Selection */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-3">I am a...</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profession: 'student' })}
                        className={`p - 4 rounded - 2xl border - 2 transition - all flex flex - col items - center gap - 2 ${formData.profession === 'student'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          } `}
                      >
                        <GraduationCap className={`w - 8 h - 8 ${formData.profession === 'student' ? 'text-primary' : 'text-muted-foreground'} `} />
                        <span className={`font - medium ${formData.profession === 'student' ? 'text-primary' : ''} `}>Student</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, profession: 'professional' })}
                        className={`p - 4 rounded - 2xl border - 2 transition - all flex flex - col items - center gap - 2 ${formData.profession === 'professional'
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                          } `}
                      >
                        <Briefcase className={`w - 8 h - 8 ${formData.profession === 'professional' ? 'text-primary' : 'text-muted-foreground'} `} />
                        <span className={`font - medium ${formData.profession === 'professional' ? 'text-primary' : ''} `}>Professional</span>
                      </button>
                    </div>
                    {errors.profession && (
                      <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" /> {errors.profession}
                      </p>
                    )}
                  </div>
                </>
              )}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-12 h-14 rounded-2xl border-border bg-secondary/50"
                  />
                </div>
                {errors.email && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.email}
                  </p>
                )}
              </div>
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-12 h-14 rounded-2xl border-border bg-secondary/50"
                  />
                </div>
                {errors.password && (
                  <p className="text-destructive text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.password}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 rounded-4xl text-base font-medium"
              >
                {isLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>
            </form>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-border" />
            {/* Only show "or continue with" header if Google button is visible (i.e. not sign up) */}
            {!isSignUp && <span className="text-muted-foreground text-sm">or continue with</span>}
            <div className="flex-1 h-px bg-border" />
          </div>

          {!isSignUp && (
            <div className="flex justify-center mb-8">
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-14 border border-border rounded-2xl flex items-center justify-center gap-3 hover:bg-secondary transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="font-medium">Continue with Google</span>
              </button>
            </div>
          )}

          <p className="text-center text-muted-foreground text-sm">
            By creating an account or signing in, you agree to our{' '}
            <Link to="/terms" target="_blank" className="text-foreground underline hover:text-primary transition-colors">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank" className="text-foreground underline hover:text-primary transition-colors">Privacy Policy</Link>
          </p>

          <p className="text-center text-muted-foreground text-sm mt-6">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-foreground font-medium underline"
            >
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
