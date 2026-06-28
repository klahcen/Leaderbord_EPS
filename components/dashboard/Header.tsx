interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-text min-w-0">
        <h1 className="page-title">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}
