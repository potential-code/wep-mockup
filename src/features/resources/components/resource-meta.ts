import type { ResourceFormat } from '@shared/types'
import {
  FileSpreadsheet,
  FileText,
  Link2,
  type LucideIcon,
  Presentation,
  Video,
} from 'lucide-react'

export const FORMAT_META: Record<ResourceFormat, { label: string; icon: LucideIcon }> = {
  pdf: { label: 'PDF', icon: FileText },
  docx: { label: 'Word document', icon: FileText },
  pptx: { label: 'Slides', icon: Presentation },
  xlsx: { label: 'Spreadsheet', icon: FileSpreadsheet },
  link: { label: 'Web link', icon: Link2 },
  video: { label: 'Video', icon: Video },
}
