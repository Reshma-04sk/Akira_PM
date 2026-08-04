import React from "react";
import { 
  UserPlus, 
  FileText, 
  MessageSquare, 
  Paperclip, 
  AtSign, 
  Mail, 
  Shield, 
  Bell 
} from "lucide-react";
import { Notification } from "@/services/api/notifications.api";
import { formatDistanceToNow } from "@/utils/date";
import { useNavigate } from "react-router-dom";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkRead 
}) => {
  const navigate = useNavigate();
  const { id, type, title, message, is_read, created_at } = notification;

  const getCategoryDetails = () => {
    switch (type) {
      case "task_assigned":
        return {
          icon: UserPlus,
          iconClass: "text-blue-500 bg-blue-500/10 dark:text-blue-400 dark:bg-blue-950/30",
          link: "/tasks",
        };
      case "task_updated":
        return {
          icon: FileText,
          iconClass: "text-amber-500 bg-amber-500/10 dark:text-amber-400 dark:bg-amber-950/30",
          link: "/tasks",
        };
      case "comment_added":
        return {
          icon: MessageSquare,
          iconClass: "text-emerald-500 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-950/30",
          link: "/tasks",
        };
      case "attachment_added":
        return {
          icon: Paperclip,
          iconClass: "text-purple-500 bg-purple-500/10 dark:text-purple-400 dark:bg-purple-950/30",
          link: "/tasks",
        };
      case "mention":
        return {
          icon: AtSign,
          iconClass: "text-indigo-500 bg-indigo-500/10 dark:text-indigo-400 dark:bg-indigo-950/30",
          link: "/tasks",
        };
      case "project_invite":
        return {
          icon: Mail,
          iconClass: "text-cyan-500 bg-cyan-500/10 dark:text-cyan-400 dark:bg-cyan-950/30",
          link: "/projects",
        };
      case "role_changed":
        return {
          icon: Shield,
          iconClass: "text-pink-500 bg-pink-500/10 dark:text-pink-400 dark:bg-pink-950/30",
          link: "/projects",
        };
      default:
        return {
          icon: Bell,
          iconClass: "text-muted-foreground bg-muted",
          link: "/dashboard",
        };
    }
  };

  const { icon: Icon, iconClass, link } = getCategoryDetails();

  const handleClick = () => {
    if (!is_read) {
      onMarkRead(id);
    }
    navigate(link);
  };

  return (
    <div 
      onClick={handleClick}
      className={`flex items-start gap-3 p-3.5 border-b border-border/40 hover:bg-muted/30 cursor-pointer select-none transition-colors group relative ${
        !is_read ? "bg-primary/5 dark:bg-primary/5 border-l-2 border-l-primary" : "border-l-2 border-l-transparent"
      }`}
    >
      <div className={`p-2 rounded-lg shrink-0 ${iconClass} transition-colors group-hover:scale-105 duration-200`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-grow min-w-0 space-y-0.5 pr-2">
        <div className="flex items-center justify-between gap-2">
          <p className={`text-xs font-semibold leading-none truncate ${
            !is_read ? "text-foreground" : "text-muted-foreground"
          }`}>
            {title}
          </p>
          <span className="text-[9px] text-muted-foreground shrink-0 select-none">
            {formatDistanceToNow(created_at)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
          {message}
        </p>
      </div>
      {!is_read && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
      )}
    </div>
  );
};
