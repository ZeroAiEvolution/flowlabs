import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  profession: string | null;
  created_at: string;
}

const AdminUsers = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    profession: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setUsers(data);
    if (error) console.error('Error fetching users:', error);
    setLoading(false);
  };

  const filteredUsers = users.filter(user =>
    user.full_name !== 'Main Admin' && // Hide Main Admin
    (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.profession?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleEdit = (user: Profile) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || '',
      bio: user.bio || '',
      profession: user.profession || ''
    });
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: editForm.full_name || null,
        bio: editForm.bio || null,
        profession: editForm.profession || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', editingUser.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update user', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'User updated successfully' });
      setEditingUser(null);
      fetchUsers();
    }
    setSaving(false);
  };

  const handleDelete = async (user: Profile) => {
    if (!confirm('Are you sure you want to delete this user profile?')) return;

    const { error } = await supabase.rpc('admin_delete_user', {
      target_user_id: user.user_id
    });

    if (error) {
      console.error("Deletion error:", error);
      toast({ title: 'Error', description: error.message || 'Failed to delete user', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'User deleted successfully' });
      fetchUsers();
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-muted-foreground">Manage all user profiles</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Profession</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={user.avatar_url || undefined} />
                          <AvatarFallback>
                            {user.full_name?.split(' ').map(n => n[0]).join('') || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {user.bio || 'No bio'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {user.profession || 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editingUser?.id === user.id} onOpenChange={(open) => !open && setEditingUser(null)}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(user)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit User</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label>Full Name</Label>
                                <Input
                                  value={editForm.full_name}
                                  onChange={(e) => setEditForm(p => ({ ...p, full_name: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label>Bio</Label>
                                <Textarea
                                  value={editForm.bio}
                                  onChange={(e) => setEditForm(p => ({ ...p, bio: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label>Profession</Label>
                                <Select
                                  value={editForm.profession}
                                  onValueChange={(v) => setEditForm(p => ({ ...p, profession: v }))}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="professional">Professional</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button onClick={handleSave} disabled={saving} className="w-full">
                                {saving ? 'Saving...' : 'Save Changes'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(user)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
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

export default AdminUsers;
