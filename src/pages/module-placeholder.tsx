interface ModulePlaceholderProps {
  title: string
  description: string
}

export function ModulePlaceholder({
  title,
  description,
}: ModulePlaceholderProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {title}
      </h1>

      <p className="mt-1 text-muted-foreground">
        {description}
      </p>

      <div className="mt-6 rounded-lg border bg-background p-8 text-center">
        <p className="text-muted-foreground">
          This module will be built next.
        </p>
      </div>
    </div>
  )
}