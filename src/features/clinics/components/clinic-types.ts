import type { useEvent, useEvents } from '@/queries/clinics.queries'

export type ClinicRowData = NonNullable<ReturnType<typeof useEvents>['data']>[number]
export type ClinicDetailData = NonNullable<ReturnType<typeof useEvent>['data']>
