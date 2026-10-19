import { useParams } from '@tanstack/react-router'
import { BookingSession } from '../components/BookingSession'
import { ClinicSession } from '../components/ClinicSession'

/** `bk-…` ids are one-to-one bookings; `evt-…` ids are group clinics and webinars. */
export function ExpertSessionPage() {
  const { sessionId } = useParams({ from: '/_app/expert/sessions/$sessionId' })
  return sessionId.startsWith('evt-') ? (
    <ClinicSession id={sessionId} />
  ) : (
    <BookingSession id={sessionId} />
  )
}
