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
import { LoaderCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { encryptPHI, logDataAccess } from '@/utils/securityUtils';
import { createClientComponentClient } from '@/lib/supabase';

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

export function AddHealthRecordForm({
  patientId,
  doctorId,
  appointmentId,
  onSuccess
}: AddHealthRecordFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClientComponentClient();

  // Define form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patient_id: patientId,
      doctor_id: doctorId,
      appointment_id: appointmentId,
      record_type: '',
      title: '',
      description: '',
      is_confidential: true,
      file_url: ''
    },
  });

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

      // Insert the record
      const { data, error } = await supabase
        .from('health_records')
        .insert(values)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Log the creation for audit purposes
      if (data) {
        await logDataAccess('health_record', data.id, 'create');
      }

      setSuccess(true);
      form.reset(); // Reset form after successful submission
      
      // Call the success callback if provided
      if (onSuccess && data) {
        onSuccess(data.id);
      }
    } catch (err) {
      console.error('Error adding health record:', err);
      setError(err instanceof Error ? err.message : 'Failed to add health record');
    } finally {
      setLoading(false);
    }
  }

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
                    <SelectItem value="Lab Result">Lab Result</SelectItem>
                    <SelectItem value="Diagnostic Image">Diagnostic Image</SelectItem>
                    <SelectItem value="Clinical Note">Clinical Note</SelectItem>
                    <SelectItem value="Vaccination">Vaccination</SelectItem>
                    <SelectItem value="Procedure">Procedure</SelectItem>
                    <SelectItem value="Surgery">Surgery</SelectItem>
                    <SelectItem value="Discharge Summary">Discharge Summary</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
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
                  <Input
                    placeholder="Enter URL to related file (optional)"
                    {...field}
                    disabled={loading}
                  />
                </FormControl>
                <FormDescription>
                  URL to any associated files like lab reports, images, etc.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
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