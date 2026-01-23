import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
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
import { Button } from '@/components/ui/button';
import { Loader2, Upload } from 'lucide-react';
import { useUploadDocument } from '@/hooks/queries/useDocumentQueries';
import { DocumentCategory } from '@/types/document';

const uploadSchema = z.object({
  file: z.instanceof(File, { message: 'A file is required' }),
  category: z.enum(['insurance', 'identity', 'bill', 'prescription', 'other'] as const, {
    required_error: 'Please select a category',
  }),
  filename: z.string().min(1, 'Filename is required'),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

interface UploadDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDocumentDialog({ isOpen, onClose }: UploadDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: uploadDocument, isPending } = useUploadDocument();

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      category: 'other',
      filename: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      form.setValue('file', selectedFile);
      if (!form.getValues('filename')) {
        form.setValue('filename', selectedFile.name);
      }
    }
  };

  const onSubmit = (data: UploadFormValues) => {
    uploadDocument(
      {
        file: data.file,
        filename: data.filename,
        category: data.category,
        content_type: data.file.type,
      },
      {
        onSuccess: () => {
          form.reset();
          setFile(null);
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    setFile(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Upload generic files like insurance cards, bills, or ID proofs.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="file"
              render={({ field: { value, onChange, ...field } }) => (
                <FormItem>
                  <FormLabel>File</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                       <Input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                          handleFileChange(e);
                          // onChange is handled in handleFileChange via setValue
                        }}
                        {...field}
                        value={undefined} // File input value should not be controlled by react state directly usually
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filename"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>File Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Insurance Card 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="identity">Identity Proof</SelectItem>
                      <SelectItem value="bill">Medical Bill</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Upload
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
