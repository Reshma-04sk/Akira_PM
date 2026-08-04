import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Edit3, Trash2, X, Check, User } from "lucide-react";
import { commentsApi, Comment } from "@/services/api/comments.api";
import { usersApi } from "@/services/api/users.api";
import { projectMembersApi, ProjectMember } from "@/services/api/project-members.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton, toast } from "@/components/ui/feedback";

interface TaskCommentsProps {
  taskId: string;
  projectId: string;
}

export const getRelativeTimeString = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  if (diffSecs < 60) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export const TaskComments: React.FC<TaskCommentsProps> = ({ taskId, projectId }) => {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  // Get active session user
  const { data: currentUser } = useQuery({
    queryKey: ["users", "me"],
    queryFn: () => usersApi.getMe().then((res) => res.data),
  });

  // Get project members for commenter profiling
  const { data: membersResponse } = useQuery({
    queryKey: ["project-members", "list", projectId],
    queryFn: () => projectMembersApi.list(projectId).then((res) => res.data),
    enabled: !!projectId,
  });

  const members: ProjectMember[] = Array.isArray(membersResponse)
    ? membersResponse
    : ((membersResponse as any)?.items ? (membersResponse as any).items : []);

  // Query - comments
  const { data: commentsResponse, isLoading, error } = useQuery({
    queryKey: ["comments", "list", taskId],
    queryFn: () => commentsApi.list(taskId).then((res) => res.data),
    enabled: !!taskId,
  });

  const comments: Comment[] = Array.isArray(commentsResponse)
    ? commentsResponse
    : ((commentsResponse as any)?.items ? (commentsResponse as any).items : []);

  const getCommenterProfile = (userId: string) => {
    const member = members.find((m) => m.user_id === userId);
    const fullName = member?.user_name || "System User";
    const email = member?.user_email || "";
    
    // Resolve avatar initials
    const initials = fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return { fullName, email, initials };
  };

  // Helper to handle comments optimistic updates
  const applyCommentsOptimistic = async (updater: (oldData: any) => any) => {
    await queryClient.cancelQueries({ queryKey: ["comments", "list", taskId] });
    const previous = queryClient.getQueryData(["comments", "list", taskId]);
    queryClient.setQueryData(["comments", "list", taskId], updater);
    return { previous };
  };

  // Mutations - Create Comment
  const createMutation = useMutation({
    mutationFn: (payload: { task_id: string; content: string }) => commentsApi.create(payload),
    onMutate: async (newPayload) => {
      const tempId = `temp-${Date.now()}`;
      const tempComment: Comment = {
        id: tempId,
        task_id: taskId,
        user_id: currentUser?.id || "me",
        content: newPayload.content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return applyCommentsOptimistic((oldData: any) => ({
        ...oldData,
        items: [...(oldData?.items || []), tempComment],
        total: (oldData?.total || 0) + 1,
      }));
    },
    onError: (err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", "list", taskId], context.previous);
      }
      toast.error("Failed to post comment", err.message);
    },
    onSuccess: () => {
      setCommentText("");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "list", taskId] });
    },
  });

  // Mutations - Update Comment
  const updateMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      commentsApi.update(id, { content }),
    onMutate: async ({ id, content }) => {
      return applyCommentsOptimistic((oldData: any) => ({
        ...oldData,
        items: (oldData?.items || []).map((c: Comment) =>
          c.id === id ? { ...c, content, updated_at: new Date().toISOString() } : c
        ),
      }));
    },
    onError: (err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", "list", taskId], context.previous);
      }
      toast.error("Failed to edit comment", err.message);
    },
    onSuccess: () => {
      setEditingCommentId(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "list", taskId] });
    },
  });

  // Mutations - Delete Comment
  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentsApi.delete(id),
    onMutate: async (id) => {
      return applyCommentsOptimistic((oldData: any) => ({
        ...oldData,
        items: (oldData?.items || []).filter((c: Comment) => c.id !== id),
        total: Math.max(0, (oldData?.total || 1) - 1),
      }));
    },
    onError: (err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["comments", "list", taskId], context.previous);
      }
      toast.error("Failed to delete comment", err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "list", taskId] });
    },
  });

  const handlePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    createMutation.mutate({
      task_id: taskId,
      content: commentText.trim(),
    });
  };

  const handleSaveEdit = (id: string) => {
    if (!editingText.trim()) return;
    updateMutation.mutate({ id, content: editingText.trim() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Comments Log</h4>
        <span className="text-[10px] text-muted-foreground font-semibold">
          {comments.length} comment{comments.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Input section */}
      <form onSubmit={handlePost} className="flex gap-2">
        <Input
          placeholder="Write a comment..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={createMutation.isPending}
          className="h-8 text-xs bg-background/50 flex-1"
        />
        <Button
          size="sm"
          type="submit"
          aria-label="Post comment"
          disabled={!commentText.trim() || createMutation.isPending}
          className="h-8 px-3"
        >
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>

      {/* List section */}
      {isLoading ? (
        <div className="space-y-3 pt-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error ? (
        <p className="text-[10px] text-destructive font-semibold">Failed to load comments</p>
      ) : comments.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic text-center py-4">No comments posted yet.</p>
      ) : (
        <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
          {comments.map((comment) => {
            const profile = getCommenterProfile(comment.user_id);
            const isEditing = editingCommentId === comment.id;
            const isOwn = currentUser && comment.user_id === currentUser.id;

            return (
              <div key={comment.id} className="flex gap-3 text-xs leading-relaxed items-start group">
                {/* Avatar */}
                <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 select-none">
                  {profile.initials ? (
                    <span className="text-[9px] font-bold text-primary">{profile.initials}</span>
                  ) : (
                    <User className="h-3 w-3 text-primary" />
                  )}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  {/* Metadata header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-bold text-foreground truncate">{profile.fullName}</span>
                      <span className="text-[9px] text-muted-foreground shrink-0">
                        {getRelativeTimeString(comment.created_at)}
                      </span>
                    </div>

                    {isOwn && !isEditing && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setEditingCommentId(comment.id);
                            setEditingText(comment.content);
                          }}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                          aria-label="Edit comment"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete this comment?")) {
                              deleteMutation.mutate(comment.id);
                            }
                          }}
                          className="text-muted-foreground hover:text-destructive p-0.5"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comment Body */}
                  {isEditing ? (
                    <div className="flex gap-2 items-center mt-1">
                      <Input
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="h-7 text-xs bg-background"
                      />
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        className="text-emerald-600 hover:text-emerald-500 p-1"
                        aria-label="Save changes"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCommentId(null)}
                        className="text-muted-foreground hover:text-foreground p-1"
                        aria-label="Cancel editing"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-[11px] whitespace-pre-wrap break-words pr-2">
                      {comment.content}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
