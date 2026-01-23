import { useState } from 'react';
import { useDocuments } from '@/hooks/queries/useDocumentQueries';
import { PersonalDocumentCard } from '@/components/documents/PersonalDocumentCard';
import { UploadDocumentDialog } from '@/components/documents/UploadDocumentDialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, FolderOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function PatientDocuments() {
  const { data, isLoading, error } = useDocuments();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Safely default to empty array if data isn't structured as expected
  const documents = data?.documents || [];

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.file_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || doc.category === activeTab;
    return matchesSearch && matchesTab;
  });

  const categories = ['all', 'insurance', 'identity', 'bill', 'prescription', 'other'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground p-8">
        <FolderOpen className="h-12 w-12 text-destructive/50" />
        <p>Failed to load documents. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8 fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Documents</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal files, insurance cards, and IDs securely.
          </p>
        </div>
        <Button onClick={() => setIsUploadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 flex flex-wrap h-auto gap-2 bg-transparent justify-start p-0">
          {categories.map((cat) => (
            <TabsTrigger 
              key={cat} 
              value={cat}
              className="px-4 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border bg-background capitalize"
            >
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-lg bg-muted/20">
              <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No documents found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                {searchQuery 
                  ? "Try adjusting your search terms" 
                  : `You don't have any ${activeTab === 'all' ? '' : activeTab} documents yet.`}
              </p>
              {!searchQuery && activeTab === 'all' && (
                 <Button variant="link" onClick={() => setIsUploadOpen(true)} className="mt-4">
                  Upload your first document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map((doc) => (
                <PersonalDocumentCard key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <UploadDocumentDialog 
        isOpen={isUploadOpen} 
        onClose={() => setIsUploadOpen(false)} 
      />
    </div>
  );
}
