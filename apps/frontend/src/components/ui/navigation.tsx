import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

// Tabs
interface TabItem {
  id: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className,
}) => {
  return (
    <div className={cn("flex border-b border-border bg-transparent select-none", className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "px-4 py-2 text-xs font-semibold -mb-px border-b-2 transition-all focus:outline-none focus-visible:text-foreground",
              isActive
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

// Pagination
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) => {
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav
      className={cn("flex items-center gap-1 text-xs select-none", className)}
      aria-label="Pagination Navigation"
    >
      <button
        onClick={() => onPageChange(1)}
        disabled={isFirst}
        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to first page"
      >
        <ChevronsLeft className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to previous page"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      <span className="px-3 py-1 font-semibold text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to next page"
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={isLast}
        className="p-1.5 rounded-lg border border-border bg-background hover:bg-accent disabled:opacity-40 disabled:pointer-events-none transition-colors"
        aria-label="Go to last page"
      >
        <ChevronsRight className="h-3.5 w-3.5" />
      </button>
    </nav>
  );
};

// Breadcrumb Wrapper
export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface BreadcrumbWrapperProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbWrapper: React.FC<BreadcrumbWrapperProps> = ({
  items,
  className,
}) => {
  return (
    <nav className={cn("flex items-center gap-2 text-xs font-semibold text-muted-foreground", className)} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            {isLast || !item.href ? (
              <span className={cn(isLast ? "text-foreground font-bold" : "")}>{item.label}</span>
            ) : (
              <a href={item.href} className="hover:text-foreground transition-colors">
                {item.label}
              </a>
            )}
            {!isLast && <span className="text-muted-foreground/60">/</span>}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
