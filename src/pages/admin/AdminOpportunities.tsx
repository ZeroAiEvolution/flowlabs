

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Opportunity {
    id: string;
    title: string;
    description: string | null;
    category: 'Hackathons' | 'Events' | 'Competitions';
    date: string | null;
    location: string | null;
    image_url: string | null;
    link_url: string | null;
    is_active: boolean | null;
}

const CATEGORIES = ['Hackathons', 'Events', 'Competitions'];

export default function AdminOpportunities() {
    const { toast } = useToast();
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Partial<Opportunity>>({
        title: '',
        description: '',
        category: 'Hackathons',
        date: '',
        location: '',
        image_url: '',
        link_url: '',
        is_active: true
    });

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const fetchOpportunities = async () => {
        try {
            const { data, error } = await supabase
                .from('opportunities')
                .select('*')
                .order('date', { ascending: true });

            if (error) throw error;
            // Type assertion to handle potential mismatch if types.ts isn't perfectly aligned yet, 
            // but effectively we are casting the DB response to our UI interface.
            // The DB returns string for category, we cast to our union type.
            setOpportunities((data as unknown as Opportunity[]) || []);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to fetch opportunities',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `opportunity-${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('banners') // Reusing banners bucket
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('banners')
                .getPublicUrl(fileName);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
            toast({ title: 'Success', description: 'Image uploaded successfully' });
        } catch (error: any) {
            toast({
                title: 'Upload Failed',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.date || !formData.category) {
            toast({ title: 'Error', description: 'Please fill in required fields', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            // We need to omit fields that are invalid for the DB insert if they are not in schema
            // But our formData perfectly matches the DB schema now (except we rely on nullable)
            const submissionData = {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                date: formData.date ? new Date(formData.date).toISOString() : null,
                location: formData.location,
                image_url: formData.image_url,
                link_url: formData.link_url,
                is_active: formData.is_active
            };

            const { error } = await supabase
                .from('opportunities')
                .insert([submissionData]);

            if (error) throw error;

            toast({ title: 'Success', description: 'Opportunity added successfully' });
            setIsAdding(false);
            setFormData({
                title: '',
                description: '',
                category: 'Hackathons',
                date: '',
                location: '',
                image_url: '',
                link_url: '',
                is_active: true
            });
            fetchOpportunities();
        } catch (error: any) {
            console.error(error);
            toast({ title: 'Error', description: error.message || 'Failed to save', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this opportunity?')) return;

        try {
            const { error } = await supabase
                .from('opportunities')
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({ title: 'Success', description: 'Opportunity deleted' });
            fetchOpportunities();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    const toggleActive = async (id: string, currentState: boolean | null) => {
        try {
            const { error } = await supabase
                .from('opportunities')
                .update({ is_active: !currentState })
                .eq('id', id);

            if (error) throw error;
            fetchOpportunities();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        }
    };

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Opportunities</h1>
                    <p className="text-muted-foreground">Manage hackathons, events, and competitions</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Add Opportunity</>}
                </Button>
            </div>

            {isAdding && (
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Opportunity</CardTitle>
                        <CardDescription>Fill in the details for the upcoming event.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Title *</label>
                                    <Input
                                        value={formData.title}
                                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g. Summer Hackathon 2026"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Category *</label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val: any) => setFormData(prev => ({ ...prev, category: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map(cat => (
                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date & Time *</label>
                                    <Input
                                        type="datetime-local"
                                        value={formData.date || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Location</label>
                                    <Input
                                        value={formData.location || ''}
                                        onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                        placeholder="e.g. Auditorium A or Online"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Textarea
                                    value={formData.description || ''}
                                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="Event details..."
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Registration Link</label>
                                    <div className="flex gap-2">
                                        <ExternalLink className="w-4 h-4 mt-3 text-muted-foreground" />
                                        <Input
                                            value={formData.link_url || ''}
                                            onChange={e => setFormData(prev => ({ ...prev, link_url: e.target.value }))}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Cover Image</label>
                                    <div className="flex gap-2 items-center">
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            disabled={uploading}
                                        />
                                        {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    </div>
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="Preview" className="h-20 w-auto rounded-md object-cover border" />
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button type="submit" disabled={saving || uploading}>
                                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Save Opportunity
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Image</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {opportunities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No opportunities found. Add your first one!
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    opportunities.map((item) => (
                                        <TableRow key={item.id}>
                                            <TableCell>
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.title} className="w-10 h-10 rounded-md object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                                                        <ImageIcon className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {item.title}
                                            </TableCell>
                                            <TableCell>
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                                                    {item.category}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {item.date ? format(new Date(item.date), 'PPp') : '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Switch
                                                    checked={!!item.is_active}
                                                    onCheckedChange={() => toggleActive(item.id, item.is_active)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-destructive hover:text-destructive/90"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
