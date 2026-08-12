import React, { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { searchApi } from "@/services/api/search.api";
import { 
  FolderGit2, 
  CheckSquare, 
  User, 
  History, 
  Search, 
  X,
  CornerDownLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RecentItem {
  id: string;
  type: "project" | "task" | "user";
  name: string;
  projectId?: string;
  email?: string;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<RecentItem[]>([]);

  // Debounce query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  // Load recent searches from local storage
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem("akira_recent_searches");
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch {
          setRecentSearches([]);
        }
      }
      // Focus input on mount
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setDebouncedQuery("");
      setActiveIndex(0);
    }
  }, [isOpen]);

  // Query search results
  const { data: searchResponse, isLoading } = useQuery({
    queryKey: ["search", debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery).then((res) => res.data),
    enabled: isOpen && debouncedQuery.trim().length > 0,
  });

  // Save selected item to recent searches
  const saveToRecents = (item: RecentItem) => {
    const filtered = recentSearches.filter(
      (r) => !(r.id === item.id && r.type === item.type)
    );
    const updated = [item, ...filtered].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("akira_recent_searches", JSON.stringify(updated));
  };

  const handleSelectItem = (item: RecentItem) => {
    saveToRecents(item);
    onClose();
    if (item.type === "project") {
      navigate(`/projects/${item.id}`);
    } else if (item.type === "task") {
      navigate(`/tasks?project_id=${item.projectId}&task_id=${item.id}`);
    } else if (item.type === "user") {
      navigate("/tasks"); // user details can fall back to task filters or lists
    }
  };

  // Compile active candidates list for keyboard navigation
  const candidates = useMemo(() => {
    if (debouncedQuery.trim().length === 0) {
      return recentSearches;
    }
    
    if (!searchResponse) return [];

    const list: RecentItem[] = [];
    
    // Add projects
    if (searchResponse.projects) {
      searchResponse.projects.forEach((p) => {
        list.push({
          id: p.id,
          type: "project",
          name: p.name,
        });
      });
    }

    // Add tasks
    if (searchResponse.tasks) {
      searchResponse.tasks.forEach((t) => {
        list.push({
          id: t.id,
          type: "task",
          name: t.title,
          projectId: t.projectId || (t as any).project_id,
        });
      });
    }

    // Add users
    if (searchResponse.users) {
      searchResponse.users.forEach((u) => {
        list.push({
          id: u.id,
          type: "user",
          name: u.full_name || u.email,
          email: u.email,
        });
      });
    }

    return list;
  }, [searchResponse, debouncedQuery, recentSearches]);

  // Keep index within bounds on candidate length change
  useEffect(() => {
    setActiveIndex(0);
  }, [candidates.length]);

  // Ensure active element is scrolled into view
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector(".search-item-active");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [activeIndex]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (candidates.length > 0 ? (prev + 1) % candidates.length : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => (candidates.length > 0 ? (prev - 1 + candidates.length) % candidates.length : 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (candidates.length > 0 && candidates[activeIndex]) {
          handleSelectItem(candidates[activeIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, candidates, activeIndex]);

  // Helper to highlight matching query text
  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return <span>{text}</span>;
    const regex = new RegExp(`(${search.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, i) => 
          regex.test(part) ? (
            <mark key={i} className="bg-primary/25 text-foreground font-semibold rounded px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  // Group candidates for rendering
  const groupedResult = useMemo(() => {
    const groups = {
      recents: [] as RecentItem[],
      projects: [] as RecentItem[],
      tasks: [] as RecentItem[],
      users: [] as RecentItem[],
    };

    candidates.forEach((item, index) => {
      const itemWithIndex = { ...item, originalIndex: index };
      if (debouncedQuery.trim().length === 0) {
        groups.recents.push(itemWithIndex);
      } else {
        if (item.type === "project") groups.projects.push(itemWithIndex);
        if (item.type === "task") groups.tasks.push(itemWithIndex);
        if (item.type === "user") groups.users.push(itemWithIndex);
      }
    });

    return groups;
  }, [candidates, debouncedQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 select-none">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-background/50 backdrop-blur-sm bg-black/40 transition-opacity"
      />

      {/* Modal Dialog Body */}
      <div className="relative w-full max-w-xl flex flex-col bg-popover text-popover-foreground border border-border shadow-2xl rounded-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <Search className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search tasks, projects, or users..."
            className="flex-grow bg-transparent text-sm text-foreground border-none placeholder-muted-foreground outline-none focus:ring-0 focus:outline-none"
          />
          {query.length > 0 && (
            <button 
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="text-[10px] text-muted-foreground font-semibold px-2 py-0.5 bg-muted border border-border rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Search Results List View */}
        <div 
          ref={scrollContainerRef}
          className="flex-grow overflow-y-auto max-h-[320px] p-2 min-h-[100px]"
        >
          {isLoading ? (
            <div className="flex items-center justify-center p-8 space-x-2 text-muted-foreground select-none">
              <span className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              <span className="text-xs">Searching database...</span>
            </div>
          ) : candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center select-none text-muted-foreground">
              {debouncedQuery.trim() ? (
                <>
                  <p className="text-xs font-semibold text-foreground">No matches found</p>
                  <p className="text-[10px] mt-0.5">No projects, tasks, or users match "{debouncedQuery}"</p>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-foreground">No recent searches</p>
                  <p className="text-[10px] mt-0.5">Start typing to search tasks, projects, and users.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Recent Searches */}
              {groupedResult.recents.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <History className="h-3.5 w-3.5" />
                    <span>Recent Searches</span>
                  </div>
                  {groupedResult.recents.map((item: any) => (
                    <SearchResultItem
                      key={`${item.type}-${item.id}`}
                      item={item}
                      isActive={activeIndex === item.originalIndex}
                      onClick={() => handleSelectItem(item)}
                      displayNode={<span>{item.name}</span>}
                    />
                  ))}
                </div>
              )}

              {/* Projects Group */}
              {groupedResult.projects.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    <span>Projects</span>
                  </div>
                  {groupedResult.projects.map((item: any) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isActive={activeIndex === item.originalIndex}
                      onClick={() => handleSelectItem(item)}
                      displayNode={highlightText(item.name, debouncedQuery)}
                    />
                  ))}
                </div>
              )}

              {/* Tasks Group */}
              {groupedResult.tasks.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Tasks</span>
                  </div>
                  {groupedResult.tasks.map((item: any) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isActive={activeIndex === item.originalIndex}
                      onClick={() => handleSelectItem(item)}
                      displayNode={highlightText(item.name, debouncedQuery)}
                    />
                  ))}
                </div>
              )}

              {/* Users Group */}
              {groupedResult.users.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
                    <User className="h-3.5 w-3.5" />
                    <span>Users</span>
                  </div>
                  {groupedResult.users.map((item: any) => (
                    <SearchResultItem
                      key={item.id}
                      item={item}
                      isActive={activeIndex === item.originalIndex}
                      onClick={() => handleSelectItem(item)}
                      displayNode={
                        <div className="flex flex-col">
                          <span>{highlightText(item.name, debouncedQuery)}</span>
                          {item.email && item.email !== item.name && (
                            <span className="text-[9px] text-muted-foreground leading-none mt-0.5">
                              {highlightText(item.email, debouncedQuery)}
                            </span>
                          )}
                        </div>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-border bg-card/25 text-[10px] text-muted-foreground shrink-0 select-none">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded">↑↓</kbd> to navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-muted border border-border rounded flex items-center justify-center h-4"><CornerDownLeft className="h-2.5 w-2.5" /></kbd> to select
          </span>
        </div>

      </div>
    </div>
  );
};

/* Internal search result list item component */
interface SearchResultItemProps {
  item: RecentItem;
  isActive: boolean;
  onClick: () => void;
  displayNode: React.ReactNode;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({ 
  item, 
  isActive, 
  onClick, 
  displayNode 
}) => {
  const getIcon = () => {
    switch (item.type) {
      case "project":
        return FolderGit2;
      case "task":
        return CheckSquare;
      case "user":
        return User;
      default:
        return Search;
    }
  };

  const Icon = getIcon();

  return (
    <div
      onClick={onClick}
      className={`search-item flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all ${
        isActive 
          ? "search-item-active bg-[#ff4d2e]/14 text-[#ff4d2e] border border-[#ff4d2e]/30" 
          : "hover:bg-muted/40 text-foreground"
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#ff4d2e]" : "text-muted-foreground"}`} />
      <div className="flex-grow text-xs truncate leading-normal">
        {displayNode}
      </div>
      {isActive && (
        <span className="text-[9px] px-1.5 py-0.5 bg-[#ff4d2e] text-[#1a0a06] font-mono rounded font-bold uppercase select-none">
          Select
        </span>
      )}
    </div>
  );
};
