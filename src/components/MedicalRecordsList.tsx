import { useState, useEffect, useMemo } from 'react';
import { createClientComponentClient } from '@/lib/supabase';
import { logDataAccess } from '@/utils/clientSecurityUtils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  LoaderCircle, AlertTriangle, FileText, Calendar, Lock, 
  File, Download, ChevronLeft, ChevronRight, Search, Filter, 
  X, Eye, ExternalLink, Plus, Printer, RefreshCw
} from 'lucide-react';
import { HealthRecord } from '@/types/supabase';
import { MedicalRecordDetail } from './MedicalRecordDetail';
import { AddMedicalRecordForm } from './AddMedicalRecordForm';

interface MedicalRecordsListProps {
  doctorId: string;
  patientId?: string;
  onRecordCreated?: () => void;
  className?: string;
}

export function MedicalRecordsList({ 
  doctorId, 
  patientId,
  onRecordCreated,
  className = ''
}: MedicalRecordsListProps) {
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [isAddingRecord, setIsAddingRecord] = useState(false);
  const recordsPerPage = 8;

  const supabase = createClientComponentClient();

  // Fetch health records
  useEffect(() => {
    const fetchHealthRecords = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('health_records')
          .select(`
            *,
            patient:patient_id(id, full_name, email)
          `)
          .eq('doctor_id', doctorId)
          .order('created_at', { ascending: false });
        
        // If a specific patient is selected, filter by patient ID
        if (patientId) {
          query = query.eq('patient_id', patientId);
        }
        
        const { data, error: fetchError } = await query;
        
        if (fetchError) throw fetchError;
        
        setHealthRecords(data || []);
        
        // Log access for audit purposes
        if (patientId) {
          await logDataAccess('health_record', patientId, 'view');
        }
      } catch (err: any) {
        console.error('Error fetching health records:', err);
        setError(err.message || 'Failed to load health records');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHealthRecords();
  }, [doctorId, patientId]);

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
        record.record_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.patient?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
      
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

  // Refresh data function
  const refreshData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('health_records')
        .select(`
          *,
          patient:patient_id(id, full_name, email)
        `)
        .eq('doctor_id', doctorId)
        .order('created_at', { ascending: false });
      
      if (patientId) {
        query = query.eq('patient_id', patientId);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) throw fetchError;
      
      setHealthRecords(data || []);
    } catch (err: any) {
      console.error('Error refreshing health records:', err);
      setError(err.message || 'Failed to refresh records');
    } finally {
      setLoading(false);
    }
  };

  // Handle record creation success
  const handleRecordCreated = () => {
    setIsAddingRecord(false);
    refreshData();
    if (onRecordCreated) {
      onRecordCreated();
    }
  };

  // Handle record update
  const handleRecordUpdated = () => {
    refreshData();
    setSelectedRecord(null);
  };

  // View file in new tab
  const openFileInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
        <LoaderCircle className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading medical records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={`my-4 ${className}`}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Medical Records</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          
          <Button 
            size="sm" 
            onClick={() => setIsAddingRecord(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Record
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Records</TabsTrigger>
          <TabsTrigger value="clinical">Clinical Notes</TabsTrigger>
          <TabsTrigger value="labresults">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="mb-4 flex flex-col md:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records by title, patient name, or description..."
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
              
              <Button 
                variant="outline" 
                size="icon" 
                title="Clear Filters" 
                onClick={() => {
                  setSearchQuery('');
                  setRecordTypeFilter(null);
                }}
              >
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
              <Button onClick={() => setIsAddingRecord(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Add First Record
              </Button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {paginatedRecords.map((record) => (
                  <Card 
                    key={record.id} 
                    className={`overflow-hidden transition-all hover:shadow-md ${record.is_confidential ? 'border-red-200' : ''}`}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-base">{record.title}</CardTitle>
                        {record.is_confidential && (
                          <Badge variant="destructive" className="ml-2">
                            <Lock className="h-3 w-3 mr-1" /> Confidential
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="flex items-center flex-wrap gap-1 text-xs">
                        <Badge variant="outline" className="font-normal">
                          {record.record_type}
                        </Badge>
                        <span className="text-gray-500 ml-1">
                          <Calendar className="inline-block h-3 w-3 mr-1" />
                          {record.created_at 
                            ? format(new Date(record.created_at), 'MMM d, yyyy')
                            : 'Unknown date'
                          }
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="py-2">
                      <p className="text-sm line-clamp-2 text-gray-600">
                        {record.description || 'No description provided'}
                      </p>
                      {!patientId && record.patient && (
                        <p className="text-xs text-blue-600 mt-1">
                          Patient: {record.patient.full_name}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter className="pt-0 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setSelectedRecord(record)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View
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
        
        <TabsContent value="clinical">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Filter to show only clinical notes here. Currently using the All Records tab for all record types.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="labresults">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Filter to show only lab results here. Currently using the All Records tab for all record types.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="imaging">
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Filter to show only imaging reports here. Currently using the All Records tab for all record types.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Record detail dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <MedicalRecordDetail
              record={selectedRecord}
              onClose={() => setSelectedRecord(null)}
              onUpdate={handleRecordUpdated}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add record dialog */}
      <Dialog open={isAddingRecord} onOpenChange={setIsAddingRecord}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Medical Record</DialogTitle>
          </DialogHeader>
          
          <AddMedicalRecordForm
            doctorId={doctorId}
            preselectedPatient={patientId}
            onSuccess={handleRecordCreated}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 