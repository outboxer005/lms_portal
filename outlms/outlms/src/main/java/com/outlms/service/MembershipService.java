package com.outlms.service;

import com.outlms.entity.MembershipPlan;
import com.outlms.entity.StudentMembership;
import com.outlms.entity.StudentMembership.MembershipStatus;
import com.outlms.entity.User;
import com.outlms.repository.MembershipPlanRepository;
import com.outlms.repository.StudentMembershipRepository;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MembershipService {

    private final MembershipPlanRepository planRepository;
    private final StudentMembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    // ── Plans ──────────────────────────────────────────────────────────────

    public List<MembershipPlan> getAllPlans() {
        return planRepository.findAll();
    }

    public List<MembershipPlan> getActivePlans() {
        return planRepository.findByActiveTrue();
    }

    public MembershipPlan getPlanById(Long id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membership plan not found: " + id));
    }

    @Transactional
    public MembershipPlan createPlan(MembershipPlan plan) {
        if (planRepository.findByName(plan.getName()).isPresent()) {
            throw new RuntimeException("A plan with this name already exists: " + plan.getName());
        }
        return planRepository.save(plan);
    }

    @Transactional
    public MembershipPlan updatePlan(Long id, MembershipPlan updated) {
        MembershipPlan plan = getPlanById(id);
        plan.setName(updated.getName());
        plan.setTier(updated.getTier());
        plan.setBookAllowance(updated.getBookAllowance());
        plan.setLoanDurationDays(updated.getLoanDurationDays());
        plan.setMaxRenewals(updated.getMaxRenewals());
        plan.setMonthlyFee(updated.getMonthlyFee());
        plan.setDescription(updated.getDescription());
        plan.setActive(updated.getActive());
        return planRepository.save(plan);
    }

    @Transactional
    public void deletePlan(Long id) {
        MembershipPlan plan = getPlanById(id);
        List<StudentMembership> active = membershipRepository.findByPlanId(id)
                .stream().filter(m -> m.getStatus() == MembershipStatus.ACTIVE).toList();
        if (!active.isEmpty()) {
            throw new RuntimeException("Cannot delete plan: " + active.size() + " active memberships use this plan.");
        }
        planRepository.delete(plan);
    }

    // ── Student Memberships ────────────────────────────────────────────────

    public List<StudentMembership> getAllMemberships() {
        return membershipRepository.findAll();
    }

    public List<StudentMembership> getMembershipsByStudent(Long studentId) {
        return membershipRepository.findByStudentId(studentId);
    }

    public Optional<StudentMembership> getActiveMembership(Long studentId) {
        return membershipRepository.findByStudentIdAndStatus(studentId, MembershipStatus.ACTIVE);
    }

    @Transactional
    public StudentMembership assignMembership(Long studentId, Long planId, Long assignedById, String notes,
            LocalDate endDate) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found: " + studentId));

        MembershipPlan plan = getPlanById(planId);

        // Expire any existing active membership
        membershipRepository.findByStudentIdAndStatus(studentId, MembershipStatus.ACTIVE)
                .ifPresent(existing -> {
                    existing.setStatus(MembershipStatus.EXPIRED);
                    membershipRepository.save(existing);
                });

        User assignedBy = userRepository.findById(assignedById)
                .orElseThrow(() -> new RuntimeException("Staff/Admin not found"));

        StudentMembership membership = new StudentMembership();
        membership.setStudent(student);
        membership.setPlan(plan);
        membership.setStartDate(LocalDate.now());
        membership.setEndDate(endDate);
        membership.setStatus(MembershipStatus.ACTIVE);
        membership.setAssignedBy(assignedBy);
        membership.setNotes(notes);

        StudentMembership saved = membershipRepository.save(membership);
        // Notify student (async)
        emailService.sendMembershipAssignedEmail(saved);
        return saved;
    }

    @Transactional
    public StudentMembership revokeMembership(Long membershipId) {
        StudentMembership membership = membershipRepository.findById(membershipId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        membership.setStatus(MembershipStatus.SUSPENDED);
        StudentMembership saved = membershipRepository.save(membership);
        // Notify student (async)
        emailService.sendMembershipRevokedEmail(saved);
        return saved;
    }

    /**
     * Check how many books a student can currently borrow (based on membership
     * plan)
     */
    public int getBookAllowance(Long studentId) {
        return getActiveMembership(studentId)
                .map(m -> m.getPlan().getBookAllowance())
                .orElse(2); // default 2 if no membership plan assigned
    }

    public List<StudentMembership> getMembershipsByStatus(MembershipStatus status) {
        return membershipRepository.findByStatus(status);
    }
}
