import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { Download, FileText, File, Printer, Edit, Save, X, ExternalLink } from 'lucide-react';
import { HealthRecord } from '@/types/supabase';
import { createClientComponentClient } from '@/lib/supabase';
import { logDataAccess } from '@/utils/clientSecurityUtils';

interface MedicalRecordDetailProps {
  record: HealthRecord;
  onUpdate?: (recordId: string) => void;
  onClose: () => void;
}

export function MedicalRecordDetail({ record, onUpdate, onClose }: MedicalRecordDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(record.description || '');
  const [isConfidential, setIsConfidential] = useState(record.is_confidential || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient();

  // Log that the record was viewed for audit purposes
  useState(() => {
    logDataAccess('health_record', record.id, 'view');
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDescription(record.description || '');
    setIsConfidential(record.is_confidential || false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('health_records')
        .update({
          description,
          is_confidential: isConfidential,
          updated_at: new Date().toISOString()
        })
        .eq('id', record.id);

      if (error) throw error;

      // Log the update for audit purposes
      await logDataAccess('health_record', record.id, 'edit');

      setIsEditing(false);

      // Call the onUpdate callback if provided
      if (onUpdate) {
        onUpdate(record.id);
      }
    } catch (err: any) {
      console.error('Error updating record:', err);
      setError(err.message || 'Failed to update record');
    } finally {
      setIsSaving(false);
    }
  };

  const openFile = (url: string) => {
    window.open(url, '_blank');
  };

  const downloadFile = (url: string, fileName = 'medical-document') => {
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const printRecord = () => {
    window.print();
  };

  return (
    <div className="space-y-4 print:m-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between items-start print:hidden">
        <h2 className="text-2xl font-bold">{record.title}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{record.record_type}</Badge>
        {record.is_confidential && (
          <Badge variant="destructive">Confidential</Badge>
        )}
        <Badge variant="secondary">
          Created: {format(new Date(record.created_at), 'PP')}
        </Badge>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              placeholder="Enter description..."
            />
          ) : (
            <p className="whitespace-pre-wrap">{description || 'No description provided'}</p>
          )}
        </CardContent>
        
        {isEditing && (
          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="is-confidential" 
                checked={isConfidential}
                onChange={(e) => setIsConfidential(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="is-confidential" className="text-sm">Mark as confidential</label>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardFooter>
        )}
      </Card>
      
      {record.file_url && (
        <Card>
          <CardHeader>
            <CardTitle className="text-md">Attached Document</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded border">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-blue-500 mr-2" />
                <span>Medical document</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => openFile(record.file_url!)}>
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadFile(record.file_url!)}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-md">Record Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Record ID:</span>
              <span className="ml-1 font-mono text-xs">{record.id}</span>
            </div>
            <div>
              <span className="text-gray-500">Patient ID:</span>
              <span className="ml-1 font-mono text-xs">{record.patient_id}</span>
            </div>
            <div>
              <span className="text-gray-500">Doctor ID:</span>
              <span className="ml-1 font-mono text-xs">{record.doctor_id}</span>
            </div>
            <div>
              <span className="text-gray-500">Created:</span>
              <span className="ml-1">{format(new Date(record.created_at), 'PPp')}</span>
            </div>
            {record.updated_at && (
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-1">{format(new Date(record.updated_at), 'PPp')}</span>
              </div>
            )}
            {record.last_accessed_at && (
              <div>
                <span className="text-gray-500">Last Accessed:</span>
                <span className="ml-1">{format(new Date(record.last_accessed_at), 'PPp')}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between pt-4 print:hidden">
        <Button variant="outline" onClick={printRecord}>
          <Printer className="h-4 w-4 mr-1" />
          Print Record
        </Button>
        
        {!isEditing && (
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-1" />
            Edit Record
          </Button>
        )}
      </div>
    </div>
  );
} 