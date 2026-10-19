import { createFileRoute } from '@tanstack/react-router'
import { PointsPage } from '@/features/points/pages/PointsPage'

export const Route = createFileRoute('/_app/portal/points')({
  staticData: { title: 'Points and Rewards', capability: 'points.view' },
  component: PointsPage,
})
