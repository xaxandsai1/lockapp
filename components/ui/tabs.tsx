function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        'bg-muted text-muted-foreground flex flex-col w-full items-stretch gap-2 rounded-lg p-0',
        'md:flex-row md:w-fit md:items-center md:gap-1 md:p-[3px]',
        className,
      )}
      {...props}
    />
  )
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        'flex w-full items-center justify-start rounded-md border border-white/5 px-3 py-2 text-sm font-medium',
        'h-auto min-h-9 whitespace-normal',  
        'md:w-auto md:justify-center md:whitespace-nowrap md:shrink-0',
        'text-foreground dark:text-muted-foreground transition-[color,box-shadow]',
        "data-[state=active]:bg-background dark:data-[state=active]:text-foreground data-[state=active]:shadow-sm",
        'focus-visible:outline-1 focus-visible:outline-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
        'disabled:pointer-events-none disabled:opacity-50',
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  )
}
