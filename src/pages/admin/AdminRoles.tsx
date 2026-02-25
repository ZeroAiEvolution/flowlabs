import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Trash2, Loader2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'user';
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const AdminRoles = () => {
  const { toast } = useToast();
  const [roles, setRoles] = useState<(UserRole & { profile?: Profile })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addForm, setAddForm] = useState({
    user_id: '',
    role: 'user' as 'admin' | 'moderator' | 'user'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    // Fetch roles using raw query since types aren't generated yet
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles' as any)
      .select('*')
      .order('created_at', { ascending: false });

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, avatar_url');

    if (rolesData && profilesData && !rolesError) {
      const typedRoles = rolesData as unknown as UserRole[];
      const rolesWithProfiles = typedRoles.map(role => ({
        ...role,
        profile: profilesData.find(p => p.user_id === role.user_id)
      }));
      setRoles(rolesWithProfiles);
    }

    if (profilesData) setProfiles(profilesData);
    setLoading(false);
  };

  const filteredRoles = roles.filter(role =>
    role.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get profiles that don't have a role yet
  const availableProfiles = profiles.filter(
    profile => !roles.some(role => role.user_id === profile.user_id)
  );

  const handleAdd = async () => {
    if (!addForm.user_id) return;
    setSaving(true);

    const { error } = await supabase
      .from('user_roles' as any)
      .insert({
        user_id: addForm.user_id,
        role: addForm.role
      } as any);

    if (error) {
      toast({ title: 'Error', description: 'Failed to assign role', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Role assigned successfully' });
      setIsAdding(false);
      setAddForm({ user_id: '', role: 'user' });
      fetchData();
    }
    setSaving(false);
  };

  const handleUpdateRole = async (roleId: string, newRole: 'admin' | 'moderator' | 'user') => {
    const { error } = await supabase
      .from('user_roles' as any)
      .update({ role: newRole } as any)
      .eq('id', roleId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Role updated successfully' });
      fetchData();
    }
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm('Are you sure you want to remove this user role?')) return;

    const { error } = await supabase
      .from('user_roles' as any)
      .delete()
      .eq('id', roleId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to remove role', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Role removed successfully' });
      fetchData();
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'default';
      default: return 'secondary';
    }
  };

  // Permanent Admin ID
  const PERMANENT_ADMIN_ID = 'b1a161ab-3b6a-4ac1-bd59-9009e3e15bf4';

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Roles</h1>
        <p className="text-muted-foreground">Manage admin and moderator access</p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Role Permissions
          </CardTitle>
          <CardDescription>Understanding what each role can do</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-secondary/50">
              <Badge variant="destructive" className="mb-2">Admin</Badge>
              <p className="text-sm text-muted-foreground">
                Full access to all features. Can manage users, content, projects, categories, and assign roles.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <Badge variant="default" className="mb-2">Moderator</Badge>
              <p className="text-sm text-muted-foreground">
                Can manage content and projects. Cannot manage users or assign roles.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <Badge variant="secondary" className="mb-2">User</Badge>
              <p className="text-sm text-muted-foreground">
                Basic user access. Can manage their own profile and content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Assigned Roles ({filteredRoles.length})</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" /> Assign Role
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Assign Role to User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>User</Label>
                      <Select
                        value={addForm.user_id}
                        onValueChange={(v) => setAddForm(p => ({ ...p, user_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProfiles.map(profile => (
                            <SelectItem key={profile.user_id} value={profile.user_id}>
                              {profile.full_name || 'Anonymous'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        value={addForm.role}
                        onValueChange={(v: 'admin' | 'moderator' | 'user') => setAddForm(p => ({ ...p, role: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAdd} disabled={saving || !addForm.user_id} className="w-full">
                      {saving ? 'Assigning...' : 'Assign Role'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No roles assigned yet. Add your first admin!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Assigned</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={role.profile?.avatar_url || undefined} />
                          <AvatarFallback>
                            {role.profile?.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`font-medium ${role.user_id === PERMANENT_ADMIN_ID ? 'text-red-500 font-bold' : ''}`}>
                          {role.user_id === PERMANENT_ADMIN_ID ? 'ADMIN' : (role.profile?.full_name || 'Unknown User')}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {role.user_id === PERMANENT_ADMIN_ID ? (
                        <Badge variant="destructive" className="capitalize">
                          {role.role}
                        </Badge>
                      ) : (
                        <Select
                          value={role.role}
                          onValueChange={(v: 'admin' | 'moderator' | 'user') => handleUpdateRole(role.id, v)}
                        >
                          <SelectTrigger className="w-32">
                            <Badge variant={getRoleBadgeVariant(role.role)} className="capitalize">
                              {role.role}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {role.user_id !== PERMANENT_ADMIN_ID && (
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminRoles;
