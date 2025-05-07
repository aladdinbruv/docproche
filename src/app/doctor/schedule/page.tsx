"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO, isToday, addDays, isSameDay, addMinutes } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Trash,
  Edit,
  Save,
  X,
  AlertCircle,
  Check,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useTimeSlots, TimeSlot } from "@/hooks/useTimeSlots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Day of week mapping
const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export default function DoctorSchedulePage() {
  const router = useRouter();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("daily");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isRecurringDialogOpen, setIsRecurringDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<number>(new Date().getDay());

  // Form states for adding new time slots
  const [newSlot, setNewSlot] = useState({
    day_of_week: new Date().getDay(),
    start_time: "09:00",
    end_time: "10:00",
    is_available: true
  });

  // Form states for recurring time slots
  const [recurringSlot, setRecurringSlot] = useState({
    day_of_week: new Date().getDay(),
    start_time: "09:00",
    end_time: "17:00",
    interval: 60, // minutes
    is_available: true
  });

  // Access the hook
  const {
    timeSlots,
    loading: timeSlotsLoading,
    error: timeSlotsError,
    createTimeSlot,
    updateTimeSlot,
    deleteTimeSlot,
    fetchTimeSlots
  } = useTimeSlots(profile?.id || user?.id || '');

  useEffect(() => {
    // Redirect if not logged in or not a doctor
    if (!authLoading && (!user || profile?.role !== 'doctor')) {
      router.push('/auth/login?redirectTo=/doctor/schedule');
    }
  }, [user, profile, authLoading, router]);

  // Filter slots for the current day
  const getCurrentDaySlots = () => {
    return timeSlots.filter(slot => slot.day_of_week === currentDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  // Handle adding a new time slot
  const handleAddTimeSlot = async () => {
    try {
      if (!user?.id && !profile?.id) return;

      await createTimeSlot({
        doctor_id: profile?.id || user?.id || '',
        ...newSlot
      });

      setIsAddDialogOpen(false);
      
      // Reset form
      setNewSlot({
        day_of_week: new Date().getDay(),
        start_time: "09:00",
        end_time: "10:00",
        is_available: true
      });
    } catch (error) {
      console.error("Error adding time slot:", error);
    }
  };

  // Handle adding recurring time slots
  const handleAddRecurringSlots = async () => {
    try {
      if (!user?.id && !profile?.id) return;
      
      const doctorId = profile?.id || user?.id || '';
      const { day_of_week, start_time, end_time, interval, is_available } = recurringSlot;
      
      // Parse times
      const startDate = parseISO(`2023-01-01T${start_time}`);
      const endDate = parseISO(`2023-01-01T${end_time}`);
      
      // Calculate number of slots
      const minutesDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
      const numSlots = Math.floor(minutesDiff / interval);
      
      // Create slots
      for (let i = 0; i < numSlots; i++) {
        const slotStart = addMinutes(startDate, i * interval);
        const slotEnd = addMinutes(slotStart, interval);
        
        await createTimeSlot({
          doctor_id: doctorId,
          day_of_week,
          start_time: format(slotStart, 'HH:mm'),
          end_time: format(slotEnd, 'HH:mm'),
          is_available
        });
      }
      
      setIsRecurringDialogOpen(false);
      
      // Reset form
      setRecurringSlot({
        day_of_week: new Date().getDay(),
        start_time: "09:00",
        end_time: "17:00",
        interval: 60,
        is_available: true
      });
    } catch (error) {
      console.error("Error adding recurring time slots:", error);
    }
  };

  // Handle updating a time slot
  const handleUpdateTimeSlot = async (id: string, updates: Partial<TimeSlot>) => {
    try {
      await updateTimeSlot(id, updates);
      setEditingSlot(null);
    } catch (error) {
      console.error("Error updating time slot:", error);
    }
  };

  // Handle deleting a time slot
  const handleDeleteTimeSlot = async (id: string) => {
    if (confirm("Are you sure you want to delete this time slot?")) {
      try {
        await deleteTimeSlot(id);
      } catch (error) {
        console.error("Error deleting time slot:", error);
      }
    }
  };

  // Go to previous day
  const goToPreviousDay = () => {
    setCurrentDay((prev) => (prev === 0 ? 6 : prev - 1));
  };

  // Go to next day
  const goToNextDay = () => {
    setCurrentDay((prev) => (prev === 6 ? 0 : prev + 1));
  };

  // Loading state
  if (authLoading || timeSlotsLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <motion.div 
          className="h-16 w-16 border-t-4 border-blue-500 border-solid rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // Error state
  if (timeSlotsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            There was a problem loading your schedule. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-blue-600 text-white py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-2">Schedule Management</h1>
          <p className="text-blue-100">Manage your availability and time slots</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-6">
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="daily">Daily View</TabsTrigger>
              <TabsTrigger value="weekly">Weekly View</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button onClick={() => setIsRecurringDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Recurring Slots
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add Time Slot
              </Button>
            </div>
          </div>
          
          {/* Daily View */}
          <TabsContent value="daily" className="mt-0">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <Button variant="outline" size="sm" onClick={goToPreviousDay}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-lg font-semibold">{DAYS_OF_WEEK[currentDay]}</h3>
                  <Button variant="outline" size="sm" onClick={goToNextDay}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {getCurrentDaySlots().length === 0 ? (
                  <div className="text-center py-10">
                    <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-700">No Time Slots Available</h3>
                    <p className="text-gray-500 mt-1">You haven't set any time slots for this day.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => {
                        setNewSlot(prev => ({ ...prev, day_of_week: currentDay }));
                        setIsAddDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Time Slot for {DAYS_OF_WEEK[currentDay]}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getCurrentDaySlots().map((slot) => (
                      <div 
                        key={slot.id} 
                        className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50"
                      >
                        {editingSlot === slot.id ? (
                          <div className="flex-1 flex items-center space-x-3">
                            <div className="flex-1">
                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <Label htmlFor={`start-time-${slot.id}`}>Start Time</Label>
                                  <Input 
                                    id={`start-time-${slot.id}`}
                                    type="time" 
                                    value={slot.start_time} 
                                    onChange={(e) => {
                                      const updatedSlots = timeSlots.map(s => 
                                        s.id === slot.id ? { ...s, start_time: e.target.value } : s
                                      );
                                      // Update local state without making API call yet
                                      const updatedSlot = updatedSlots.find(s => s.id === slot.id);
                                      if (updatedSlot) {
                                        setTimeSlots(updatedSlots);
                                      }
                                    }}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`end-time-${slot.id}`}>End Time</Label>
                                  <Input 
                                    id={`end-time-${slot.id}`}
                                    type="time" 
                                    value={slot.end_time} 
                                    onChange={(e) => {
                                      const updatedSlots = timeSlots.map(s => 
                                        s.id === slot.id ? { ...s, end_time: e.target.value } : s
                                      );
                                      // Update local state without making API call yet
                                      const updatedSlot = updatedSlots.find(s => s.id === slot.id);
                                      if (updatedSlot) {
                                        setTimeSlots(updatedSlots);
                                      }
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center mt-3">
                                <Label htmlFor={`available-${slot.id}`} className="mr-3">Available</Label>
                                <Switch 
                                  id={`available-${slot.id}`}
                                  checked={slot.is_available} 
                                  onCheckedChange={(checked) => {
                                    const updatedSlots = timeSlots.map(s => 
                                      s.id === slot.id ? { ...s, is_available: checked } : s
                                    );
                                    // Update local state without making API call yet
                                    const updatedSlot = updatedSlots.find(s => s.id === slot.id);
                                    if (updatedSlot) {
                                      setTimeSlots(updatedSlots);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  const currentSlot = timeSlots.find(s => s.id === slot.id);
                                  if (currentSlot) {
                                    handleUpdateTimeSlot(slot.id, {
                                      start_time: currentSlot.start_time,
                                      end_time: currentSlot.end_time,
                                      is_available: currentSlot.is_available
                                    });
                                  }
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setEditingSlot(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <div className={`w-3 h-3 rounded-full mr-3 ${slot.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                              <span className="font-medium">
                                {slot.start_time} - {slot.end_time}
                              </span>
                              <span className="ml-3 text-sm text-gray-500">
                                {slot.is_available ? 'Available' : 'Unavailable'}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingSlot(slot.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteTimeSlot(slot.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Weekly View */}
          <TabsContent value="weekly" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {DAYS_OF_WEEK.map((day, index) => (
                <Card key={day} className="h-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{day}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {timeSlots.filter(slot => slot.day_of_week === index).length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">No slots</p>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setNewSlot(prev => ({ ...prev, day_of_week: index }));
                            setIsAddDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {timeSlots
                          .filter(slot => slot.day_of_week === index)
                          .sort((a, b) => a.start_time.localeCompare(b.start_time))
                          .map(slot => (
                            <div 
                              key={slot.id} 
                              className={`text-xs p-2 rounded ${
                                slot.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {slot.start_time} - {slot.end_time}
                              <div className="flex justify-end mt-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => setEditingSlot(slot.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="h-6 w-6 p-0 text-red-500"
                                  onClick={() => handleDeleteTimeSlot(slot.id)}
                                >
                                  <Trash className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog for adding a single time slot */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Time Slot</DialogTitle>
            <DialogDescription>
              Create a new time slot for your availability.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="day">Day of Week</Label>
                <Select 
                  value={newSlot.day_of_week.toString()} 
                  onValueChange={(value) => setNewSlot({ ...newSlot, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={day} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input 
                  id="start-time" 
                  type="time" 
                  value={newSlot.start_time}
                  onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input 
                  id="end-time" 
                  type="time" 
                  value={newSlot.end_time}
                  onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                />
              </div>
              <div className="col-span-4 flex items-center justify-between">
                <Label htmlFor="available" className="flex-1">Available for Booking</Label>
                <Switch 
                  id="available"
                  checked={newSlot.is_available}
                  onCheckedChange={(checked) => setNewSlot({ ...newSlot, is_available: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTimeSlot}>Add Time Slot</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog for adding recurring time slots */}
      <Dialog open={isRecurringDialogOpen} onOpenChange={setIsRecurringDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Recurring Time Slots</DialogTitle>
            <DialogDescription>
              Create multiple time slots for a specific day with regular intervals.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <Label htmlFor="recurring-day">Day of Week</Label>
                <Select 
                  value={recurringSlot.day_of_week.toString()} 
                  onValueChange={(value) => setRecurringSlot({ ...recurringSlot, day_of_week: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((day, index) => (
                      <SelectItem key={day} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="recurring-start">Start Time</Label>
                <Input 
                  id="recurring-start" 
                  type="time" 
                  value={recurringSlot.start_time}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, start_time: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="recurring-end">End Time</Label>
                <Input 
                  id="recurring-end" 
                  type="time" 
                  value={recurringSlot.end_time}
                  onChange={(e) => setRecurringSlot({ ...recurringSlot, end_time: e.target.value })}
                />
              </div>
              <div className="col-span-4">
                <Label htmlFor="interval">Interval (minutes)</Label>
                <Select 
                  value={recurringSlot.interval.toString()} 
                  onValueChange={(value) => setRecurringSlot({ ...recurringSlot, interval: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-4 flex items-center justify-between">
                <Label htmlFor="recurring-available" className="flex-1">Available for Booking</Label>
                <Switch 
                  id="recurring-available"
                  checked={recurringSlot.is_available}
                  onCheckedChange={(checked) => setRecurringSlot({ ...recurringSlot, is_available: checked })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRecurringDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddRecurringSlots}>Create Slots</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 