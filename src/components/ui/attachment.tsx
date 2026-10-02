import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const attachmentVariants = cva(
  "group relative flex gap-3 rounded-lg border bg-card text-card-foreground transition-colors",
  {
    variants: {
      orientation: {
        horizontal: "flex-row items-center p-3",
        vertical: "flex-col p-4",
      },
      state: {
        default: "hover:bg-accent/50",
        uploading: "opacity-75",
        error: "border-destructive",
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      state: "default",
    },
  }
)

const attachmentMediaVariants = cva("flex-shrink-0 overflow-hidden", {
  variants: {
    variant: {
      image: "rounded-md bg-muted",
      icon: "flex items-center justify-center rounded-md bg-muted text-muted-foreground",
    },
    orientation: {
      horizontal: "h-12 w-12",
      vertical: "h-40 w-full",
    },
  },
  defaultVariants: {
    variant: "icon",
    orientation: "horizontal",
  },
})

interface AttachmentContextValue {
  orientation: "horizontal" | "vertical"
}

const AttachmentContext = React.createContext<AttachmentContextValue>({
  orientation: "horizontal",
})

interface AttachmentGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const AttachmentGroup = React.forwardRef<HTMLDivElement, AttachmentGroupProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-3", className)} {...props} />
  )
)
AttachmentGroup.displayName = "AttachmentGroup"

interface AttachmentProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof attachmentVariants> {}

const Attachment = React.forwardRef<HTMLDivElement, AttachmentProps>(
  ({ className, orientation = "horizontal", state, ...props }, ref) => (
    <AttachmentContext.Provider value={{ orientation }}>
      <div
        ref={ref}
        className={cn(attachmentVariants({ orientation, state }), className)}
        {...props}
      />
    </AttachmentContext.Provider>
  )
)
Attachment.displayName = "Attachment"

interface AttachmentMediaProps
  extends React.HTMLAttributes<HTMLDivElement>,
    Omit<VariantProps<typeof attachmentMediaVariants>, "orientation"> {}

const AttachmentMedia = React.forwardRef<HTMLDivElement, AttachmentMediaProps>(
  ({ className, variant, children, ...props }, ref) => {
    const { orientation } = React.useContext(AttachmentContext)
    return (
      <div
        ref={ref}
        className={cn(attachmentMediaVariants({ variant, orientation }), className)}
        {...props}
      >
        {variant === "image" ? (
          children
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            {children}
          </div>
        )}
      </div>
    )
  }
)
AttachmentMedia.displayName = "AttachmentMedia"

interface AttachmentContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const AttachmentContent = React.forwardRef<HTMLDivElement, AttachmentContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex min-w-0 flex-1 flex-col justify-center gap-0.5", className)}
      {...props}
    />
  )
)
AttachmentContent.displayName = "AttachmentContent"

interface AttachmentTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AttachmentTitle = React.forwardRef<HTMLParagraphElement, AttachmentTitleProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("truncate text-sm font-medium leading-none", className)}
      {...props}
    />
  )
)
AttachmentTitle.displayName = "AttachmentTitle"

interface AttachmentDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}

const AttachmentDescription = React.forwardRef<
  HTMLParagraphElement,
  AttachmentDescriptionProps
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("truncate text-sm text-muted-foreground", className)}
    {...props}
  />
))
AttachmentDescription.displayName = "AttachmentDescription"

interface AttachmentActionsProps extends React.HTMLAttributes<HTMLDivElement> {}

const AttachmentActions = React.forwardRef<HTMLDivElement, AttachmentActionsProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-shrink-0 items-center gap-1", className)}
      {...props}
    />
  )
)
AttachmentActions.displayName = "AttachmentActions"

interface AttachmentActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const AttachmentAction = React.forwardRef<HTMLButtonElement, AttachmentActionProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
)
AttachmentAction.displayName = "AttachmentAction"

export {
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
}
