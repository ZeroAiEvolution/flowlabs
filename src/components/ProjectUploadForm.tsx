import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

const projectSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must not exceed 500 characters."),
    project_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectUploadFormProps {
    onSuccess: () => void;
    userId: string;
}

export function ProjectUploadForm({ onSuccess, userId }: ProjectUploadFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            title: "",
            description: "",
            project_url: "",
        },
    });

    const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: "File too large",
                    description: "Image size must be less than 5MB",
                    variant: "destructive",
                });
                return;
            }
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setThumbnailPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: ProjectFormValues) => {
        setIsSubmitting(true);
        try {
            let thumbnailUrl = null;

            // 1. Upload thumbnail if provided
            if (thumbnailFile) {
                const fileExt = thumbnailFile.name.split('.').pop();
                const filePath = `${userId}/${crypto.randomUUID()}.${fileExt}`;

                // We use the existing 'avatars' bucket or create a new 'project_thumbnails' bucket. 
                // According to the schema, 'avatars' and 'banners' exist and are public. We'll use avatars for now as it's user-specific
                const { error: uploadError, data: uploadData } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, thumbnailFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                thumbnailUrl = publicUrl;
            }

            // 2. Insert the project record into student_projects
            // We first need to get the profile id for the current user
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', userId)
                .single();

            if (profileError) throw profileError;

            const { error: insertError } = await supabase
                .from('student_projects')
                .insert({
                    title: data.title,
                    description: data.description,
                    project_url: data.project_url || null,
                    thumbnail_url: thumbnailUrl,
                    author_id: profileData.id,
                });

            if (insertError) throw insertError;

            toast({
                title: "Project Uploaded",
                description: "Your project has been successfully uploaded and is now visible.",
            });

            form.reset();
            setThumbnailFile(null);
            setThumbnailPreview(null);
            onSuccess();
        } catch (error: any) {
            console.error("Error uploading project:", error);
            toast({
                title: "Upload Failed",
                description: error.message || "There was an error uploading your project. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Thumbnail Upload Area */}
                <div className="space-y-2">
                    <FormLabel>Project Thumbnail (Optional)</FormLabel>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-6 bg-muted/30 transition-colors hover:bg-muted/50 cursor-pointer relative overflow-hidden group">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={handleThumbnailChange}
                        />
                        {thumbnailPreview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
                                <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white text-sm font-medium flex items-center">
                                        <Upload className="w-4 h-4 mr-2" /> Change Image
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center flex flex-col items-center pointer-events-none">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                                    <ImageIcon className="w-6 h-6 text-primary" />
                                </div>
                                <p className="text-sm font-medium">Click or drag to upload</p>
                                <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                            </div>
                        )}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Title <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Input placeholder="E.g., Flow Labs Community Platform" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description <span className="text-destructive">*</span></FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Describe your project, what it does, and what technologies you used..."
                                    className="resize-none h-24"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="text-xs">
                                {field.value.length}/500 characters
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="project_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Project Link (Optional)</FormLabel>
                            <FormControl>
                                <Input placeholder="https://github.com/yourusername/project" {...field} />
                            </FormControl>
                            <FormDescription className="text-xs">
                                Link to GitHub repository, live demo, or case study.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Uploading Project...
                        </>
                    ) : (
                        "Publish Project"
                    )}
                </Button>
            </form>
        </Form>
    );
}
