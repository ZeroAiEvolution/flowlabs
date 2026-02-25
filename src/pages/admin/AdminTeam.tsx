import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    image_url: string | null;
    bio: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    github_url: string | null;
    order_index: number;
}

const AdminTeam = () => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        role: '',
        image_url: '',
        bio: '',
        linkedin_url: '',
        order_index: '0'
    });
    const [previewImage, setPreviewImage] = useState<string | null>(null);

    useEffect(() => {
        fetchTeamMembers();
    }, []);

    const fetchTeamMembers = async () => {
        try {
            const { data, error } = await supabase
                .from('team_members' as any)
                .select('*')
                .order('order_index', { ascending: true });

            if (error) throw error;
            setTeamMembers((data as unknown as TeamMember[]) || []);
        } catch (error: any) {
            toast({
                title: "Error fetching team members",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
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
            const fileName = `team-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

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

    const handleOpenDialog = (member?: TeamMember) => {
        if (member) {
            setEditingMember(member);
            setFormData({
                name: member.name,
                role: member.role,
                image_url: member.image_url || '',
                bio: member.bio || '',
                linkedin_url: member.linkedin_url || '',
                order_index: member.order_index?.toString() || '0'
            });
            setPreviewImage(member.image_url || null);
        } else {
            setEditingMember(null);
            setFormData({
                name: '', role: '', image_url: '', bio: '', linkedin_url: '', order_index: '0'
            });
            setPreviewImage(null);
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                name: formData.name,
                role: formData.role,
                image_url: formData.image_url || null,
                bio: formData.bio || null,
                linkedin_url: formData.linkedin_url || null,
                twitter_url: null,
                github_url: null,
                order_index: parseInt(formData.order_index, 10) || 0,
            };

            if (editingMember) {
                const { error } = await supabase
                    .from('team_members' as any)
                    .update(payload)
                    .eq('id', editingMember.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('team_members' as any)
                    .insert(payload);
                if (error) throw error;
            }

            toast({
                title: `Team member ${editingMember ? 'updated' : 'added'} successfully`,
            });
            setIsDialogOpen(false);
            fetchTeamMembers();
        } catch (error: any) {
            toast({
                title: "Error saving team member",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;

        try {
            const { error } = await supabase
                .from('team_members' as any)
                .delete()
                .eq('id', id);

            if (error) throw error;

            toast({ title: "Team member deleted" });
            fetchTeamMembers();
        } catch (error: any) {
            toast({
                title: "Error deleting team member",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Manage Team</h1>
                    <p className="text-muted-foreground">Manage the public facing Team members page here</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => handleOpenDialog()} className="bg-black text-white hover:bg-black/80">
                            <Plus className="w-5 h-5 mr-2" />
                            Add Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px] h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingMember ? 'Edit' : 'Add'} Team Member</DialogTitle>
                            <DialogDescription>Fill in the details for the team member below.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label>Name</label>
                                    <Input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label>Role</label>
                                    <Input required value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label>Bio</label>
                                <textarea
                                    className="w-full p-2 border rounded-md"
                                    rows={3}
                                    required
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label>Image</label>
                                <div className="flex flex-col gap-4">
                                    {previewImage ? (
                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-muted w-32 h-32 mx-auto">
                                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2 h-6 px-2 text-xs"
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
                                            className="h-32 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-muted-foreground/50 transition-colors mx-auto w-32"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                                            <span className="text-xs text-muted-foreground">Upload</span>
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
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="w-full"
                                    >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {uploading ? 'Uploading...' : 'Upload Image'}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label>LinkedIn URL</label>
                                    <Input type="url" value={formData.linkedin_url} onChange={e => setFormData({ ...formData, linkedin_url: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label>Order / Priority (Lower is higher)</label>
                                    <Input type="number" value={formData.order_index} onChange={e => setFormData({ ...formData, order_index: e.target.value })} />
                                </div>
                            </div>

                            <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-black/90">
                                {loading ? 'Saving...' : 'Save Team Member'}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && teamMembers.length === 0 ? (
                    <p>Loading...</p>
                ) : teamMembers.map((member) => (
                    <Card key={member.id}>
                        <CardHeader className="flex flex-row items-center gap-4">
                            {member.image_url ? (
                                <img src={member.image_url} alt={member.name || 'Team member'} className="w-16 h-16 rounded-full object-cover" />
                            ) : (
                                <div className="w-16 h-16 bg-secondary flex items-center justify-center rounded-full text-xl font-bold">
                                    {member.name ? member.name.split(' ').map(n => n[0]).join('').substring(0, 2) : '?'}
                                </div>
                            )}
                            <div className="flex-1">
                                <CardTitle>{member.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{member.role}</p>
                                <p className="text-xs text-muted-foreground mt-1">Order: {member.order_index}</p>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(member)}>
                                    <Edit2 className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id, member.name)}>
                                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminTeam;
