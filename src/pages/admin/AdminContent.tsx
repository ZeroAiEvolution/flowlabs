import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Search, Edit, Trash2, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Content {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  content_url: string | null;
  thumbnail_url: string | null;
  is_published: boolean | null;
  created_at: string;
  category_id: string | null;
}

interface Category {
  id: string;
  name: string;
}

const AdminContent = () => {
  const { toast } = useToast();
  const [content, setContent] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    content_type: 'blog',
    content_url: '',
    thumbnail_url: '',
    embed_code: '',
    is_published: false,
    category_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [{ data: contentData }, { data: categoriesData }] = await Promise.all([
      supabase.from('content').select('*').order('created_at', { ascending: false }),
      supabase.from('content_categories').select('*')
    ]);

    if (contentData) setContent(contentData);
    if (categoriesData) setCategories(categoriesData);
    setLoading(false);
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setEditForm({
      title: '',
      description: '',
      content_type: 'blog',
      content_url: '',
      thumbnail_url: '',
      embed_code: '',
      is_published: false,
      category_id: ''
    });
  };

  const handleEdit = (item: Content) => {
    setEditingContent(item);
    setIsCreating(false);
    setEditForm({
      title: item.title,
      description: item.description || '',
      content_type: item.content_type,
      content_url: item.content_url || '',
      thumbnail_url: item.thumbnail_url || '',
      embed_code: (item as any).embed_code || '',
      is_published: item.is_published || false,
      category_id: item.category_id || ''
    });
  };

  const handleCreate = () => {
    setEditingContent(null);
    setIsCreating(true);
    resetForm();
  };

  const handleSave = async () => {
    setSaving(true);

    if (isCreating) {
      const { error } = await supabase
        .from('content')
        .insert({
          title: editForm.title,
          description: editForm.description || null,
          content_type: editForm.content_type,
          content_url: editForm.content_url || null,
          thumbnail_url: editForm.thumbnail_url || null,
          embed_code: editForm.embed_code || null,
          is_published: editForm.is_published,
          category_id: editForm.category_id || null
        } as any);

      if (error) {
        toast({ title: 'Error', description: 'Failed to create content', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Content created successfully' });
        setIsCreating(false);
        fetchData();
      }
    } else if (editingContent) {
      const { error } = await supabase
        .from('content')
        .update({
          title: editForm.title,
          description: editForm.description || null,
          content_type: editForm.content_type,
          content_url: editForm.content_url || null,
          thumbnail_url: editForm.thumbnail_url || null,
          embed_code: editForm.embed_code || null,
          is_published: editForm.is_published,
          category_id: editForm.category_id || null,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', editingContent.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update content', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Content updated successfully' });
        setEditingContent(null);
        fetchData();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    const { error } = await supabase
      .from('content')
      .delete()
      .eq('id', contentId);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete content', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Content deleted successfully' });
      fetchData();
    }
  };

  const dialogOpen = isCreating || editingContent !== null;

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content</h1>
        <p className="text-muted-foreground">Manage all content items</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Content ({filteredContent.length})</CardTitle>
            <div className="flex gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) { setEditingContent(null); setIsCreating(false); } }}>
                <DialogTrigger asChild>
                  <Button onClick={handleCreate}>
                    <Plus className="w-4 h-4 mr-2" /> Add Content
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>{isCreating ? 'Create Content' : 'Edit Content'}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
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
                      <Label>Type</Label>
                      <Select
                        value={editForm.content_type}
                        onValueChange={(v) => setEditForm(p => ({ ...p, content_type: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blog">Blog</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="resource">Resource</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select
                        value={editForm.category_id}
                        onValueChange={(v) => setEditForm(p => ({ ...p, category_id: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Content URL</Label>
                      <Input
                        value={editForm.content_url}
                        onChange={(e) => setEditForm(p => ({ ...p, content_url: e.target.value }))}
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
                    <div>
                      <Label>Embed Code</Label>
                      <Textarea
                        value={editForm.embed_code}
                        onChange={(e) => setEditForm(p => ({ ...p, embed_code: e.target.value }))}
                        placeholder='Paste YouTube iframe or embed HTML here...'
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Paste an iframe embed code (e.g. from YouTube, Google Drive, etc.)
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Published</Label>
                      <Switch
                        checked={editForm.is_published}
                        onCheckedChange={(v) => setEditForm(p => ({ ...p, is_published: v }))}
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
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContent.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground truncate max-w-[300px]">
                          {item.description || 'No description'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{item.content_type}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.is_published ? 'default' : 'secondary'}>
                        {item.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
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

export default AdminContent;
