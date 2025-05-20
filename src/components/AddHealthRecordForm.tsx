'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, AlertTriangle, CheckCircle, FilePlus, Loader2 } from 'lucide-react';
import { encryptPHI, logDataAccess } from '@/utils/clientSecurityUtils';
import { createClientComponentClient } from '@/lib/supabase';
import { useHealthRecords } from '@/hooks/useHealthRecords';
import { FileUploadSection } from './FileUploadSection';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

// Form validation schema
const formSchema = z.object({
  patient_id: z.string().uuid('Valid patient ID is required'),
  doctor_id: z.string().uuid('Valid doctor ID is required'),
  appointment_id: z.string().uuid().optional(),
  record_type: z.string().min(1, 'Record type is required'),
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  is_confidential: z.boolean().default(true),
  file_url: z.string().url().optional().or(z.literal(''))
});

type FormValues = z.infer<typeof formSchema>;

interface AddHealthRecordFormProps {
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  onSuccess?: (recordId: string) => void;
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

export function AddHealthRecordForm({
  patientId,
  doctorId,
  appointmentId,
  onSuccess
}: AddHealthRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [customRecordType, setCustomRecordType] = useState(false);
  
  const supabase = createClientComponentClient();
  const { createHealthRecord } = useHealthRecords();

  // Define form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId,
      record_type: 'Clinical Notes',
      title: '',
      description: '',
      is_confidential: true,
      file_url: ''
    },
  });

  const watchRecordType = form.watch('record_type');

  // Handle file upload completion
  const handleFileUploaded = (url: string, name: string) => {
    setFileUrl(url);
    setFileName(name);
  };

  // Handle form submission
  async function onSubmit(values: FormValues) {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // If the record contains confidential information, encrypt the description
      if (values.description && values.is_confidential) {
        const encryptedDescription = await encryptPHI(values.description);
        if (encryptedDescription) {
          values.description = encryptedDescription;
        } else {
          throw new Error('Failed to encrypt sensitive information');
        }
      }

      const healthRecordData = {
        patient_id: patientId,
        doctor_id: doctorId,
        appointment_id: appointmentId,
        record_type: values.record_type.trim(),
        title: values.title.trim(),
        description: values.description?.trim(),
        file_url: fileUrl || undefined,
        is_confidential: values.is_confidential
      };

      const record = await createHealthRecord(healthRecordData);
      
      // Log the creation for audit purposes
      if (record) {
        await logDataAccess('health_record', record.id, 'create');
      }

      setSuccess(true);
      form.reset(); // Reset form after successful submission
      setFileUrl(null);
      setFileName(null);
      
      // Call the success callback if provided
      if (onSuccess && record) {
        onSuccess(record.id);
      }
    } catch (err: any) {
      console.error('Error creating health record:', err);
      setError(err.message || 'Failed to create health record. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // Toggle between predefined and custom record types
  const toggleCustomRecordType = () => {
    setCustomRecordType(!customRecordType);
    if (!customRecordType) {
      form.setValue('record_type', 'Clinical Notes'); // Set default when switching back
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Add Health Record</h2>
        <p className="text-muted-foreground">
          Add a new health record for the patient. Confidential information will be encrypted.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Health record added successfully.</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="record_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Record Type*</FormLabel>
                <div className="flex justify-between items-center">
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
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={loading}
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

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter a title for the record"
                    {...field}
                    disabled={loading}
                  />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter details about the health record"
                    className="resize-y min-h-[100px]"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  Provide detailed information about the health record. If marked as confidential, this information will be encrypted.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="file_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>File URL</FormLabel>
                <FormControl>
                  <FileUploadSection
                    patientId={patientId}
                    onFileUploaded={handleFileUploaded}
                  />
                </FormControl>
                <FormDescription>
                  URL to any associated files like lab reports, images, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {fileUrl && (
            <div className="p-3 bg-blue-50 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FilePlus className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm">{fileName}</span>
              </div>
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

          <FormField
            control={form.control}
            name="is_confidential"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Confidential Information</FormLabel>
                  <FormDescription>
                    Mark this record as containing sensitive information. 
                    The description will be encrypted and access will be strictly controlled.
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Add Health Record'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
} 