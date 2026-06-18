import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { getErrorMessage, getFieldErrors } from '../../utils/errorHandler';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
      });

      toast.success('Account created successfully!');
      navigate('/student/dashboard');
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
              Start managing your tiffin experience.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-zinc-500">
              Register as a student to view menus, place orders, and track attendance.
            </p>
          </div>
          <p className="text-sm text-zinc-400">Join your hostel tiffin system today.</p>
        </section>

        <section className="flex items-center justify-center px-4 py-12 sm:px-8">
          <div className="w-full max-w-md">
            <div className="mb-10 lg:hidden">
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-zinc-400">
                Tiffin Management
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900">
                Create account
              </h1>
            </div>

            <Card>
              <CardHeader
                title="Student registration"
                subtitle="Create your account to access the student portal."
                className="mb-6 lg:block hidden"
              />

              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="you@college.com"
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
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  autoComplete="new-password"
                  required
                />

                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  autoComplete="new-password"
                  required
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Create account
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-zinc-500">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-zinc-900 underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Register;
