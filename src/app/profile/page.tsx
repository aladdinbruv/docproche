"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Save,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Camera
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { LoadingWithTimeout } from "@/components/LoadingWithTimeout";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    location: "",
    profile_image: "",
    bio: ""
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const supabase = createClientComponentClient();
  
  // Initialize form with profile data when it loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || "",
        email: profile.email || "",
        phone_number: profile.phone_number || "",
        location: profile.location || "",
        profile_image: profile.profile_image || "",
        bio: profile.bio || ""
      });
    }
  }, [profile]);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirectTo=/profile');
    }
  }, [user, authLoading, router]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          location: formData.location,
          bio: formData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)
        .select();
      
      if (error) throw error;
      
      await refreshProfile();
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully");
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      setError(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords don't match");
      setIsSaving(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters");
      setIsSaving(false);
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) throw error;
      
      setSuccessMessage("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error updating password:', error);
      setError(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file size and type
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setFileUploadError("Image too large. Max size is 5MB.");
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setFileUploadError("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
      return;
    }
    
    setUploadingImage(true);
    setFileUploadError(null);
    
    try {
      // First try to initialize storage if needed
      try {
        const initResponse = await fetch('/api/init');
        if (!initResponse.ok) {
          console.warn('Storage initialization warning:', await initResponse.text());
        }
      } catch (initError) {
        console.warn('Storage initialization error:', initError);
        // Continue anyway, the upload might still work
      }
      
      // Check if the public bucket exists, continue even if check fails
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
          console.warn('Error checking storage buckets:', bucketError);
        } else {
          const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
          if (!publicBucketExists) {
            console.warn('Public bucket does not exist. Attempting upload anyway.');
          } else {
            console.log('Public bucket exists, proceeding with upload.');
          }
        }
      } catch (checkError) {
        console.warn('Error checking buckets:', checkError);
        // Continue anyway, the upload might still work
      }
      
      // Upload image to storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;
      
      console.log(`Uploading file to path: ${filePath}`);
      
      const { error: uploadError } = await supabase
        .storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      console.log('Upload successful, getting public URL');
      
      // Get public URL for the image
      const { data: publicUrlData } = supabase
        .storage
        .from('public')
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      console.log('Got public URL:', publicUrlData.publicUrl);
      
      // Update user profile with new image URL
      console.log('Updating user profile with new image URL');
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_image: publicUrlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);
      
      if (updateError) {
        console.error('User profile update error:', updateError);
        throw new Error(`Failed to update user profile: ${updateError.message}`);
      }
      
      // Update local state and refresh profile
      setFormData(prev => ({
        ...prev,
        profile_image: publicUrlData.publicUrl
      }));
      
      console.log('Refreshing profile data');
      await refreshProfile();
      setSuccessMessage("Profile image updated successfully");
      console.log('Profile image update complete');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error: unknown) {
      console.error('Error uploading profile image:', error);
      let errorMessage = "Failed to upload image";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        // Try to extract error message from Supabase error object
        errorMessage = JSON.stringify(error);
        if ('message' in error && typeof (error as Record<string, unknown>).message === 'string') {
          errorMessage = (error as Record<string, string>).message;
        }
      }
      
      setFileUploadError(errorMessage);
    } finally {
      setUploadingImage(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (authLoading) {
    return (
      <LoadingWithTimeout 
        isLoading={true} 
        loadingMessage="Loading your profile..."
      >
        <div />
      </LoadingWithTimeout>
    );
  }
  
  if (!user && !profile) {
    return null; // Redirect is handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-blue-100">Manage your personal information and settings</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary Card */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-4 border-b">
                <CardTitle className="text-xl">Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center mb-6">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 mb-4 overflow-hidden">
                      {formData.profile_image ? (
                        <img 
                          src={formData.profile_image} 
                          alt={formData.full_name} 
                          className="w-32 h-32 object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12" />
                      )}
                    </div>
                    <label className="absolute bottom-4 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition-colors">
                      <Camera className="h-4 w-4" />
                      <input 
                        type="file" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        accept="image/jpeg, image/png, image/webp, image/gif"
                        disabled={uploadingImage}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                  {uploadingImage && (
                    <div className="text-sm text-blue-600 mt-2 flex items-center">
                      <div className="animate-spin h-4 w-4 border-t-2 border-blue-600 border-r-2 border-blue-600 border-b-2 border-transparent rounded-full mr-2"></div>
                      Uploading image...
                    </div>
                  )}
                  {fileUploadError && (
                    <div className="text-sm text-red-600 mt-2 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {fileUploadError}
                    </div>
                  )}
                  <h2 className="text-xl font-bold">{profile?.full_name || 'User'}</h2>
                  <p className="text-gray-500">{profile?.email}</p>
                </div>

                <div className="space-y-4">
                  {profile?.phone_number && (
                    <div className="flex items-center">
                      <Phone className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{profile.phone_number}</p>
                      </div>
                    </div>
                  )}
                  
                  {profile?.location && (
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-500 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Location</p>
                        <p>{profile.location}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p>{profile?.created_at 
                        ? new Date(profile.created_at).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-blue-500 mr-3" />
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="capitalize">{profile?.role || 'Patient'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main Settings Area */}
          <div className="lg:col-span-2">
            <Card>
              <Tabs defaultValue="account">
                <TabsList className="w-full rounded-none border-b grid grid-cols-2">
                  <TabsTrigger value="account">Account Settings</TabsTrigger>
                  <TabsTrigger value="security">Security & Privacy</TabsTrigger>
                </TabsList>
                
                <TabsContent value="account" className="p-6">
                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                        <span className="text-red-700">{error}</span>
                      </div>
                    </div>
                  )}
                  
                  {successMessage && (
                    <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                        <span className="text-green-700">{successMessage}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">Personal Information</h2>
                    <Button 
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      disabled={isSaving}
                    >
                      {isEditing ? (
                        <>Cancel</>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={true} // Email can't be changed directly
                          className="mt-1 bg-gray-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Email cannot be changed. Contact support if needed.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          disabled={!isEditing || isSaving}
                          className="mt-1"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <Label htmlFor="bio">About Me</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        disabled={!isEditing || isSaving}
                        className="mt-1 min-h-[100px]"
                        placeholder="Tell us a bit about yourself..."
                      />
                    </div>
                    
                    {isEditing && (
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <div className="flex items-center">
                              <motion.div 
                                className="h-4 w-4 border-t-2 border-white border-solid rounded-full mr-2"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              />
                              Saving...
                            </div>
                          ) : (
                            <>
                              <Save className="h-4 w-4 mr-2" />
                              Save Changes
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </form>
                </TabsContent>
                
                <TabsContent value="security" className="p-6">
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-6">Password Management</h2>
                    
                    {error && (
                      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                          <span className="text-red-700">{error}</span>
                        </div>
                      </div>
                    )}
                    
                    {successMessage && (
                      <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                          <span className="text-green-700">{successMessage}</span>
                        </div>
                      </div>
                    )}
                    
                    <form onSubmit={handlePasswordUpdate}>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="currentPassword">Current Password</Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            disabled={isSaving}
                            className="mt-1"
                            placeholder="Enter your current password"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            disabled={isSaving}
                            className="mt-1"
                            placeholder="Enter new password"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Password must be at least 8 characters long.
                          </p>
                        </div>
                        
                        <div>
                          <Label htmlFor="confirmPassword">Confirm New Password</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            disabled={isSaving}
                            className="mt-1"
                            placeholder="Confirm new password"
                          />
                        </div>
                        
                        <div className="pt-2">
                          <Button
                            type="submit"
                            disabled={isSaving}
                          >
                            {isSaving ? (
                              <div className="flex items-center">
                                <motion.div 
                                  className="h-4 w-4 border-t-2 border-white border-solid rounded-full mr-2"
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Updating...
                              </div>
                            ) : (
                              "Update Password"
                            )}
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
                    
                    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-amber-800 mb-1">Important Privacy Notice</h4>
                          <p className="text-sm text-amber-700">
                            Your medical information is protected and only shared with healthcare providers during your appointments.
                            You can manage your data and request exports by contacting our support team.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h3 className="font-medium">Email Notifications</h3>
                          <p className="text-sm text-gray-500">Receive appointment reminders and updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      
                      <div className="flex items-center justify-between border p-4 rounded-md">
                        <div>
                          <h3 className="font-medium">SMS Notifications</h3>
                          <p className="text-sm text-gray-500">Receive text message reminders for upcoming appointments</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" defaultChecked />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 