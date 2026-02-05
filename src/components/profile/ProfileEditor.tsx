import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Camera, User, Loader2 } from "lucide-react";
import { useProfileEditor } from "@/hooks/useProfileEditor";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  grade: z.string().optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const grades = [
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

interface ProfileEditorProps {
  onClose?: () => void;
}

export function ProfileEditor({ onClose }: ProfileEditorProps) {
  const { profile, role } = useAuth();
  const { isLoading, isUploadingAvatar, updateProfile, uploadAvatar } =
    useProfileEditor();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      grade: profile?.grade || "",
      bio: profile?.bio || "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        grade: profile.grade || "",
        bio: profile.bio || "",
      });
      setAvatarPreview(profile.avatar_url);
    }
  }, [profile, form]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return;
    }

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to storage
    const { url } = await uploadAvatar(file);
    if (url) {
      setAvatarPreview(url);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const { error } = await updateProfile({
      first_name: data.first_name,
      last_name: data.last_name,
      grade: data.grade || null,
      bio: data.bio || null,
      subjects: profile?.subjects || null,
    });

    if (!error && onClose) {
      onClose();
    }
  };

  const initials = profile
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : "??";

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information and profile picture
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarPreview || undefined} />
                <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Click the camera icon to upload a new photo
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {role === "learner" && (
                <FormField
                  control={form.control}
                  name="grade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Grade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your grade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {grades.map((grade) => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={
                          role === "tutor"
                            ? "Tell students about your teaching experience and expertise..."
                            : "Tell us a bit about yourself..."
                        }
                        className="resize-none"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/500 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3 pt-4">
                {onClose && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={onClose ? "flex-1" : "w-full"}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </CardContent>
    </Card>
  );
}
