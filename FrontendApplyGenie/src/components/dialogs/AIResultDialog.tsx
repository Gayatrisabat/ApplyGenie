import { motion } from 'framer-motion'
import { Copy, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from 'sonner'

interface AIResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'cover_letter' | 'cold_email' | 'interview_prep'
  content: string
  jobTitle: string
  companyName: string
}

const typeLabels = {
  cover_letter: 'Cover Letter',
  cold_email: 'Outreach Email',
  interview_prep: 'Interview Prep',
}

export const AIResultDialog: React.FC<AIResultDialogProps> = ({
  open,
  onOpenChange,
  type,
  content,
  jobTitle,
  companyName,
}) => {
  const title = typeLabels[type]

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    toast.success('Copied to clipboard!')
  }

  const handleDownload = () => {
    const element = document.createElement('a')
    const file = new Blob([content], { type: 'text/plain' })
    element.href = URL.createObjectURL(file)
    element.download = `${type}_${jobTitle}_${companyName}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Downloaded successfully!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {jobTitle} at {companyName}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <Textarea
            value={content}
            readOnly
            className="min-h-[300px] font-mono text-xs"
          />

          <DialogFooter className="flex-row gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleCopy}
                className="flex-1 sm:flex-none"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline"
                onClick={handleDownload}
                className="flex-1 sm:flex-none"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={() => onOpenChange(false)}
                className="flex-1 sm:flex-none"
              >
                Close
              </Button>
            </motion.div>
          </DialogFooter>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
