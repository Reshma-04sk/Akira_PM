import React from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground select-none" aria-label="Breadcrumb">
      <Link
        to="/"
        className="hover:text-foreground transition-colors"
      >
        Akira PM
      </Link>
      {pathnames.length > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;
        const displayLabel = value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            {isLast ? (
              <span className="text-foreground font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                {displayLabel}
              </span>
            ) : (
              <>
                <Link
                  to={to}
                  className="hover:text-foreground transition-colors truncate max-w-[120px]"
                >
                  {displayLabel}
                </Link>
                <ChevronRight className="h-3 w-3 shrink-0" />
              </>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
