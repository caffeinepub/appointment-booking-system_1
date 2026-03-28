import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Appointment, TimeSlot, UserProfile } from "../backend.d";
import { Variant_pa_admin_customer } from "../backend.d";
import { useActor } from "./useActor";

export type { Appointment, UserProfile, TimeSlot };
export { Variant_pa_admin_customer };

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCallerUserProfile();
      } catch {
        // Backend may throw for unauthenticated/unrecognized callers -- treat as no profile
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllAppointments() {
  const { actor, isFetching } = useActor();
  return useQuery<Appointment[]>({
    queryKey: ["allAppointments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useMyAppointments() {
  const { actor, isFetching } = useActor();
  return useQuery<Appointment[]>({
    queryKey: ["myAppointments"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyAppointments();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAppointmentStats() {
  const { actor, isFetching } = useActor();
  return useQuery<{
    pending: bigint;
    completed: bigint;
    rejected: bigint;
    accepted: bigint;
  }>({
    queryKey: ["appointmentStats"],
    queryFn: async () => {
      if (!actor)
        return { pending: 0n, completed: 0n, rejected: 0n, accepted: 0n };
      return actor.getAppointmentStats();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<Array<[Principal, UserProfile]>>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAvailableTimeSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<TimeSlot[]>({
    queryKey: ["availableTimeSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableTimeSlots();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useAllTimeSlots() {
  const { actor, isFetching } = useActor();
  return useQuery<TimeSlot[]>({
    queryKey: ["allTimeSlots"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTimeSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAcceptAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.acceptAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAppointments"] });
      qc.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
}

export function useRejectAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.rejectAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAppointments"] });
      qc.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
}

export function useCompleteAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.completeAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allAppointments"] });
      qc.invalidateQueries({ queryKey: ["appointmentStats"] });
    },
  });
}

export function useCreateAppointment() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      customerName: string;
      customerNumber: string;
      date: string;
      time: string;
      notes: string;
    }) =>
      actor!.createAppointment(
        params.customerName,
        params.customerNumber,
        params.date,
        params.time,
        params.notes,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myAppointments"] });
      qc.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    },
  });
}

export function useCreateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      principal: Principal;
      name: string;
      role: Variant_pa_admin_customer;
    }) => actor!.createUser(params.principal, params.name, params.role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useUpdateUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      principal: Principal;
      name: string;
      role: Variant_pa_admin_customer;
    }) => actor!.updateUser(params.principal, params.name, params.role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useDeleteUser() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (principal: Principal) => actor!.deleteUser(principal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
    },
  });
}

export function useAddTimeSlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: { date: string; time: string }) =>
      actor!.addTimeSlot(params.date, params.time),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTimeSlots"] });
      qc.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    },
  });
}

export function useRemoveTimeSlot() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: bigint) => actor!.removeTimeSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allTimeSlots"] });
      qc.invalidateQueries({ queryKey: ["availableTimeSlots"] });
    },
  });
}
