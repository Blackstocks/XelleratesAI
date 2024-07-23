import React from "react";
import useSkin from "@/hooks/useSkin";

const CardDebt = ({
  children,
  title,
  subtitle,
  headerslot,
  className = "custom-class bg-white",
  bodyClass = "p-6",
  noborder,
  titleClass = "custom-class",
  onClose,
}) => {
  const [skin] = useSkin();

  return (
    <div
      className={`
        card rounded-md dark:bg-slate-800 ${
          skin === "bordered"
            ? "border border-slate-200 dark:border-slate-700"
            : "shadow-base"
        }
        ${className}
        flex flex-col justify-between items-center
      `}
    >
      {(title || subtitle || onClose) && (
        <header className={`card-header ${noborder ? "no-border" : ""} w-full flex justify-between items-center`}>
          <div className="flex flex-col items-center">
            {title && <div className={`card-title ${titleClass} text-center`}>{title}</div>}
            {subtitle && <div className="card-subtitle text-center">{subtitle}</div>}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 011.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95a1 1 0 01-1.414-1.414l4.95-4.95-4.95-4.95A1 1 0 015.05 3.636L10 8.586z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </header>
      )}
      <main className={`card-body ${bodyClass} flex flex-col items-center justify-between text-center flex-1`}>{children}</main>
    </div>
  );
};

export default CardDebt;
