"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClientComponentClient } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, User, MapPin, Phone, Mail, Award } from 'lucide-react';

// Doctor profile interface matching database schema
interface DoctorProfile {
  // From users table
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  profile_image?: string;
  specialty?: string;
  years_of_experience?: number;
  education?: string;
  bio?: string;
  consultation_fee?: number;
  available_days?: string[];
  created_at?: string;
  updated_at?: string;
  location?: string;
  medical_license?: string;
  
  // From doctor_profiles table if exists
  doctor_profile?: {
    specialty: string;
    years_experience: number;
    location: string;
    bio?: string;
    profile_picture?: string;
    rating?: number;
  };
}

export default function DoctorProfilePage() {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DoctorProfile>>({});
  
  // Fetch doctor profile
  useEffect(() => {
    const fetchDoctorProfile = async () => {
      if (!user || !profile) return;
      
      setIsLoading(true);
      const supabase = createClientComponentClient();
      
      try {
        // Get user data and doctor_profile if it exists
        const { data, error } = await supabase
          .from('users')
          .select(`
            *,
            doctor_profile:doctor_profiles(*)
          `)
          .eq('id', profile.id)
          .single();
          
        if (error) throw error;
        
        // Merge doctor_profile data if it exists
        setDoctorProfile(data);
        setFormData({
          full_name: data.full_name,
          email: data.email,
          phone_number: data.phone_number || '',
          profile_image: data.profile_image || '',
          specialty: data.specialty || data.doctor_profile?.specialty || '',
          years_of_experience: data.years_of_experience || data.doctor_profile?.years_experience || 0,
          education: data.education || '',
          bio: data.bio || data.doctor_profile?.bio || '',
          consultation_fee: data.consultation_fee || 0,
          location: data.location || data.doctor_profile?.location || '',
          medical_license: data.medical_license || ''
        });
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDoctorProfile();
  }, [user, profile]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile) return;
    
    setIsLoading(true);
    const supabase = createClientComponentClient();
    
    try {
      // Update the user record
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          profile_image: formData.profile_image,
          specialty: formData.specialty,
          years_of_experience: formData.years_of_experience,
          education: formData.education,
          bio: formData.bio,
          consultation_fee: formData.consultation_fee,
          location: formData.location,
          medical_license: formData.medical_license,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
        
      if (userError) throw userError;
      
      // If doctor_profile exists, update it; otherwise create it
      if (doctorProfile?.doctor_profile) {
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .update({
            specialty: formData.specialty || '',
            years_experience: formData.years_of_experience || 0,
            location: formData.location || '',
            bio: formData.bio || '',
            profile_picture: formData.profile_image || ''
          })
          .eq('user_id', profile.id);
          
        if (profileError) throw profileError;
      } else {
        const { error: profileError } = await supabase
          .from('doctor_profiles')
          .insert({
            user_id: profile.id,
            specialty: formData.specialty || '',
            years_experience: formData.years_of_experience || 0,
            location: formData.location || '',
            bio: formData.bio || '',
            profile_picture: formData.profile_image || ''
          });
          
        if (profileError) throw profileError;
      }
      
      // Refresh the profile
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          doctor_profile:doctor_profiles(*)
        `)
        .eq('id', profile.id)
        .single();
        
      if (error) throw error;
      
      setDoctorProfile(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating doctor profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-600 border-b-blue-100 border-l-blue-100 border-r-blue-100 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Calculate completion percentage
  const calculateProfileCompletion = () => {
    const fields = [
      formData.full_name,
      formData.email,
      formData.phone_number,
      formData.profile_image,
      formData.specialty,
      formData.years_of_experience,
      formData.education,
      formData.bio,
      formData.consultation_fee,
      formData.location,
      formData.medical_license
    ];
    
    const filledFields = fields.filter(field => field !== undefined && field !== null && field !== '').length;
    return Math.round((filledFields / fields.length) * 100);
  };
  
  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Doctor Profile</h1>
          <p className="text-blue-100">Manage your professional information</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden mb-4">
                    {formData.profile_image ? (
                      <img 
                        src={formData.profile_image} 
                        alt={formData.full_name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600">
                        <User className="h-16 w-16" />
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-1">{formData.full_name}</h2>
                  <p className="text-blue-600 font-medium mb-4">{formData.specialty || 'No specialty set'}</p>
                  
                  <div className="flex items-center mb-2">
                    <Award className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formData.years_of_experience
                        ? `${formData.years_of_experience} years experience`
                        : 'Experience not set'
                      }
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formData.location || 'Location not set'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">{formData.email}</span>
                  </div>
                  
                  <div className="flex items-center mb-2">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formData.phone_number || 'Phone not set'}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-6 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">Profile completion: {profileCompletion}%</p>
                  
                  <Button 
                    className="w-full"
                    onClick={() => setIsEditing(true)}
                    disabled={isEditing}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Profile Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  Manage your professional details visible to patients
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          name="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone_number">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          value={formData.phone_number || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="specialty">Specialty</Label>
                        <Input
                          id="specialty"
                          name="specialty"
                          value={formData.specialty || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="years_of_experience">Years of Experience</Label>
                        <Input
                          id="years_of_experience"
                          name="years_of_experience"
                          type="number"
                          value={formData.years_of_experience || 0}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Practice Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={formData.location || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="consultation_fee">Consultation Fee ($)</Label>
                        <Input
                          id="consultation_fee"
                          name="consultation_fee"
                          type="number"
                          value={formData.consultation_fee || 0}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="medical_license">Medical License ID</Label>
                        <Input
                          id="medical_license"
                          name="medical_license"
                          value={formData.medical_license || ''}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="education">Education & Qualifications</Label>
                        <Textarea
                          id="education"
                          name="education"
                          value={formData.education || ''}
                          onChange={handleInputChange}
                          rows={3}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="bio">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio || ''}
                          onChange={handleInputChange}
                          rows={5}
                        />
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="profile_image">Profile Image URL</Label>
                        <Input
                          id="profile_image"
                          name="profile_image"
                          value={formData.profile_image || ''}
                          onChange={handleInputChange}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter a URL to your profile image. In a production app, this would be a file upload.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Specialty</h3>
                        <p className="text-gray-900">{formData.specialty || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Years of Experience</h3>
                        <p className="text-gray-900">
                          {formData.years_of_experience
                            ? `${formData.years_of_experience} years`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Practice Location</h3>
                        <p className="text-gray-900">{formData.location || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Consultation Fee</h3>
                        <p className="text-gray-900">
                          {formData.consultation_fee
                            ? `$${formData.consultation_fee.toFixed(2)}`
                            : 'Not specified'
                          }
                        </p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Education & Qualifications</h3>
                        <p className="text-gray-900">{formData.education || 'Not specified'}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Professional Bio</h3>
                        <p className="text-gray-900 whitespace-pre-line">{formData.bio || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">License ID</h3>
                        <p className="text-gray-900">{formData.medical_license || 'Not specified'}</p>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Information</h3>
                        <p className="text-gray-900">
                          Email: {formData.email}<br />
                          Phone: {formData.phone_number || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <User className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 