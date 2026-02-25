import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

const AdminCategories = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('content_categories')
      .select('*')
      .order('name');

    if (data) setCategories(data);
    if (error) console.error('Error fetching categories:', error);
    setLoading(false);
  };

  const resetForm = () => {
    setEditForm({ name: '', description: '' });
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsCreating(false);
    setEditForm({
      name: category.name,
      description: category.description || ''
    });
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setIsCreating(true);
    resetForm();
  };

  const handleSave = async () => {
    setSaving(true);

    if (isCreating) {
      const { error } = await supabase
        .from('content_categories')
        .insert({
          name: editForm.name,
          description: editForm.description || null
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create category', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Category created successfully' });
        setIsCreating(false);
        fetchCategories();
      }
    } else if (editingCategory) {
      const { error } = await supabase
        .from('content_categories')
        .update({
          name: editForm.name,
          description: editForm.description || null
        })
        .eq('id', editingCategory.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update category', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Category updated successfully' });
        setEditingCategory(null);
        fetchCategories();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    const { error } = await supabase
      .from('content_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Category deleted successfully' });
      fetchCategories();
    }
  };

  const dialogOpen = isCreating || editingCategory !== null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Categories</h1>
        <p className="text-muted-foreground">Manage content categories</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Categories ({categories.length})</CardTitle>
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingCategory(null); setIsCreating(false); } }}>
              <DialogTrigger asChild>
                <Button onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{isCreating ? 'Create Category' : 'Edit Category'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(p => ({ ...p, description: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving || !editForm.name} className="w-full">
                    {saving ? 'Saving...' : isCreating ? 'Create' : 'Save Changes'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No categories yet. Create your first category!
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.description || 'No description'}
                    </TableCell>
                    <TableCell>{new Date(category.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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

export default AdminCategories;
