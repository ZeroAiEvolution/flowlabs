import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Search, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  project_url: string | null;
  is_featured: boolean | null;
  created_at: string;
  author_id: string | null;
}

const AdminProjects = () => {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    project_url: '',
    is_featured: false
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setProjects(data);
    if (error) console.error('Error fetching projects:', error);
    setLoading(false);
  };

  const filteredProjects = projects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setEditForm({
      title: '',
      description: '',
      thumbnail_url: '',
      project_url: '',
      is_featured: false
    });
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsCreating(false);
    setEditForm({
      title: project.title,
      description: project.description || '',
      thumbnail_url: project.thumbnail_url || '',
      project_url: project.project_url || '',
      is_featured: project.is_featured || false
    });
  };

  const handleCreate = () => {
    setEditingProject(null);
    setIsCreating(true);
    resetForm();
  };

  const handleSave = async () => {
    setSaving(true);

    if (isCreating) {
      const { error } = await supabase
        .from('student_projects')
        .insert({
          title: editForm.title,
          description: editForm.description || null,
          thumbnail_url: editForm.thumbnail_url || null,
          project_url: editForm.project_url || null,
          is_featured: editForm.is_featured
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create project', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Project created successfully' });
        setIsCreating(false);
        fetchProjects();
      }
    } else if (editingProject) {
      const { error } = await supabase
        .from('student_projects')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          thumbnail_url: editForm.thumbnail_url || null,
          project_url: editForm.project_url || null,
          is_featured: editForm.is_featured
        })
        .eq('id', editingProject.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update project', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Project updated successfully' });
        setEditingProject(null);
        fetchProjects();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    const { error } = await supabase
      .from('student_projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Project deleted successfully' });
      fetchProjects();
    }
  };

  const dialogOpen = isCreating || editingProject !== null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <p className="text-muted-foreground">Manage student projects</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Projects ({filteredProjects.length})</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingProject(null); setIsCreating(false); } }}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" /> Add Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{isCreating ? 'Create Project' : 'Edit Project'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(p => ({ ...p, title: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={editForm.description}
                        onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label>Project URL</Label>
                      <Input
                        value={editForm.project_url}
                        onChange={(e) => setEditForm(p => ({ ...p, project_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Thumbnail URL</Label>
                      <Input
                        value={editForm.thumbnail_url}
                        onChange={(e) => setEditForm(p => ({ ...p, thumbnail_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Featured</Label>
                      <Switch
                        checked={editForm.is_featured}
                        onCheckedChange={(v) => setEditForm(p => ({ ...p, is_featured: v }))}
                      />
                    </div>
                    <Button onClick={handleSave} disabled={saving || !editForm.title} className="w-full">
                      {saving ? 'Saving...' : isCreating ? 'Create' : 'Save Changes'}
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {project.thumbnail_url && (
                          <img 
                            src={project.thumbnail_url} 
                            alt={project.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {project.description || 'No description'}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={project.is_featured ? 'default' : 'secondary'}>
                        {project.is_featured ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(project.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(project)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
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

export default AdminProjects;
