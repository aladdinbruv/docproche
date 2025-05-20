import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createClientComponentClient } from '@/lib/supabase';
import { FileUploadSection } from './FileUploadSection';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { User } from '@/types/supabase';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage 
} from '@/components/ui/form';
import { Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Form validation schema
const formSchema = z.object({
  patient_id: z.string().min(1, "Patient selection is required"),
  record_type: z.string().min(1, "Record type is required"),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must not exceed 100 characters"),
  description: z.string().optional(),
  is_confidential: z.boolean().default(false)
});

type FormValues = z.infer<typeof formSchema>;

interface AddMedicalRecordFormProps {
  doctorId: string;
  onSuccess?: (recordId: string) => void;
  preselectedPatient?: string;
  appointmentId?: string;
}

const recordTypes = [
  'Clinical Notes',
  'Lab Results',
  'Imaging Report',
  'Consultation Summary',
  'Treatment Plan',
  'Surgery Report',
  'Medication Record',
  'Vaccination Record',
  'Allergy Report',
  'Other'
];

export function AddMedicalRecordForm({
  doctorId,
  onSuccess,
  preselectedPatient,
  appointmentId
}: AddMedicalRecordFormProps) {
  const [patients, setPatients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [customRecordType, setCustomRecordType] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { createHealthRecord } = useHealthRecords();
  const supabase = createClientComponentClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: preselectedPatient || '',
      record_type: 'Clinical Notes',
      title: '',
      description: '',
      is_confidential: false
    }
  });

  // Load patient list when component mounts
  useEffect(() => {
    fetchPatients();
  }, []);

  // Filter patients based on search query
  const filteredPatients = patients.filter(patient => 
    searchQuery === '' || 
    patient.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch patients that the doctor has appointments with
  const fetchPatients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          patient_id,
          patient:patient_id(id, full_name, email)
        `)
        .eq('doctor_id', doctorId)
        .order('date', { ascending: false });

      if (error) throw error;

      // Extract unique patients
      const uniquePatients = new Map();
      data.forEach(item => {
        if (item.patient && !uniquePatients.has(item.patient.id)) {
          uniquePatients.set(item.patient.id, item.patient);
        }
      });

      setPatients(Array.from(uniquePatients.values()) as User[]);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patient list');
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload completion
  const handleFileUploaded = (url: string, name: string) => {
    setFileUrl(url);
    setFileName(name);
  };

  const handleFormSubmit = async (values: FormValues) => {
    setLoading(true);
    setError(null);

    try {
      const healthRecordData = {
        patient_id: values.patient_id,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        record_type: values.record_type,
        title: values.title,
        description: values.description || '',
        file_url: fileUrl || undefined,
        is_confidential: values.is_confidential
      };

      const record = await createHealthRecord(healthRecordData);
      
      // Reset form on success
      form.reset();
      setFileUrl(null);
      setFileName(null);
      
      // Call the success callback if provided
      if (onSuccess && record) {
        onSuccess(record.id);
      }
    } catch (err: any) {
      console.error('Error creating health record:', err);
      setError(err.message || 'Failed to create health record');
    } finally {
      setLoading(false);
    }
  };

  // Toggle between predefined and custom record types
  const toggleCustomRecordType = () => {
    setCustomRecordType(!customRecordType);
    if (!customRecordType) {
      form.setValue('record_type', ''); // Clear the value when switching to custom
    } else {
      form.setValue('record_type', 'Clinical Notes'); // Set default when switching back
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Patient Selection */}
          <FormField
            control={form.control}
            name="patient_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Patient*</FormLabel>
                <FormDescription>
                  Select the patient this record belongs to
                </FormDescription>
                <div className="space-y-2">
                  {!preselectedPatient && (
                    <Input
                      placeholder="Search patients by name or email"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                  )}
                  <Select
                    disabled={!!preselectedPatient || loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a patient" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredPatients.length === 0 ? (
                        <div className="p-2 text-center text-gray-500 text-sm">
                          {searchQuery ? 'No patients match your search' : 'No patients found'}
                        </div>
                      ) : (
                        filteredPatients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id}>
                            {patient.full_name} ({patient.email})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>

                  {!preselectedPatient && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={fetchPatients}
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh Patient List
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Record Type Selection */}
          <FormField
            control={form.control}
            name="record_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Record Type*</FormLabel>
                <div className="flex justify-between items-center mb-2">
                  <FormDescription>
                    Select the type of medical record
                  </FormDescription>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="custom-type" className="text-sm">Custom Type</Label>
                    <Switch 
                      id="custom-type" 
                      checked={customRecordType} 
                      onCheckedChange={toggleCustomRecordType} 
                    />
                  </div>
                </div>
                {!customRecordType ? (
                  <Select
                    disabled={loading}
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select record type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {recordTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <FormControl>
                    <Input
                      placeholder="Enter custom record type"
                      {...field}
                      disabled={loading}
                    />
                  </FormControl>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Record Title*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a descriptive title for this record"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter a detailed description of this record"
                    {...field}
                    disabled={loading}
                    rows={4}
                  />
                </FormControl>
                <FormDescription>
                  Provide any additional details about this record
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          {form.getValues('patient_id') && (
            <div className="space-y-2">
              <Label>Document Attachment</Label>
              <FileUploadSection
                patientId={form.getValues('patient_id')}
                onFileUploaded={handleFileUploaded}
              />

              {fileUrl && fileName && (
                <div className="p-3 mt-2 bg-blue-50 rounded-md border border-blue-100 flex items-center justify-between">
                  <span className="text-sm">{fileName}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setFileUrl(null);
                      setFileName(null);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Confidentiality Setting */}
          <FormField
            control={form.control}
            name="is_confidential"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Confidential Record
                  </FormLabel>
                  <FormDescription>
                    Mark this record as confidential for restricted access
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Record...
              </>
            ) : (
              'Save Medical Record'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 