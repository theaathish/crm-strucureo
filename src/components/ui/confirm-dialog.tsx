import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog"
import { Button } from "./button"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void
  loading?: boolean
  variant?: "destructive" | "default"
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, loading, variant = "destructive" }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("size-10 rounded-full flex items-center justify-center shrink-0", variant === "destructive" ? "bg-red-100 dark:bg-red-900/20" : "bg-muted")}>
              <AlertTriangle className={cn("size-5", variant === "destructive" ? "text-red-600 dark:text-red-400" : "text-muted-foreground")} />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button variant={variant === "destructive" ? "destructive" : "default"} onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
