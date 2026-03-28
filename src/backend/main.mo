import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Order "mo:core/Order";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Types
  public type AppointmentStatus = { #pending; #accepted; #rejected; #completed };

  public type Appointment = {
    id : Nat;
    customerId : Principal;
    customerName : Text;
    customerNumber : Text;
    date : Text;
    time : Text;
    status : AppointmentStatus;
    notes : Text;
    createdAt : Int;
    updatedAt : Int;
  };

  public type TimeSlot = {
    id : Nat;
    date : Text;
    time : Text;
    isBooked : Bool;
  };

  public type UserProfile = {
    name : Text;
    role : { #admin; #pa; #customer };
    customerNumber : ?Text;
  };

  // Storage
  var nextAppointmentId = 1;
  var nextSlotId = 1;
  var customerCounter = 1;

  let appointments = Map.empty<Nat, Appointment>();
  let timeSlots = Map.empty<Nat, TimeSlot>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  func getId<T>(getId : T -> Nat) : (T -> Nat) { getId };

  module Appointment {
    public func getId(appointment : Appointment) : Nat { appointment.id };
    public func compare(appointment1 : Appointment, appointment2 : Appointment) : Order.Order {
      Nat.compare(appointment1.id, appointment2.id);
    };
  };

  module TimeSlot {
    public func getId(timeSlot : TimeSlot) : Nat { timeSlot.id };
    public func compare(timeSlot1 : TimeSlot, timeSlot2 : TimeSlot) : Order.Order {
      Nat.compare(timeSlot1.id, timeSlot2.id);
    };
  };

  func getAppointmentInternal(id : Nat) : Appointment {
    switch (appointments.get(id)) {
      case (null) { Runtime.trap("Appointment not found") };
      case (?appointment) { appointment };
    };
  };

  func isAdminOrPA(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#admin) { true };
          case (#pa) { true };
          case (#customer) { false };
        };
      };
    };
  };

  func isCustomer(caller : Principal) : Bool {
    switch (userProfiles.get(caller)) {
      case (null) { false };
      case (?profile) {
        switch (profile.role) {
          case (#customer) { true };
          case (_) { false };
        };
      };
    };
  };

  func generateCustomerNumber() : Text {
    let num = customerCounter;
    customerCounter += 1;
    let padded = if (num < 10) {
      "000" # num.toText();
    } else if (num < 100) {
      "00" # num.toText();
    } else if (num < 1000) {
      "0" # num.toText();
    } else {
      num.toText();
    };
    "CUST-" # padded;
  };

  // Bootstrap: first caller becomes admin (one-time only, no secret needed)
  public shared ({ caller }) func bootstrapAdmin(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Must be logged in to bootstrap admin");
    };
    if (accessControlState.adminAssigned) {
      Runtime.trap("Admin already set up");
    };
    // Set as AccessControl admin
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    // Create user profile
    let profile : UserProfile = {
      name;
      role = #admin;
      customerNumber = null;
    };
    userProfiles.add(caller, profile);
  };

  // Check if admin has been set up yet (public, no auth required)
  public query func isAdminBootstrapped() : async Bool {
    accessControlState.adminAssigned;
  };

  // User Profile Management
  // No auth check -- callers can only read their own profile; unknown users return null
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // User Management (Admin only)
  public shared ({ caller }) func createUser(user : Principal, name : Text, role : { #admin; #pa; #customer }) : async Text {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create users");
    };

    let customerNumber = switch (role) {
      case (#customer) { ?generateCustomerNumber() };
      case (_) { null };
    };

    let profile : UserProfile = {
      name;
      role;
      customerNumber;
    };

    userProfiles.add(user, profile);

    // Assign AccessControl role
    let acRole = switch (role) {
      case (#admin) { #admin };
      case (#pa) { #user };
      case (#customer) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, user, acRole);

    switch (customerNumber) {
      case (?num) { num };
      case (null) { "" };
    };
  };

  public shared ({ caller }) func updateUser(user : Principal, name : Text, role : { #admin; #pa; #customer }) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update users");
    };

    let existingProfile = userProfiles.get(user);
    let customerNumber = switch (existingProfile) {
      case (?profile) { profile.customerNumber };
      case (null) {
        switch (role) {
          case (#customer) { ?generateCustomerNumber() };
          case (_) { null };
        };
      };
    };

    let profile : UserProfile = {
      name;
      role;
      customerNumber;
    };

    userProfiles.add(user, profile);

    let acRole = switch (role) {
      case (#admin) { #admin };
      case (#pa) { #user };
      case (#customer) { #user };
    };
    AccessControl.assignRole(accessControlState, caller, user, acRole);
  };

  public shared ({ caller }) func deleteUser(user : Principal) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete users");
    };
    userProfiles.remove(user);
  };

  public query ({ caller }) func listUsers() : async [(Principal, UserProfile)] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can list users");
    };
    userProfiles.entries().toArray();
  };

  // Appointment Management
  public query ({ caller }) func getAppointment(id : Nat) : async Appointment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    let appointment = getAppointmentInternal(id);

    // Customers can only see their own appointments
    if (isCustomer(caller) and appointment.customerId != caller) {
      Runtime.trap("Unauthorized: Can only view your own appointments");
    };

    appointment;
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only Admin/PA can see all appointments
    if (not isAdminOrPA(caller)) {
      Runtime.trap("Unauthorized: Only admin or PA can view all appointments");
    };

    appointments.values().toArray().sort();
  };

  public query ({ caller }) func getMyAppointments() : async [Appointment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    appointments.values().toArray().filter(func(apt) { apt.customerId == caller });
  };

  public shared ({ caller }) func createAppointment(customerName : Text, customerNumber : Text, date : Text, time : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create appointments");
    };

    // Verify the caller is a customer
    if (not isCustomer(caller)) {
      Runtime.trap("Unauthorized: Only customers can create appointments");
    };

    let now = Time.now();
    let appointment : Appointment = {
      id = nextAppointmentId;
      customerId = caller;
      customerName;
      customerNumber;
      date;
      time;
      status = #pending;
      notes;
      createdAt = now;
      updatedAt = now;
    };
    appointments.add(nextAppointmentId, appointment);
    nextAppointmentId += 1;
    appointment.id;
  };

  public shared ({ caller }) func acceptAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only Admin/PA can accept appointments
    if (not isAdminOrPA(caller)) {
      Runtime.trap("Unauthorized: Only admin or PA can accept appointments");
    };

    let appointment = getAppointmentInternal(appointmentId);
    let updatedAppointment : Appointment = {
      appointment with
      status = #accepted;
      updatedAt = Time.now();
    };
    appointments.add(appointmentId, updatedAppointment);
  };

  public shared ({ caller }) func rejectAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only Admin/PA can reject appointments
    if (not isAdminOrPA(caller)) {
      Runtime.trap("Unauthorized: Only admin or PA can reject appointments");
    };

    let appointment = getAppointmentInternal(appointmentId);
    let updatedAppointment : Appointment = {
      appointment with
      status = #rejected;
      updatedAt = Time.now();
    };
    appointments.add(appointmentId, updatedAppointment);
  };

  public shared ({ caller }) func completeAppointment(appointmentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only Admin/PA can complete appointments
    if (not isAdminOrPA(caller)) {
      Runtime.trap("Unauthorized: Only admin or PA can complete appointments");
    };

    let appointment = getAppointmentInternal(appointmentId);
    let updatedAppointment : Appointment = {
      appointment with
      status = #completed;
      updatedAt = Time.now();
    };
    appointments.add(appointmentId, updatedAppointment);
  };

  // Time Slot Management
  public shared ({ caller }) func addTimeSlot(date : Text, time : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add time slots");
    };

    let slot : TimeSlot = {
      id = nextSlotId;
      date;
      time;
      isBooked = false;
    };
    timeSlots.add(nextSlotId, slot);
    nextSlotId += 1;
    slot.id;
  };

  public shared ({ caller }) func removeTimeSlot(slotId : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove time slots");
    };
    timeSlots.remove(slotId);
  };

  public query ({ caller }) func getAllTimeSlots() : async [TimeSlot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    timeSlots.values().toArray().sort();
  };

  public query ({ caller }) func getAvailableTimeSlots() : async [TimeSlot] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    timeSlots.values().toArray().filter(func(slot) { not slot.isBooked });
  };

  public shared ({ caller }) func bookTimeSlot(slotId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    switch (timeSlots.get(slotId)) {
      case (null) { Runtime.trap("Time slot not found") };
      case (?slot) {
        if (slot.isBooked) {
          Runtime.trap("Time slot already booked");
        };
        let updatedSlot : TimeSlot = {
          slot with isBooked = true;
        };
        timeSlots.add(slotId, updatedSlot);
      };
    };
  };

  // Statistics
  public query ({ caller }) func getAppointmentStats() : async {
    pending : Nat;
    accepted : Nat;
    rejected : Nat;
    completed : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Authentication required");
    };

    // Only Admin/PA can view stats
    if (not isAdminOrPA(caller)) {
      Runtime.trap("Unauthorized: Only admin or PA can view statistics");
    };

    var pending = 0;
    var accepted = 0;
    var rejected = 0;
    var completed = 0;

    for (appointment in appointments.values()) {
      switch (appointment.status) {
        case (#pending) { pending += 1 };
        case (#accepted) { accepted += 1 };
        case (#rejected) { rejected += 1 };
        case (#completed) { completed += 1 };
      };
    };

    { pending; accepted; rejected; completed };
  };
};
