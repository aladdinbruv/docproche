'use client';

import { useHealthRecords } from '@/hooks/useHealthRecords';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileUploadSection } from './FileUploadSection';
import { AddHealthRecordForm } from './AddHealthRecordForm';
import { Input } from '@/components/ui/input';
import { format, formatDistance } from 'date-fns';
import { 
  LoaderCircle, AlertTriangle, FileText, Calendar, Lock, 
  File, Download, ChevronLeft, ChevronRight, Search, Filter, 
  FileUp, X, Eye, ExternalLink, Plus, Printer, RefreshCw, Filter as FilterIcon
} from 'lucide-react';
import { HealthRecord, Prescription, MedicalHistory } from '@/types/supabase';
import { useAuth } from '@/hooks/useAuth';

interface HealthRecordsListProps {
  patientId: string;
}

export function HealthRecordsList({ patientId }: HealthRecordsListProps) {
  const { user, profile } = useAuth();
  const {
    healthRecords,
    medicalHistory,
    prescriptions,
    loading,
    error,
    hasAccess,
    refreshData,
    createHealthRecord
  } = useHealthRecords(patientId);

  const [selectedTab, setSelectedTab] = useState<'records' | 'history' | 'prescriptions'>('records');
  const [searchQuery, setSearchQuery] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const recordsPerPage = 6;

  // Get unique record types for filtering
  const recordTypes = useMemo(() => {
    return Array.from(new Set(healthRecords.map(record => record.record_type)));
  }, [healthRecords]);

  // Filter records based on search and record type
  const filteredRecords = useMemo(() => {
    return healthRecords.filter(record => {
      const matchesSearch = 
        record.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.record_type?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = recordTypeFilter ? record.record_type === recordTypeFilter : true;
      
      return matchesSearch && matchesType;
    });
  }, [healthRecords, searchQuery, recordTypeFilter]);

  // Paginate records
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * recordsPerPage;
    return filteredRecords.slice(startIndex, startIndex + recordsPerPage);
  }, [filteredRecords, currentPage, recordsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  // Handle pagination
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Reset pagination when filters change
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeFilter = (type: string | null) => {
    setRecordTypeFilter(type);
    setCurrentPage(1);
  };

  // Handle record creation success
  const handleRecordCreated = (recordId: string) => {
    setIsAddingRecord(false);
    refreshData();
  };

  // View file in new tab
  const openFileInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

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
      <Tabs 
        value={selectedTab} 
        onValueChange={(value) => setSelectedTab(value as 'records' | 'history' | 'prescriptions')}
      >
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="records">
              Health Records ({healthRecords.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              Medical History ({medicalHistory.length})
            </TabsTrigger>
            <TabsTrigger value="prescriptions">
              Prescriptions ({prescriptions.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            
            {profile?.role === 'doctor' && (
              <Button 
                size="sm" 
                onClick={() => setIsAddingRecord(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Record
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="records">
          <div className="mb-4 flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records by title, type or description..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearch}
              />
            </div>
            <div className="flex gap-2">
              <select
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={recordTypeFilter || ''}
                onChange={(e) => handleTypeFilter(e.target.value || null)}
              >
                <option value="">All Record Types</option>
                {recordTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              
              <Button variant="outline" size="icon" title="Clear Filters" onClick={() => {
                setSearchQuery('');
                setRecordTypeFilter(null);
              }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {paginatedRecords.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No health records found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                {searchQuery || recordTypeFilter 
                  ? "No records match your search criteria. Try adjusting your filters."
                  : "There are no health records in the system yet."}
              </p>
              {profile?.role === 'doctor' && (
                <Button onClick={() => setIsAddingRecord(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Record
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedRecords.map((record) => (
                  <Card 
                    key={record.id} 
                    className={`overflow-hidden transition-all hover:shadow-md ${record.is_confidential ? 'border-red-200' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        {record.is_confidential && (
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                            <Lock className="h-3 w-3 mr-1" />
                            Confidential
                          </span>
                        )}
                      </div>
                      <CardDescription className="flex items-center flex-wrap gap-1 text-xs">
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                          {record.record_type}
                        </span>
                        <span className="text-gray-500 ml-1">
                          <Calendar className="inline-block h-3 w-3 mr-1" />
                          {record.created_at 
                            ? format(new Date(record.created_at), 'MMM d, yyyy')
                            : 'Unknown date'
                          }
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm line-clamp-2">
                        {record.description || 'No description provided'}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Details
                      </Button>
                      {record.file_url && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openFileInNewTab(record.file_url!)}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Open File
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-6">
                  <p className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * recordsPerPage + 1}-
                    {Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
                  </p>
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePrevPage} 
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      // Show pages around current page if there are many pages
                      let pageNum = currentPage;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage} 
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {medicalHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No medical history found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There is no medical history recorded for this patient.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {medicalHistory.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>{item.history_type}</CardTitle>
                        {item.is_current && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            Current
                          </span>
                        )}
                      </div>
                      {item.diagnosed_date && (
                        <CardDescription>
                          <Calendar className="inline-block h-4 w-4 mr-1" />
                          Diagnosed: {format(new Date(item.diagnosed_date), 'MMM d, yyyy')}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="space-y-4">
            {prescriptions.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No prescriptions found</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  There are no prescriptions recorded for this patient.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className={!prescription.is_active ? 'opacity-80' : ''}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle>
                          {Array.isArray(prescription.medications) 
                            ? prescription.medications.map((med: any) => med.name).join(', ')
                            : typeof prescription.medications === 'object' && prescription.medications !== null
                              ? Object.values(prescription.medications as any)
                                  .slice(0, 2)
                                  .map((med: any) => med.name)
                                  .join(', ') + 
                                (Object.values(prescription.medications as any).length > 2 ? ' and others' : '')
                              : 'Prescription'
                          }
                        </CardTitle>
                        {prescription.is_active ? (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            Active
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                            Expired
                          </span>
                        )}
                      </div>
                      <CardDescription>
                        <Calendar className="inline-block h-4 w-4 mr-1" />
                        Issued: {format(new Date(prescription.issue_date), 'MMM d, yyyy')}
                        {prescription.expiry_date && (
                          <>
                            <span className="mx-2">•</span>
                            Expires: {format(new Date(prescription.expiry_date), 'MMM d, yyyy')}
                          </>
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Medications:</h4>
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {Array.isArray(prescription.medications) 
                            ? prescription.medications.map((med: any, index: number) => (
                                <li key={index}>
                                  <strong>{med.name}</strong> {med.dosage} - {med.frequency}
                                </li>
                              ))
                            : typeof prescription.medications === 'object' && prescription.medications !== null
                              ? Object.values(prescription.medications as any).map((med: any, index: number) => (
                                  <li key={index}>
                                    <strong>{med.name}</strong> {med.dosage} - {med.frequency}
                                  </li>
                                ))
                              : <li>No medication details available</li>
                          }
                        </ul>
                        {prescription.instructions && (
                          <div className="mt-4">
                            <h4 className="font-medium text-sm">Instructions:</h4>
                            <p className="text-sm">{prescription.instructions}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        <Printer className="h-4 w-4 mr-1" />
                        Print Prescription
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Record detail dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedRecord.title}</span>
                  {selectedRecord.is_confidential && (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full flex items-center">
                      <Lock className="h-3 w-3 mr-1" />
                      Confidential
                    </span>
                  )}
                </DialogTitle>
                <DialogDescription>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                      {selectedRecord.record_type}
                    </span>
                    <span className="text-gray-500 text-xs flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      Created {format(new Date(selectedRecord.created_at), 'MMM d, yyyy')}
                    </span>
                    {selectedRecord.updated_at && (
                      <span className="text-gray-500 text-xs flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Updated {formatDistance(new Date(selectedRecord.updated_at), new Date(), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 my-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">
                    {selectedRecord.description || 'No description provided'}
                  </p>
                </div>
                
                {selectedRecord.file_url && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Attached File</h3>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md border">
                      <div className="flex items-center">
                        <File className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm">Attached document</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openFileInNewTab(selectedRecord.file_url!)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                        >
                          <a href={selectedRecord.file_url} download target="_blank" rel="noreferrer">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Record Information</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Record ID:</span>
                      <span className="ml-1 font-mono text-xs">{selectedRecord.id}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-1">{format(new Date(selectedRecord.created_at), 'PPpp')}</span>
                    </div>
                    {selectedRecord.updated_at && (
                      <div>
                        <span className="text-gray-500">Last Updated:</span>
                        <span className="ml-1">{format(new Date(selectedRecord.updated_at), 'PPpp')}</span>
                      </div>
                    )}
                    {selectedRecord.last_accessed_at && (
                      <div>
                        <span className="text-gray-500">Last Accessed:</span>
                        <span className="ml-1">{format(new Date(selectedRecord.last_accessed_at), 'PPpp')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add record dialog */}
      <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Health Record</DialogTitle>
            <DialogDescription>
              Create a new health record for this patient.
            </DialogDescription>
          </DialogHeader>
          
          <AddHealthRecordForm
            patientId={patientId}
            doctorId={profile?.id || ''}
            onSuccess={handleRecordCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 