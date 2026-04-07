package com.outlms.controller;

import com.outlms.entity.MembershipPlan;
import com.outlms.entity.StudentMembership;
import com.outlms.entity.User;
import com.outlms.service.MembershipService;
import com.outlms.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/membership")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:5173" })
public class MembershipController {

    private final MembershipService membershipService;
    private final UserService userService;

    // ── Membership Plans (Admin/Staff readable by all authenticated) ──────

    @GetMapping("/plans")
    public ResponseEntity<List<MembershipPlan>> getActivePlans() {
        return ResponseEntity.ok(membershipService.getActivePlans());
    }

    @GetMapping("/plans/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<MembershipPlan>> getAllPlans() {
        return ResponseEntity.ok(membershipService.getAllPlans());
    }

    @GetMapping("/plans/{id}")
    public ResponseEntity<MembershipPlan> getPlan(@PathVariable Long id) {
        return ResponseEntity.ok(membershipService.getPlanById(id));
    }

    @PostMapping("/plans")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MembershipPlan> createPlan(@RequestBody MembershipPlan plan) {
        return ResponseEntity.ok(membershipService.createPlan(plan));
    }

    @PutMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<MembershipPlan> updatePlan(@PathVariable Long id, @RequestBody MembershipPlan plan) {
        return ResponseEntity.ok(membershipService.updatePlan(id, plan));
    }

    @DeleteMapping("/plans/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, String>> deletePlan(@PathVariable Long id) {
        membershipService.deletePlan(id);
        return ResponseEntity.ok(Map.of("message", "Plan deleted successfully"));
    }

    // ── Student Memberships ───────────────────────────────────────────────

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<StudentMembership>> getAllMemberships() {
        return ResponseEntity.ok(membershipService.getAllMemberships());
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<List<StudentMembership>> getStudentMemberships(@PathVariable Long studentId) {
        return ResponseEntity.ok(membershipService.getMembershipsByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/active")
    public ResponseEntity<?> getActiveMembership(@PathVariable Long studentId) {
        Optional<StudentMembership> m = membershipService.getActiveMembership(studentId);
        return m.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    /** Student checks their own membership */
    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyMembership(Authentication auth) {
        User student = getUserFromAuth(auth);
        Optional<StudentMembership> m = membershipService.getActiveMembership(student.getId());
        return m.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    /** Student checks latest membership including SUSPENDED (pending payment) */
    @GetMapping("/my/latest")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getMyLatestMembership(Authentication auth) {
        User student = getUserFromAuth(auth);
        Optional<StudentMembership> m = membershipService.getLatestMembership(student.getId());
        return m.map(ResponseEntity::ok).orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<StudentMembership> assignMembership(
            @RequestBody AssignMembershipRequest request,
            Authentication auth) {
        User staff = getUserFromAuth(auth);
        StudentMembership membership = membershipService.assignMembership(
                request.studentId,
                request.planId,
                staff.getId(),
                request.notes,
                request.endDate);
        return ResponseEntity.ok(membership);
    }

    @PostMapping("/self-assign")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<StudentMembership> selfAssignMembership(
            @RequestBody SelfAssignMembershipRequest request,
            Authentication auth) {
        User student = getUserFromAuth(auth);
        StudentMembership membership = membershipService.selfAssignMembership(
                student.getId(),
                request.planId,
                request.notes,
                request.endDate);
        return ResponseEntity.ok(membership);
    }

    @PostMapping("/{membershipId}/revoke")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<StudentMembership> revokeMembership(@PathVariable Long membershipId) {
        return ResponseEntity.ok(membershipService.revokeMembership(membershipId));
    }

    @GetMapping("/student/{studentId}/allowance")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<Map<String, Integer>> getStudentAllowance(@PathVariable Long studentId) {
        int allowance = membershipService.getBookAllowance(studentId);
        return ResponseEntity.ok(Map.of("bookAllowance", allowance));
    }

    private User getUserFromAuth(Authentication auth) {
        return userService.findByUsernameOrEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // DTO
    public static class AssignMembershipRequest {
        public Long studentId;
        public Long planId;
        public String notes;
        public LocalDate endDate;
    }

    public static class SelfAssignMembershipRequest {
        public Long planId;
        public String notes;
        public LocalDate endDate;
    }
}
