import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle, AlertTriangle, FileText, Calendar, Lock } from 'lucide-react';
import { formatDistance } from 'date-fns';

interface HealthRecordsListProps {
  patientId: string;
}

export function HealthRecordsList({ patientId }: HealthRecordsListProps) {
  const {
    healthRecords,
    medicalHistory,
    prescriptions,
    loading,
    error,
    hasAccess,
    refreshData
  } = useHealthRecords(patientId);

  const [selectedTab, setSelectedTab] = useState<'records' | 'history' | 'prescriptions'>('records');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading health records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!hasAccess) {
    return (
      <Alert className="my-4 border-yellow-500 bg-yellow-50">
        <Lock className="h-4 w-4 text-yellow-500" />
        <AlertTitle>Access Restricted</AlertTitle>
        <AlertDescription>
          You do not have permission to view these health records.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex space-x-2 border-b pb-2">
        <Button
          variant={selectedTab === 'records' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('records')}
        >
          Health Records ({healthRecords.length})
        </Button>
        <Button
          variant={selectedTab === 'history' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('history')}
        >
          Medical History ({medicalHistory.length})
        </Button>
        <Button
          variant={selectedTab === 'prescriptions' ? 'default' : 'ghost'}
          onClick={() => setSelectedTab('prescriptions')}
        >
          Prescriptions ({prescriptions.length})
        </Button>
      </div>

      {selectedTab === 'records' && (
        <div className="grid gap-4 md:grid-cols-2">
          {healthRecords.length === 0 ? (
            <p className="col-span-2 text-center text-muted-foreground py-8">
              No health records found.
            </p>
          ) : (
            healthRecords.map((record) => (
              <Card key={record.id} className={record.is_confidential ? 'border-red-200' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{record.title}</CardTitle>
                    {record.is_confidential && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                        Confidential
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    <FileText className="inline-block h-4 w-4 mr-1" />
                    {record.record_type}
                    <span className="mx-2">•</span>
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    {record.created_at ? formatDistance(new Date(record.created_at), new Date(), { addSuffix: true }) : 'Unknown date'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{record.description}</p>
                </CardContent>
                {record.file_url && (
                  <CardFooter>
                    <Button variant="outline" size="sm" asChild>
                      <a href={record.file_url} target="_blank" rel="noopener noreferrer">
                        View File
                      </a>
                    </Button>
                  </CardFooter>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTab === 'history' && (
        <div className="space-y-4">
          {medicalHistory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No medical history found.
            </p>
          ) : (
            medicalHistory.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>{item.history_type}</CardTitle>
                    {item.is_current && (
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  {item.diagnosed_date && (
                    <CardDescription>
                      <Calendar className="inline-block h-4 w-4 mr-1" />
                      Diagnosed: {new Date(item.diagnosed_date).toLocaleDateString()}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p>{item.description}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {selectedTab === 'prescriptions' && (
        <div className="space-y-4">
          {prescriptions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No prescriptions found.
            </p>
          ) : (
            prescriptions.map((prescription) => (
              <Card key={prescription.id} className={!prescription.is_active ? 'opacity-70' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle>
                      {Array.isArray(prescription.medications) 
                        ? prescription.medications.map((med: any) => med.name).join(', ')
                        : typeof prescription.medications === 'object' && prescription.medications !== null
                          ? Object.values(prescription.medications as any).map((med: any) => med.name).join(', ')
                          : 'Prescription'
                      }
                    </CardTitle>
                    {prescription.is_active ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        Active
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        Expired
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    Issued: {new Date(prescription.issue_date).toLocaleDateString()}
                    {prescription.expiry_date && (
                      <>
                        <span className="mx-2">•</span>
                        Expires: {new Date(prescription.expiry_date).toLocaleDateString()}
                      </>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium">Medications:</h4>
                    <ul className="list-disc pl-5 space-y-1">
                      {Array.isArray(prescription.medications) 
                        ? prescription.medications.map((med: any, index: number) => (
                            <li key={index}>
                              {med.name} {med.dosage} - {med.frequency}
                            </li>
                          ))
                        : typeof prescription.medications === 'object' && prescription.medications !== null
                          ? Object.values(prescription.medications as any).map((med: any, index: number) => (
                              <li key={index}>
                                {med.name} {med.dosage} - {med.frequency}
                              </li>
                            ))
                          : <li>No medication details available</li>
                      }
                    </ul>
                    {prescription.instructions && (
                      <div className="mt-4">
                        <h4 className="font-medium">Instructions:</h4>
                        <p className="text-sm">{prescription.instructions}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={refreshData} disabled={loading}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
} 