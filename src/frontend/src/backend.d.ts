import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    id: bigint;
    date: string;
    time: string;
    isBooked: boolean;
}
export interface Appointment {
    id: bigint;
    customerName: string;
    status: AppointmentStatus;
    customerNumber: string;
    date: string;
    createdAt: bigint;
    time: string;
    updatedAt: bigint;
    notes: string;
    customerId: Principal;
}
export interface UserProfile {
    customerNumber?: string;
    name: string;
    role: Variant_pa_admin_customer;
}
export enum AppointmentStatus {
    pending = "pending",
    completed = "completed",
    rejected = "rejected",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_pa_admin_customer {
    pa = "pa",
    admin = "admin",
    customer = "customer"
}
export interface backendInterface {
    acceptAppointment(appointmentId: bigint): Promise<void>;
    addTimeSlot(date: string, time: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    bookTimeSlot(slotId: bigint): Promise<void>;
    bootstrapAdmin(name: string): Promise<void>;
    completeAppointment(appointmentId: bigint): Promise<void>;
    createAppointment(customerName: string, customerNumber: string, date: string, time: string, notes: string): Promise<bigint>;
    createUser(user: Principal, name: string, role: Variant_pa_admin_customer): Promise<string>;
    deleteUser(user: Principal): Promise<void>;
    getAllAppointments(): Promise<Array<Appointment>>;
    getAllTimeSlots(): Promise<Array<TimeSlot>>;
    getAppointment(id: bigint): Promise<Appointment>;
    getAppointmentStats(): Promise<{
        pending: bigint;
        completed: bigint;
        rejected: bigint;
        accepted: bigint;
    }>;
    getAvailableTimeSlots(): Promise<Array<TimeSlot>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMyAppointments(): Promise<Array<Appointment>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isAdminBootstrapped(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    listUsers(): Promise<Array<[Principal, UserProfile]>>;
    rejectAppointment(appointmentId: bigint): Promise<void>;
    removeTimeSlot(slotId: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateUser(user: Principal, name: string, role: Variant_pa_admin_customer): Promise<void>;
}
