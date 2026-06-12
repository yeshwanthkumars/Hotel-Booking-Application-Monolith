package com.hotelbooking.simplehotelbookingapp.dto;

import com.hotelbooking.simplehotelbookingapp.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Username is required") String username,
        @Email(message = "Email must be valid")
        @NotBlank(message = "Email is required") String email,
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters long") String password,
        @NotNull(message = "Role is required") Role role
) {
    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public Role getRole() {
        return role;
    }
}

