import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { csvApi } from '../services/csvApi';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
  Eye,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  Database,
  Users,
  Package,
  Route,
  BarChart3,
  X,
} from 'lucide-react';

interface CSVData {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  type: 'drivers' | 'orders' | 'routes';
  recordCount: number;
  validRecords: number;
  errors: string[];
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
  value: string;
}

interface DbStats {
  totals: { drivers: number; routes: number; orders: number };
  ordersByStatus: Record<string, number>;
  routesByTraffic: Record<string, { count: number; avgDistance: number }>;
}

const CSVUpload: React.FC = () => {
  const [uploadedFiles, setUploadedFiles] = useState<CSVData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<CSVData | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [dbStats, setDbStats] = useState<DbStats | null>(null);

  const loadDatabaseStats = useCallback(async () => {
    try {
      const stats = await csvApi.getDatabaseStats();
      setDbStats(stats.data);
    } catch (error) {
      console.error('Failed to load database stats:', error);
    }
  }, []);

  useEffect(() => {
    loadDatabaseStats();
  }, [loadDatabaseStats]);

  const detectFileType = (fileName: string): 'drivers' | 'orders' | 'routes' => {
    const name = fileName.toLowerCase();
    if (name.includes('driver')) return 'drivers';
    if (name.includes('order')) return 'orders';
    if (name.includes('route')) return 'routes';
    return 'orders'; // default
  };

  const processFile = async (file: File) => {
    const newFile: CSVData = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      fileName: file.name,
      fileSize: file.size,
      uploadDate: new Date(),
      status: 'uploading',
      type: detectFileType(file.name),
      recordCount: 0,
      validRecords: 0,
      errors: [],
    };

    setUploadedFiles(prev => [...prev, newFile]);

    try {
      setUploadedFiles(prev => prev.map(f => 
        f.id === newFile.id ? { ...f, status: 'processing' } : f
      ));

      const result = await csvApi.uploadCsv(file, newFile.type);
      
      if (result.success) {
        setUploadedFiles(prev => prev.map(f => 
          f.id === newFile.id ? { 
            ...f, 
            status: 'completed',
            recordCount: result.data?.count || 0,
            validRecords: result.data?.count || 0,
            errors: [],
          } : f
        ));
        
        await loadDatabaseStats();
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadedFiles(prev => prev.map(f => 
        f.id === newFile.id ? { 
          ...f, 
          status: 'error',
          errors: [errorMessage]
        } : f
      ));
    }
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        processFile(file);
      } else {
        alert(`${file.name} is not a CSV file. Please upload only CSV files.`);
      }
    });
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleDownloadTemplate = (type: 'drivers' | 'orders' | 'routes') => {
    csvApi.downloadTemplate(type);
  };

  const handleInitializeSampleData = async () => {
    try {
      const result = await csvApi.initializeData();
      if (result.success) {
        await loadDatabaseStats();
        alert('Sample data initialized successfully!');
      } else {
        alert(`Failed to initialize data: ${result.message}`);
      }
    } catch (error) {
      console.error('Failed to initialize sample data:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize data';
      alert(`Failed to initialize data: ${errorMessage}`);
    }
  };

  const handleDeleteFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setValidationErrors([]);
    }
  };

  const handleViewFile = (file: CSVData) => {
    setSelectedFile(file);
    setActiveTab('details');
  };

  const getStatusColor = (status: CSVData['status']) => {
    switch (status) {
      case 'uploading':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: CSVData['status']) => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: CSVData['type']) => {
    switch (type) {
      case 'drivers':
        return <Users className="h-4 w-4" />;
      case 'orders':
        return <Package className="h-4 w-4" />;
      case 'routes':
        return <Route className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalStats = {
    files: uploadedFiles.length,
    completed: uploadedFiles.filter(f => f.status === 'completed').length,
    errors: uploadedFiles.filter(f => f.status === 'error').length,
    records: dbStats?.totals ? (dbStats.totals.drivers + dbStats.totals.routes + dbStats.totals.orders) : 0,
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CSV Upload</h1>
          <p className="text-muted-foreground">
            Upload and manage CSV data files for drivers, orders, and routes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleDownloadTemplate('drivers')}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          <Button variant="outline" onClick={handleInitializeSampleData}>
            <Database className="h-4 w-4 mr-2" />
            Initialize Sample Data
          </Button>
          <Button variant="outline" onClick={() => loadDatabaseStats()}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Refresh Stats
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                <p className="text-2xl font-bold">{totalStats.files}</p>
              </div>
              <FileSpreadsheet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.completed}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">{totalStats.errors}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold">{totalStats.records.toLocaleString()}</p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upload">Upload Files</TabsTrigger>
          <TabsTrigger value="history">Upload History</TabsTrigger>
          <TabsTrigger value="details" disabled={!selectedFile}>File Details</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {/* Upload Area */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload CSV Files
              </CardTitle>
              <CardDescription>
                Drag and drop CSV files or click to browse. Supported types: drivers, orders, routes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-muted-foreground/25 hover:border-primary hover:bg-primary/5'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-lg font-medium">
                      {dragActive ? 'Drop files here' : 'Drag and drop CSV files here'}
                    </p>
                    <p className="text-muted-foreground">
                      or click to browse your computer
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button asChild>
                        <span>Select Files</span>
                      </Button>
                    </Label>
                    <Input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supported formats: CSV files only • Max file size: 10MB per file
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CSV Format Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Guidelines</CardTitle>
              <CardDescription>
                Ensure your CSV files follow these formats for successful import
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold">Drivers CSV</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Required columns:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• name</li>
                      <li>• shift_hours</li>
                      <li>• past_week_hours (format: h1|h2|h3|h4|h5|h6|h7)</li>
                    </ul>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('drivers')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    <h3 className="font-semibold">Orders CSV</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Required columns:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• order_id</li>
                      <li>• value_rs (order value in rupees)</li>
                      <li>• route_id (route identifier)</li>
                      <li>• delivery_time (format: HH:MM)</li>
                    </ul>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('orders')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Route className="h-5 w-5 text-purple-600" />
                    <h3 className="font-semibold">Routes CSV</h3>
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">Required columns:</p>
                    <ul className="text-muted-foreground space-y-1">
                      <li>• route_id</li>
                      <li>• distance_km (distance in kilometers)</li>
                      <li>• traffic_level (Low/Medium/High)</li>
                      <li>• base_time_min (base time in minutes)</li>
                    </ul>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => handleDownloadTemplate('routes')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upload History
              </CardTitle>
              <CardDescription>
                View and manage previously uploaded CSV files
              </CardDescription>
            </CardHeader>
            <CardContent>
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-8">
                  <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No files uploaded yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by uploading your first CSV file
                  </p>
                  <Button onClick={() => setActiveTab('upload')}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Records</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {uploadedFiles.map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
                              {file.fileName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getTypeIcon(file.type)}
                              <span className="capitalize">{file.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(file.fileSize)}</TableCell>
                          <TableCell>
                            {file.recordCount > 0 ? (
                              <div>
                                <span className="font-medium">{file.validRecords}</span>
                                <span className="text-muted-foreground">/{file.recordCount}</span>
                              </div>
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(file.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(file.status)}
                                {file.status}
                              </div>
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {file.uploadDate.toLocaleDateString()} {file.uploadDate.toLocaleTimeString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewFile(file)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteFile(file.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          {selectedFile && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">File Details</h2>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>File Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">File Name</Label>
                        <p className="font-medium">{selectedFile.fileName}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">File Size</Label>
                        <p className="font-medium">{formatFileSize(selectedFile.fileSize)}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Type</Label>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(selectedFile.type)}
                          <span className="font-medium capitalize">{selectedFile.type}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                        <Badge className={getStatusColor(selectedFile.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(selectedFile.status)}
                            {selectedFile.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Processing Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Records:</span>
                        <span className="font-medium">{selectedFile.recordCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Valid Records:</span>
                        <span className="font-medium text-green-600">{selectedFile.validRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Invalid Records:</span>
                        <span className="font-medium text-red-600">{selectedFile.recordCount - selectedFile.validRecords}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate:</span>
                        <span className="font-medium">
                          {selectedFile.recordCount > 0 
                            ? Math.round((selectedFile.validRecords / selectedFile.recordCount) * 100)
                            : 0
                          }%
                        </span>
                      </div>
                    </div>
                    
                    {selectedFile.recordCount > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Processing Progress</Label>
                        <Progress 
                          value={selectedFile.recordCount > 0 ? (selectedFile.validRecords / selectedFile.recordCount) * 100 : 0} 
                          className="w-full"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {selectedFile.errors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      Processing Errors
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedFile.errors.map((error, index) => (
                        <Alert key={index} variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSVUpload;
