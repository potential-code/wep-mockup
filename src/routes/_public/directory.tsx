import { createFileRoute } from '@tanstack/react-router'
import { DirectoryPage } from '@/features/public-site/pages/DirectoryPage'

export const Route = createFileRoute('/_public/directory')({
  staticData: { title: 'Company Directory' },
  component: DirectoryPage,
})
