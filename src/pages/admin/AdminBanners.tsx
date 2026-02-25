import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, ArrowUp, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Banner {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const AdminBanners = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    link_url: '',
    is_active: true,
    display_order: 0,
  });
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners' as any)
      .select('*')
      .order('display_order', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch banners', variant: 'destructive' });
    } else {
      setBanners((data as unknown as Banner[]) || []);
    }
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Invalid file', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 5MB', variant: 'destructive' });
      return;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('banners')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('banners')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: urlData.publicUrl }));
      setPreviewImage(urlData.publicUrl);
      toast({ title: 'Success', description: 'Image uploaded successfully' });
    } catch (error) {
      console.error('Upload error:', error);
      toast({ title: 'Upload failed', description: 'Failed to upload image', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.image_url) {
      toast({ title: 'Error', description: 'Image is required', variant: 'destructive' });
      return;
    }

    if (editingBanner) {
      const { error } = await supabase
        .from('banners' as any)
        .update({
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          display_order: formData.display_order,
        })
        .eq('id', editingBanner.id);

      if (error) {
        toast({ title: 'Error', description: 'Failed to update banner', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Banner updated successfully' });
        resetForm();
        fetchBanners();
      }
    } else {
      const { error } = await supabase
        .from('banners' as any)
        .insert({
          title: formData.title,
          description: formData.description || null,
          image_url: formData.image_url,
          link_url: formData.link_url || null,
          is_active: formData.is_active,
          display_order: banners.length,
        });

      if (error) {
        toast({ title: 'Error', description: 'Failed to create banner', variant: 'destructive' });
      } else {
        toast({ title: 'Success', description: 'Banner created successfully' });
        resetForm();
        fetchBanners();
      }
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      is_active: banner.is_active,
      display_order: banner.display_order,
    });
    setPreviewImage(banner.image_url);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('banners' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete banner', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Banner deleted successfully' });
      fetchBanners();
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from('banners' as any)
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update banner', variant: 'destructive' });
    } else {
      fetchBanners();
    }
  };

  const handleReorder = async (banner: Banner, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === banner.id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= banners.length) return;

    const otherBanner = banners[newIndex];
    
    await Promise.all([
      supabase.from('banners' as any).update({ display_order: newIndex }).eq('id', banner.id),
      supabase.from('banners' as any).update({ display_order: currentIndex }).eq('id', otherBanner.id),
    ]);
    
    fetchBanners();
  };

  const resetForm = () => {
    setEditingBanner(null);
    setFormData({
      title: '',
      description: '',
      image_url: '',
      link_url: '',
      is_active: true,
      display_order: 0,
    });
    setPreviewImage(null);
    setIsDialogOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Banners</h1>
          <p className="text-muted-foreground">Manage homepage banner carousel</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Banner
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Banner Image *</Label>
                <div className="flex flex-col gap-4">
                  {previewImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreviewImage(null);
                          setFormData(prev => ({ ...prev, image_url: '' }));
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImageIcon className="w-12 h-12 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload banner image</p>
                      <p className="text-xs text-muted-foreground">Recommended: 1920x600px</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                </div>
              </div>


              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_url">Link URL</Label>
                <Input
                  id="link_url"
                  value={formData.link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                  placeholder="https://example.com"
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingBanner ? 'Update Banner' : 'Create Banner'}
                </Button>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Banners</CardTitle>
        </CardHeader>
        <CardContent>
          {banners.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No banners yet. Click "Add Banner" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Order</TableHead>
                  <TableHead className="w-32">Preview</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banners.map((banner, index) => (
                  <TableRow key={banner.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === 0}
                          onClick={() => handleReorder(banner, 'up')}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          disabled={index === banners.length - 1}
                          onClick={() => handleReorder(banner, 'down')}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-24 h-14 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell>
                      {banner.link_url ? (
                        <p className="text-sm text-muted-foreground truncate max-w-xs">
                          {banner.link_url}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No link</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={banner.is_active}
                        onCheckedChange={() => handleToggleActive(banner)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(banner.id)}>
                          <Trash2 className="w-4 h-4" />
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

export default AdminBanners;