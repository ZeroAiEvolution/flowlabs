import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Loader2, CheckCircle2, Circle, HeartHandshake, Eye, Mail, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface Profile {
    full_name: string;
    avatar_url: string;
    email?: string;
}

interface HelpRequest {
    id: string;
    user_id: string;
    type: string;
    message: string;
    status: 'pending' | 'resolved';
    created_at: string;
    profiles: Profile;
}

const AdminHelpRequests = () => {
    const [requests, setRequests] = useState<HelpRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const { data, error } = await (supabase as any)
                .from('help_requests')
                .select(`
          *,
          profiles:user_id (
            full_name,
            avatar_url,
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests((data as unknown as HelpRequest[]) || []);
        } catch (error) {
            console.error('Error fetching help requests:', error);
            toast.error('Failed to load help requests');
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (id: string, currentStatus: string) => {
        const newStatus = currentStatus === 'pending' ? 'resolved' : 'pending';

        try {
            const { error } = await (supabase as any)
                .from('help_requests')
                .update({ status: newStatus })
                .eq('id', id);

            if (error) throw error;

            setRequests(requests.map(req =>
                req.id === id ? { ...req, status: newStatus } : req
            ));

            toast.success(`Request marked as ${newStatus}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update request status');
        }
    };
    const openViewModal = (request: HelpRequest) => {
        setSelectedRequest(request);
        setIsViewModalOpen(true);
    };

    const getInitials = (name: string) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'Career Guidance': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Stress Relief': return 'bg-green-100 text-green-800 border-green-200';
            case 'Motivation': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Technical Help': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-2">
                        <HeartHandshake className="w-8 h-8 text-primary" />
                        Student Help Requests
                    </h1>
                    <p className="text-muted-foreground mt-1 text-lg">
                        Manage incoming requests for guidance, motivation, and support.
                    </p>
                </div>
                <div className="flex gap-4 p-4 bg-secondary/50 rounded-2xl border border-border/50">
                    <div className="text-center px-4 border-r border-border/50">
                        <div className="text-2xl font-bold">{requests.length}</div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total</div>
                    </div>
                    <div className="text-center px-4">
                        <div className="text-2xl font-bold text-amber-500">
                            {requests.filter(r => r.status === 'pending').length}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Pending</div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead>Student</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="w-[40%]">Message</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((request, index) => (
                            <TableRow key={request.id}>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={request.profiles?.avatar_url} />
                                            <AvatarFallback>{getInitials(request.profiles?.full_name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="font-medium">{request.profiles?.full_name || 'Unknown User'}</div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={getTypeColor(request.type)}>
                                        {request.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm">
                                    <p className="line-clamp-2 text-muted-foreground" title={request.message}>
                                        {request.message}
                                    </p>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(request.created_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={request.status === 'resolved' ? 'default' : 'secondary'} className="capitalize">
                                        {request.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openViewModal(request)}
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            <Eye className="w-4 h-4 mr-1" /> View
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleStatus(request.id, request.status)}
                                            className={request.status === 'resolved' ? 'text-green-600' : 'text-amber-500'}
                                        >
                                            {request.status === 'resolved' ? (
                                                <span className="flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" /> Resolved
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1">
                                                    <Circle className="w-4 h-4" /> Mark Resolved
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}

                        {requests.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                                    No help requests found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* View Details Modal */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-2xl">
                            Request Details
                            {selectedRequest && (
                                <Badge variant="outline" className={getTypeColor(selectedRequest.type)}>
                                    {selectedRequest.type}
                                </Badge>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Full information submitted by the student.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="space-y-6 mt-4">
                            {/* Student Info Card */}
                            <div className="bg-secondary/50 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center border border-border/50">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={selectedRequest.profiles?.avatar_url} />
                                        <AvatarFallback>{getInitials(selectedRequest.profiles?.full_name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold text-lg">{selectedRequest.profiles?.full_name || 'Unknown User'}</div>
                                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Mail className="w-3 h-3" />
                                            {selectedRequest.profiles?.email || 'No email provided'}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-start md:items-end gap-1">
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(selectedRequest.created_at).toLocaleString()}
                                    </div>
                                    <Badge variant={selectedRequest.status === 'resolved' ? 'default' : 'secondary'} className="capitalize mt-1">
                                        Status: {selectedRequest.status}
                                    </Badge>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div>
                                <h3 className="font-semibold text-sm text-muted-foreground mb-2 uppercase tracking-wide">Message Content</h3>
                                <div className="bg-background border border-border rounded-xl p-4 min-h-[150px] whitespace-pre-wrap">
                                    {selectedRequest.message}
                                </div>
                            </div>

                            {/* Action Area */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={() => toggleStatus(selectedRequest.id, selectedRequest.status)}
                                    className={selectedRequest.status === 'resolved' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-green-600 hover:bg-green-700'}
                                >
                                    {selectedRequest.status === 'resolved' ? 'Mark as Pending' : 'Mark as Resolved'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
};

export default AdminHelpRequests;
