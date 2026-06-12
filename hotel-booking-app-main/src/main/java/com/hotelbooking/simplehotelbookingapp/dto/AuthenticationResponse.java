package com.hotelbooking.simplehotelbookingapp.dto;

import com.hotelbooking.simplehotelbookingapp.entity.Role;

public record AuthenticationResponse(
        String username,
        String email,
        Role role,
        String message,
        String token
) {
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }
}

