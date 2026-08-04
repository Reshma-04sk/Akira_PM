import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Image as ImageIcon, 
  File as FileIcon, 
  FileText as FileTextIcon, 
  Video as VideoIcon, 
  Music as MusicIcon, 
  UploadCloud, 
  ArrowDown, 
  Trash2,
  Loader2
} from "lucide-react";
import { attachmentsApi, Attachment } from "@/services/api/attachments.api";
import { Skeleton, toast } from "@/components/ui/feedback";

interface TaskAttachmentsProps {
  taskId: string;
}

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getFileIcon = (mimeType: string) => {
  if (!mimeType) return FileIcon;
  const type = mimeType.toLowerCase();
  if (type.startsWith("image/")) return ImageIcon;
  if (type.startsWith("video/")) return VideoIcon;
  if (type.startsWith("audio/")) return MusicIcon;
  if (type.includes("pdf") || type.includes("document") || type.includes("sheet")) return FileTextIcon;
  return FileIcon;
};

export const TaskAttachments: React.FC<TaskAttachmentsProps> = ({ taskId }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Query - attachments
  const { data: attachments, isLoading, error } = useQuery({
    queryKey: ["attachments", "list", taskId],
    queryFn: () => attachmentsApi.list(taskId).then((res) => res.data),
    enabled: !!taskId,
  });

  // Mutations - Upload Attachment
  const uploadMutation = useMutation({
    mutationFn: (file: File) => 
      attachmentsApi.upload(taskId, file, {
        onUploadProgress: (progressEvent: any) => {
          const total = progressEvent.total || 1;
          const current = progressEvent.loaded;
          const percentage = Math.round((current * 100) / total);
          setUploadProgress(percentage);
        }
      }),
    onMutate: () => {
      setUploadProgress(0);
    },
    onError: (err: any) => {
      setUploadProgress(null);
      toast.error("Upload failed", err.message);
    },
    onSuccess: () => {
      setUploadProgress(null);
      toast.success("File uploaded successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "list", taskId] });
    },
  });

  // Mutations - Delete Attachment
  const deleteMutation = useMutation({
    mutationFn: (id: string) => attachmentsApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["attachments", "list", taskId] });
      const previous = queryClient.getQueryData<Attachment[]>(["attachments", "list", taskId]);
      if (previous) {
        queryClient.setQueryData<Attachment[]>(
          ["attachments", "list", taskId],
          previous.filter((a) => a.id !== id)
        );
      }
      return { previous };
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["attachments", "list", taskId], context.previous);
      }
      toast.error("Failed to delete attachment", err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", "list", taskId] });
    },
  });

  const handleUploadFile = (file: File) => {
    // Size validation: 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File size limit exceeded", "Max file size allowed is 10MB");
      return;
    }
    uploadMutation.mutate(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUploadFile(e.target.files[0]);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      toast.info("Downloading file...");
      const res = await attachmentsApi.download(attachment.id);
      
      const blob = new Blob([res.data], { type: attachment.mime_type || "application/octet-stream" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", attachment.filename);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Download completed");
    } catch (err: any) {
      toast.error("Download failed", err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">File Attachments</h4>
        <span className="text-[10px] text-muted-foreground font-semibold">
          {(attachments || []).length} file{attachments?.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Drag & Drop Upload Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleUploadFile(e.dataTransfer.files[0]);
          }
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[90px] select-none ${
          isDragging 
            ? "border-primary bg-primary/5 animate-pulse" 
            : "border-border/80 hover:border-primary/50 bg-card/15"
        }`}
        aria-label="Upload files dropzone"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={uploadMutation.isPending}
        />
        
        {uploadMutation.isPending ? (
          <div className="flex flex-col items-center gap-1">
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
            <span className="text-[10px] font-bold text-primary">
              Uploading {uploadProgress !== null ? `${uploadProgress}%` : ""}
            </span>
          </div>
        ) : (
          <>
            <UploadCloud className="h-5 w-5 text-muted-foreground" />
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-foreground">Click or Drag File to Upload</p>
              <p className="text-[9px] text-muted-foreground">Supports any file type up to 10MB</p>
            </div>
          </>
        )}
      </div>

      {/* Attachments List */}
      {isLoading ? (
        <div className="space-y-2 pt-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : error ? (
        <p className="text-[10px] text-destructive font-semibold">Failed to load attachments</p>
      ) : (attachments || []).length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic text-center py-4">No attachments uploaded yet.</p>
      ) : (
        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
          {(attachments || []).map((a) => {
            const Icon = getFileIcon(a.mime_type);
            const isDeleting = deleteMutation.isPending && deleteMutation.variables === a.id;

            return (
              <div
                key={a.id}
                className="flex items-center justify-between border border-border/60 bg-card p-2 rounded-lg text-xs leading-relaxed group"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="p-1.5 bg-muted/40 border border-border/25 rounded-md shrink-0">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <p className="font-bold text-foreground truncate select-all">{a.filename}</p>
                    <p className="text-[9px] text-muted-foreground font-medium">{formatBytes(a.file_size)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleDownload(a)}
                    disabled={isDeleting}
                    className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                    aria-label="Download attachment"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${a.filename}?`)) {
                        deleteMutation.mutate(a.id);
                      }
                    }}
                    disabled={isDeleting}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-md"
                    aria-label="Delete attachment"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
