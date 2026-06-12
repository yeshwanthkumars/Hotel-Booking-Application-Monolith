package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.AuthenticationRequest;
import com.hotelbooking.simplehotelbookingapp.dto.AuthenticationResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RegisterRequest;
import com.hotelbooking.simplehotelbookingapp.entity.User;
import com.hotelbooking.simplehotelbookingapp.exception.UserAlreadyExistsException;
import com.hotelbooking.simplehotelbookingapp.repository.UserRepository;
import com.hotelbooking.simplehotelbookingapp.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Username already exists: " + request.getUsername());
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email already exists: " + request.getEmail());
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);
        logger.info("User registered successfully: {} with role {}", user.getUsername(), user.getRole());

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getUsername());
        return new AuthenticationResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Registered successfully",
                null
        );
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid username or password", ex);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));
        logger.info("User logged in successfully: {}", user.getUsername());

        return new AuthenticationResponse(
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                "Logged in successfully",
                jwtService.generateToken(userDetails)
        );
    }
}

