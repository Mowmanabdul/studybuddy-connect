import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProfileFormData {
  first_name: string;
  last_name: string;
  grade: string | null;
  bio: string | null;
  subjects: string[] | null;
}

export function useProfileEditor() {
  const { user, profile, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const updateProfile = async (data: ProfileFormData) => {
    if (!user) return { error: new Error("Not authenticated") };

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          grade: data.grade,
          bio: data.bio,
          subjects: data.subjects,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      await refreshUserData();

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return { error: null };
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error };
    } finally {
      setIsLoading(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return { error: new Error("Not authenticated"), url: null };

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if any
      await supabase.storage.from("avatars").remove([fileName]);

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      await refreshUserData();

      toast({
        title: "Avatar updated",
        description: "Your avatar has been updated successfully.",
      });

      return { error: null, url: avatarUrl };
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      return { error: error as Error, url: null };
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return {
    profile,
    isLoading,
    isUploadingAvatar,
    updateProfile,
    uploadAvatar,
  };
}
