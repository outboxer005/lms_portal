package com.outlms.service;

import com.outlms.dto.UserRegistrationRequest;
import com.outlms.entity.User;
import com.outlms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(UserRegistrationRequest registrationRequest) {
        if (userRepository.existsByUsername(registrationRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(registrationRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setUsername(registrationRequest.getUsername());
        user.setEmail(registrationRequest.getEmail());
        user.setPassword(passwordEncoder.encode(registrationRequest.getPassword()));
        user.setFirstName(registrationRequest.getFirstName());
        user.setLastName(registrationRequest.getLastName());
        user.setPhoneNumber(registrationRequest.getPhoneNumber());
        user.setRole(registrationRequest.getRole());
        user.setActive(true);

        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> findByUsernameOrEmail(String usernameOrEmail) {
        return userRepository.findByUsernameOrEmail(usernameOrEmail);
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public List<User> findByRole(User.Role role) {
        return userRepository.findAll().stream()
                .filter(user -> user.getRole().equals(role))
                .toList();
    }

    public List<User> findActiveByRole(User.Role role) {
        return userRepository.findByRoleAndActiveTrue(role);
    }

    public List<User> getUsersByRole(User.Role role) {
        return userRepository.findByRoleAndActiveTrue(role);
    }

    public User updateUser(Long id, UserRegistrationRequest updateRequest) {
        User existingUser = findById(id);

        if (!existingUser.getUsername().equals(updateRequest.getUsername()) &&
                userRepository.existsByUsername(updateRequest.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (!existingUser.getEmail().equals(updateRequest.getEmail()) &&
                userRepository.existsByEmail(updateRequest.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        existingUser.setUsername(updateRequest.getUsername());
        existingUser.setEmail(updateRequest.getEmail());
        existingUser.setFirstName(updateRequest.getFirstName());
        existingUser.setLastName(updateRequest.getLastName());
        existingUser.setPhoneNumber(updateRequest.getPhoneNumber());
        existingUser.setRole(updateRequest.getRole());

        return userRepository.save(existingUser);
    }

    public void deleteUser(Long id) {
        User user = findById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        User user = findById(userId);
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect old password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setMustChangePassword(false); // User has set their own password
        userRepository.save(user);
    }
}
