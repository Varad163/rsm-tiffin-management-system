import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const authData = await login(formData);
      toast.success('Welcome back!');

      if (authData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <section className="hidden flex-col justify-between border-r border-zinc-200 px-12 py-16 lg:flex">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
              Tiffin Management
            </p>
            <h1 className="mt-6 max-w-md text-5xl font-semibold leading-[1.05] tracking-tight text-zinc-900">
              Manage meals, orders, and attendance in one place.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-500">
              A clean, modern workspace for hostel tiffin operations — built for admins and students.
            </p>
          </div>
          <p className="text-sm text-zinc-400">Minimal. Fast. Reliable.</p>
        </section>

        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
                Tiffin Management
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                Sign in
              </h1>
            </div>

            <Card>
              <CardHeader
                title="Welcome back"
                subtitle="Enter your credentials to access your dashboard."
                className="mb-6 lg:block hidden"
              />

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  autoComplete="email"
                  required
                />

                <Input
                  label="Password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="current-password"
                  required
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Sign in
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  Create one
                </Link>
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Login;
