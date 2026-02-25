
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Upload, Image as ImageIcon, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Partner {
    id: string;
    name: string;
    logo_url: string;
    website_url: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

const AdminPartners = () => {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        logo_url: '',
        website_url: '',
        is_active: true,
        display_order: 0,
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchPartners();
    }, []);

    const fetchPartners = async () => {
        const { data, error } = await supabase
            .from('community_partners' as any)
            .select('*')
            .order('display_order', { ascending: true });

        if (error) {
            console.error('Error fetching partners:', error);
            // Don't show error toast on 404/empty table initially to avoid noise if table doesn't exist yet
        } else {
            setPartners((data as unknown as Partner[]) || []);
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
            const fileName = `partner-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            // Upload to 'partners' bucket, falling back to 'banners' if partners doesn't exist?
            // Let's try 'partners' bucket first. User might need to create it.
            const bucketName = 'banners'; // Reusing banners bucket for simplicity as it exists

            const { error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from(bucketName)
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, logo_url: urlData.publicUrl }));
            setPreviewImage(urlData.publicUrl);
            toast({ title: 'Success', description: 'Logo uploaded successfully' });
        } catch (error) {
            console.error('Upload error:', error);
            toast({ title: 'Upload failed', description: 'Failed to upload logo', variant: 'destructive' });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: 'Error', description: 'Partner name is required', variant: 'destructive' });
            return;
        }
        if (!formData.logo_url) {
            toast({ title: 'Error', description: 'Logo image is required', variant: 'destructive' });
            return;
        }

        try {
            if (editingPartner) {
                const { error } = await supabase
                    .from('community_partners' as any)
                    .update({
                        name: formData.name,
                        logo_url: formData.logo_url,
                        website_url: formData.website_url || null,
                        is_active: formData.is_active,
                        display_order: formData.display_order,
                    })
                    .eq('id', editingPartner.id);

                if (error) throw error;
                toast({ title: 'Success', description: 'Partner updated successfully' });
            } else {
                const { error } = await supabase
                    .from('community_partners' as any)
                    .insert({
                        name: formData.name,
                        logo_url: formData.logo_url,
                        website_url: formData.website_url || null,
                        is_active: formData.is_active,
                        display_order: partners.length,
                    });

                if (error) throw error;
                toast({ title: 'Success', description: 'Partner added successfully' });
            }

            resetForm();
            fetchPartners();
        } catch (error: any) {
            console.error('Save error:', error);
            toast({ title: 'Error', description: error.message || 'Failed to save partner', variant: 'destructive' });
        }
    };

    const handleEdit = (partner: Partner) => {
        setEditingPartner(partner);
        setFormData({
            name: partner.name,
            logo_url: partner.logo_url,
            website_url: partner.website_url || '',
            is_active: partner.is_active,
            display_order: partner.display_order,
        });
        setPreviewImage(partner.logo_url);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this partner?')) return;

        const { error } = await supabase
            .from('community_partners' as any)
            .delete()
            .eq('id', id);

        if (error) {
            toast({ title: 'Error', description: 'Failed to delete partner', variant: 'destructive' });
        } else {
            toast({ title: 'Success', description: 'Partner deleted successfully' });
            fetchPartners();
        }
    };

    const handleToggleActive = async (partner: Partner) => {
        const { error } = await supabase
            .from('community_partners' as any)
            .update({ is_active: !partner.is_active })
            .eq('id', partner.id);

        if (error) {
            toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
        } else {
            fetchPartners();
        }
    };

    const handleReorder = async (partner: Partner, direction: 'up' | 'down') => {
        const currentIndex = partners.findIndex(p => p.id === partner.id);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= partners.length) return;

        const otherPartner = partners[newIndex];

        await Promise.all([
            supabase.from('community_partners' as any).update({ display_order: newIndex }).eq('id', partner.id),
            supabase.from('community_partners' as any).update({ display_order: currentIndex }).eq('id', otherPartner.id),
        ]);

        fetchPartners();
    };

    const resetForm = () => {
        setEditingPartner(null);
        setFormData({
            name: '',
            logo_url: '',
            website_url: '',
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
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Community Partners</h1>
                    <p className="text-muted-foreground">Manage partner logos and links</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    if (!open) resetForm();
                    setIsDialogOpen(open);
                }}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Partner
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Partner Name *</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <Input
                                        value={formData.website_url}
                                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Partner Logo *</Label>
                                <div className="flex flex-col gap-4">
                                    {previewImage ? (
                                        <div className="relative h-32 w-full max-w-sm rounded-lg overflow-hidden bg-muted border flex items-center justify-center">
                                            <img src={previewImage} alt="Preview" className="h-full object-contain p-2" />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={() => {
                                                    setPreviewImage(null);
                                                    setFormData(prev => ({ ...prev, logo_url: '' }));
                                                }}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            className="h-32 w-full max-w-sm rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                            <p className="text-sm text-muted-foreground">Click to upload logo</p>
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
                                    {!previewImage && (
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploading}
                                            className="w-fit"
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            {uploading ? 'Uploading...' : 'Upload Logo'}
                                        </Button>
                                    )}
                                </div>
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
                                    {editingPartner ? 'Update Partner' : 'Add Partner'}
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
                    <CardTitle>Partner List</CardTitle>
                </CardHeader>
                <CardContent>
                    {partners.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No partners added yet. Click "Add Partner" to start.
                            <br />
                            <span className="text-xs opacity-70">(Make sure you've run the database migration if this is your first time!)</span>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Order</TableHead>
                                    <TableHead className="w-32">Logo</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Website</TableHead>
                                    <TableHead className="w-24">Status</TableHead>
                                    <TableHead className="w-32">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {partners.map((partner, index) => (
                                    <TableRow key={partner.id}>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === 0}
                                                    onClick={() => handleReorder(partner, 'up')}
                                                >
                                                    <ArrowUp className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    disabled={index === partners.length - 1}
                                                    onClick={() => handleReorder(partner, 'down')}
                                                >
                                                    <ArrowDown className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="h-12 w-20 flex items-center justify-center bg-gray-50 rounded border">
                                                <img
                                                    src={partner.logo_url}
                                                    alt={partner.name}
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">{partner.name}</TableCell>
                                        <TableCell>
                                            {partner.website_url ? (
                                                <a
                                                    href={partner.website_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary hover:underline flex items-center gap-1"
                                                >
                                                    Link <ExternalLink className="w-3 h-3" />
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Switch
                                                checked={partner.is_active}
                                                onCheckedChange={() => handleToggleActive(partner)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => handleEdit(partner)}>
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDelete(partner.id)}>
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

export default AdminPartners;
