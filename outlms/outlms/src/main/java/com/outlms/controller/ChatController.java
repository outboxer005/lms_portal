package com.outlms.controller;

import com.outlms.dto.ChatRequest;
import com.outlms.dto.ChatResponse;
import com.outlms.entity.User;
import com.outlms.repository.UserRepository;
import com.outlms.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class ChatController {

    private final ChatService chatService;
    private final UserRepository userRepository;

    @PostMapping("/guest")
    public ResponseEntity<ChatResponse> guestChat(@RequestBody ChatRequest request) {
        String replyMessage = chatService.handleGuestChat(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(replyMessage));
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String replyMessage = chatService.handleChat(request.getMessage(), user);
        return ResponseEntity.ok(new ChatResponse(replyMessage));
    }
}
