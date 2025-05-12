import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { createClientComponentClient } from '@/lib/supabase';
import { AlertCircle, PlusCircle, Trash2 } from 'lucide-react';
import { usePrescriptions } from '@/hooks/usePrescriptions';
import { format, addMonths } from 'date-fns';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
}

interface Patient {
  id: string;
  full_name: string;
  email: string;
}

interface Appointment {
  id: string;
  date: string;
  time_slot: string;
  consultation_type: string;
}

interface PrescriptionFormProps {
  onSuccess?: (prescriptionId: string) => void;
  onCancel?: () => void;
  patientId?: string;
  appointmentId?: string;
}

export default function PrescriptionForm({
  onSuccess,
  onCancel,
  patientId,
  appointmentId
}: PrescriptionFormProps) {
  const { createPrescription, loading, error } = usePrescriptions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Form state
  const [prescription, setPrescription] = useState({
    patient_id: patientId || '',
    appointment_id: appointmentId || '',
    medications: [{ name: '', dosage: '', frequency: '' }] as Medication[],
    instructions: '',
    issue_date: format(new Date(), 'yyyy-MM-dd'),
    expiry_date: format(addMonths(new Date(), 3), 'yyyy-MM-dd'), // Default 3 months
  });

  // Fetch patients list (if no patientId provided)
  useEffect(() => {
    async function fetchPatients() {
      if (patientId) return; // Skip if patientId is provided

      setLoadingPatients(true);
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, email')
        .eq('role', 'patient')
        .order('full_name');

      if (!error && data) {
        setPatients(data);
      }
      setLoadingPatients(false);
    }

    fetchPatients();
  }, [patientId]);

  // Fetch appointments for the selected patient
  useEffect(() => {
    async function fetchAppointments() {
      if (!prescription.patient_id) return;
      if (appointmentId) return; // Skip if appointmentId is provided

      setLoadingAppointments(true);
      const supabase = createClientComponentClient();
      const { data, error } = await supabase
        .from('appointments')
        .select('id, date, time_slot, consultation_type')
        .eq('patient_id', prescription.patient_id)
        .eq('status', 'completed')
        .order('date', { ascending: false })
        .limit(10);

      if (!error && data) {
        setAppointments(data);
      }
      setLoadingAppointments(false);
    }

    fetchAppointments();
  }, [prescription.patient_id, appointmentId]);

  // Update patient selection
  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPrescription({
      ...prescription,
      patient_id: e.target.value,
      appointment_id: '', // Reset appointment when patient changes
    });
  };

  // Update medication fields
  const handleMedicationChange = (index: number, field: keyof Medication, value: string) => {
    const updatedMedications = [...prescription.medications];
    updatedMedications[index] = {
      ...updatedMedications[index],
      [field]: value,
    };
    setPrescription({ ...prescription, medications: updatedMedications });
  };

  // Add a new medication
  const addMedication = () => {
    setPrescription({
      ...prescription,
      medications: [
        ...prescription.medications,
        { name: '', dosage: '', frequency: '' },
      ],
    });
  };

  // Remove a medication
  const removeMedication = (index: number) => {
    if (prescription.medications.length <= 1) return;
    const updatedMedications = [...prescription.medications];
    updatedMedications.splice(index, 1);
    setPrescription({ ...prescription, medications: updatedMedications });
  };

  // Validate the form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!prescription.patient_id) {
      errors.patient_id = 'Patient is required';
    }

    // Check if at least one medication is valid
    let hasValidMedication = false;
    prescription.medications.forEach((medication, index) => {
      if (medication.name && medication.dosage && medication.frequency) {
        hasValidMedication = true;
      }
    });

    if (!hasValidMedication) {
      errors.medications = 'At least one complete medication is required';
    }

    return errors;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    setFormErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    // Filter out empty medications
    const validMedications = prescription.medications.filter(
      med => med.name && med.dosage && med.frequency
    );

    // Create the prescription
    const result = await createPrescription({
      ...prescription,
      medications: validMedications,
    });

    if (result && onSuccess) {
      onSuccess(result.id);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Create Prescription</CardTitle>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {/* Error message */}
          {(error || Object.keys(formErrors).length > 0) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <div>
                {error || 'Please correct the errors in the form.'}
                {formErrors.medications && (
                  <p className="text-sm">{formErrors.medications}</p>
                )}
              </div>
            </div>
          )}
          
          {/* Patient selection */}
          {!patientId && (
            <div className="space-y-2">
              <Label htmlFor="patient">Patient</Label>
              <select
                id="patient"
                value={prescription.patient_id}
                onChange={handlePatientChange}
                className={`w-full p-2 border ${
                  formErrors.patient_id ? 'border-red-500' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                disabled={loadingPatients}
              >
                <option value="">Select a patient</option>
                {patients.map(patient => (
                  <option key={patient.id} value={patient.id}>
                    {patient.full_name}
                  </option>
                ))}
              </select>
              {formErrors.patient_id && (
                <p className="text-xs text-red-500">{formErrors.patient_id}</p>
              )}
            </div>
          )}
          
          {/* Appointment selection (optional) */}
          {!appointmentId && prescription.patient_id && (
            <div className="space-y-2">
              <Label htmlFor="appointment">
                Associated Appointment (Optional)
              </Label>
              <select
                id="appointment"
                value={prescription.appointment_id}
                onChange={(e) => 
                  setPrescription({ ...prescription, appointment_id: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={loadingAppointments}
              >
                <option value="">None (Create standalone prescription)</option>
                {appointments.map(appointment => (
                  <option key={appointment.id} value={appointment.id}>
                    {appointment.date} at {appointment.time_slot} ({appointment.consultation_type})
                  </option>
                ))}
              </select>
            </div>
          )}
          
          {/* Medications */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Medications</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addMedication}
                className="flex items-center gap-1 text-blue-600"
              >
                <PlusCircle className="h-4 w-4" />
                Add Medication
              </Button>
            </div>
            
            {prescription.medications.map((medication, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 border border-gray-200 rounded-md"
              >
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor={`med-name-${index}`}>Medication Name</Label>
                  <Input
                    id={`med-name-${index}`}
                    value={medication.name}
                    onChange={(e) => 
                      handleMedicationChange(index, 'name', e.target.value)
                    }
                    placeholder="e.g., Amoxicillin"
                  />
                </div>
                
                <div className="space-y-1">
                  <Label htmlFor={`med-dosage-${index}`}>Dosage</Label>
                  <Input
                    id={`med-dosage-${index}`}
                    value={medication.dosage}
                    onChange={(e) => 
                      handleMedicationChange(index, 'dosage', e.target.value)
                    }
                    placeholder="e.g., 500mg"
                  />
                </div>
                
                <div className="space-y-1 flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor={`med-freq-${index}`}>Frequency</Label>
                    <Input
                      id={`med-freq-${index}`}
                      value={medication.frequency}
                      onChange={(e) => 
                        handleMedicationChange(index, 'frequency', e.target.value)
                      }
                      placeholder="e.g., 3 times daily"
                    />
                  </div>
                  
                  {prescription.medications.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeMedication(index)}
                      className="h-10 w-10 mt-6 text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            {formErrors.medications && (
              <p className="text-xs text-red-500">{formErrors.medications}</p>
            )}
          </div>
          
          {/* Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={prescription.instructions}
              onChange={(e) => 
                setPrescription({ ...prescription, instructions: e.target.value })
              }
              placeholder="e.g., Take with food, avoid alcohol, etc."
              rows={3}
            />
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input
                id="issue-date"
                type="date"
                value={prescription.issue_date}
                onChange={(e) => 
                  setPrescription({ ...prescription, issue_date: e.target.value })
                }
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expiry-date">
                Expiry Date (Optional)
              </Label>
              <Input
                id="expiry-date"
                type="date"
                value={prescription.expiry_date}
                onChange={(e) => 
                  setPrescription({ ...prescription, expiry_date: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Prescription'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
} 