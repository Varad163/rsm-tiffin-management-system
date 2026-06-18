import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';
import { getProfile, updateProfile, uploadAadhaar } from '../../services/studentService';
import { getErrorMessage } from '../../utils/errorHandler';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', address: '', collegeName: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      setProfile(data);
      setForm({
        phone: data.phone || '',
        address: data.address || '',
        collegeName: data.collegeName || '',
      });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    try {
      const result = await uploadAadhaar(profile.id, file);
      setProfile((prev) => ({ ...prev, aadhaarImage: result.filePath }));
      toast.success('Aadhaar uploaded successfully');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Student Portal"
        title="Profile"
        subtitle="View and update your personal details and upload Aadhaar."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Personal Information" subtitle="Keep your contact and college details up to date." className="mb-6" />
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" value={profile?.email || ''} disabled />
            <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
            <Input label="College Name" name="collegeName" value={form.collegeName} onChange={handleChange} required />
            <Button type="submit" isLoading={saving}>Save changes</Button>
          </form>
        </Card>

        <Card>
          <CardHeader title="Aadhaar Upload" subtitle="Upload JPG, JPEG, PNG, or PDF up to 5MB." className="mb-6" />
          <div className="space-y-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-zinc-400">Current file</p>
              <p className="mt-1 break-all text-sm text-zinc-700">
                {profile?.aadhaarImage || 'No file uploaded yet'}
              </p>
            </div>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-zinc-700">Choose file</span>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleFileUpload}
                disabled={uploading}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
              />
            </label>
            {uploading && <p className="text-sm text-zinc-500">Uploading...</p>}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
