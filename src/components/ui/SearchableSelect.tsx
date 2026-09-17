import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/utils';

export interface SearchableOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface SearchableSelectBaseProps {
  options: SearchableOption[];
  placeholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export interface SearchableSelectProps extends SearchableSelectBaseProps {
  multiple?: false;
  value: string;
  onChange: (value: string) => void;
}

export interface SearchableSelectMultiProps extends SearchableSelectBaseProps {
  multiple: true;
  value: string[];
  onChange: (value: string[]) => void;
}

export type SearchableSelectUnionProps = SearchableSelectProps | SearchableSelectMultiProps;

export function SearchableSelect(props: SearchableSelectUnionProps) {
  const {
    options,
    multiple = false,
    placeholder = 'Search and select...',
    emptyText = 'No matching options found',
    className,
    disabled,
  } = props;
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo<string[]>(
    () => (multiple ? (props.value as string[]) : props.value ? [props.value as string] : []),
    [multiple, props.value],
  );
  const selectedOption = options.find((o) => o.value === (props.value as string));

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.label.toLowerCase().includes(q) ||
        (o.sublabel?.toLowerCase().includes(q) ?? false)
    );
  }, [options, query]);

  const handleSelect = (opt: SearchableOption) => {
    if (multiple) {
      const next = selectedValues.includes(opt.value)
        ? selectedValues.filter((v) => v !== opt.value)
        : [...selectedValues, opt.value];
      (props.onChange as (value: string[]) => void)(next);
      setQuery('');
    } else {
      (props.onChange as (value: string) => void)(opt.value);
      setQuery('');
      setOpen(false);
    }
  };

  const handleClear = () => {
    if (multiple) {
      (props.onChange as (value: string[]) => void)([]);
    } else {
      (props.onChange as (value: string) => void)('');
    }
    setQuery('');
  };

  const handleRemove = (opt: SearchableOption) => {
    if (multiple) {
      (props.onChange as (value: string[]) => void)(selectedValues.filter((v) => v !== opt.value));
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {multiple ? (
        <div className="relative">
          <div
            onClick={() => !disabled && setOpen(true)}
            className={cn(
              'flex w-full flex-wrap items-center gap-1.5 rounded-2xl border border-slate-100 bg-slate-50 p-2 pr-10 transition-all focus-within:border-blue-500 dark:border-slate-700 dark:bg-slate-800',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          >
            {selectedValues.map((val) => {
              const opt = options.find((o) => o.value === val);
              if (!opt) return null;
              return (
                <span
                  key={opt.value}
                  className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                >
                  {opt.label}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(opt);
                      }}
                      className="rounded-full text-blue-400 transition-colors hover:text-blue-700 dark:hover:text-blue-200"
                      title={`Remove ${opt.label}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </span>
              );
            })}
            <input
              type="text"
              role="combobox"
              autoComplete="off"
              disabled={disabled}
              value={open ? query : ''}
              placeholder={selectedValues.length === 0 ? placeholder : 'Add more...'}
              onFocus={() => setOpen(true)}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              className="min-w-[140px] flex-1 bg-transparent px-2 py-1 text-sm font-medium outline-none placeholder:text-slate-400 dark:text-white"
            />
            {selectedValues.length > 0 && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-rose-600"
                title="Clear all"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {selectedValues.length === 0 && (
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            role="combobox"
            autoComplete="off"
            value={open ? query : selectedOption?.label ?? ''}
            disabled={disabled}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            className={cn(
              'w-full rounded-2xl border border-slate-100 bg-slate-50 py-3.5 pl-11 pr-10 text-sm font-medium outline-none transition-all focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white',
              disabled && 'opacity-60 cursor-not-allowed'
            )}
          />
          {selectedOption && !disabled ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          )}
        </div>
      )}

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
          {filtered.length === 0 ? (
            <p className="px-4 py-3 text-sm font-medium text-slate-400">{emptyText}</p>
          ) : (
            filtered.map((opt) => {
              const active = multiple
                ? selectedValues.includes(opt.value)
                : opt.value === (props.value as string);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-colors',
                    active
                      ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/50'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">{opt.label}</span>
                    {opt.sublabel ? (
                      <span className="block truncate text-xs text-slate-400">
                        {opt.sublabel}
                      </span>
                    ) : null}
                  </span>
                  {active ? <Check className="h-4 w-4 shrink-0" /> : null}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}