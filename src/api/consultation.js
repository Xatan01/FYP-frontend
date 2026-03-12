import { apiFetch } from "./client";

export function fetchConsultationExperts() {
  return apiFetch("/consultation/experts");
}

export function fetchConsultationBookings() {
  return apiFetch("/consultation/bookings");
}

export function createConsultationBooking({
  expertId,
  topic,
  preferredTime,
  initialMessage,
}) {
  return apiFetch("/consultation/bookings", {
    method: "POST",
    body: {
      expert_id: expertId,
      topic,
      preferred_time: preferredTime,
      initial_message: initialMessage,
    },
  });
}

export function markConsultationBooked(bookingId) {
  return apiFetch(`/consultation/bookings/${bookingId}/book`, {
    method: "POST",
  });
}

export function fetchConsultationMessages(bookingId) {
  return apiFetch(`/consultation/bookings/${bookingId}/messages`);
}

export function sendConsultationMessage(bookingId, message) {
  return apiFetch(`/consultation/bookings/${bookingId}/messages`, {
    method: "POST",
    body: { message },
  });
}
