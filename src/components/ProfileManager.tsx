import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Edit, Save, X, Briefcase, GraduationCap, Upload, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  profession: string | null;
}

interface ProfileManagerProps {
  onProfileUpdate?: () => void;
}

const ProfileManager = ({ onProfileUpdate }: ProfileManagerProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, bio, avatar_url, profession')
      .eq('user_id', user.id)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive'
      });
    }
    
    if (data) {
      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
      });
      setPreviewUrl(data.avatar_url);
    }
    
    setLoading(false);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file',
        variant: 'destructive'
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);

    try {
      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add cache buster to force refresh
      const urlWithCacheBuster = `${publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: urlWithCacheBuster,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setPreviewUrl(urlWithCacheBuster);
      if (profile) {
        setProfile({ ...profile, avatar_url: urlWithCacheBuster });
      }

      toast({
        title: 'Success',
        description: 'Profile picture updated'
      });

      onProfileUpdate?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload profile picture',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name.trim() || null,
        bio: editForm.bio.trim() || null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
      setIsEditing(false);
      fetchProfile();
      onProfileUpdate?.();
    }
    
    setSaving(false);
  };

  const handleCancel = () => {
    setEditForm({
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Loading profile...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-12 text-center">
          <User className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No profile found. Please sign in.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-b from-primary/10 to-transparent pb-8">
          <div className="relative inline-block mx-auto mb-4">
            <Avatar className="w-24 h-24 border-4 border-background shadow-lg">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                {editForm.full_name?.split(' ').map(n => n[0]).join('') || profile.full_name?.split(' ').map(n => n[0]).join('') || '?'}
              </AvatarFallback>
            </Avatar>
            {profile.profession && (
              <div className="absolute -bottom-2 -right-2 p-2 bg-primary rounded-full">
                {profile.profession === 'student' ? (
                  <GraduationCap className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Briefcase className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
            )}
            
            {/* Upload button overlay */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute -bottom-2 -left-2 rounded-full w-8 h-8"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">Click the upload icon to change your profile picture</p>
          
          {isEditing ? (
            <div className="space-y-4 text-left">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, full_name: e.target.value }))}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </div>
          ) : (
            <>
              <CardTitle className="text-2xl">{profile.full_name || 'Anonymous User'}</CardTitle>
              <CardDescription className="text-base">
                {profile.bio || 'No bio yet. Click edit to add one!'}
              </CardDescription>
              <Badge variant="secondary" className="mx-auto mt-2 capitalize">
                {profile.profession === 'student' ? (
                  <><GraduationCap className="w-3 h-3 mr-1" /> Student</>
                ) : (
                  <><Briefcase className="w-3 h-3 mr-1" /> Professional</>
                )}
              </Badge>
            </>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProfileManager;
