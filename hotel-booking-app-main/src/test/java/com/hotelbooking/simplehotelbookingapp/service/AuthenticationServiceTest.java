package com.hotelbooking.simplehotelbookingapp.service;

import com.hotelbooking.simplehotelbookingapp.dto.AuthenticationRequest;
import com.hotelbooking.simplehotelbookingapp.dto.AuthenticationResponse;
import com.hotelbooking.simplehotelbookingapp.dto.RegisterRequest;
import com.hotelbooking.simplehotelbookingapp.entity.Role;
import com.hotelbooking.simplehotelbookingapp.exception.UserAlreadyExistsException;
import com.hotelbooking.simplehotelbookingapp.repository.UserRepository;
import com.hotelbooking.simplehotelbookingapp.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

	@Mock
	private UserRepository userRepository;

	@Mock
	private PasswordEncoder passwordEncoder;

	@Mock
	private JwtService jwtService;

	@Mock
	private AuthenticationManager authenticationManager;

	@Mock
	private UserDetailsService userDetailsService;

	@InjectMocks
	private AuthenticationService authenticationService;

	private RegisterRequest registerRequest;
	private AuthenticationRequest authenticationRequest;
	private UserDetails userDetails;

	@BeforeEach
	void setUp() {
		registerRequest = new RegisterRequest("john", "john@example.com", "password123", Role.USER);
		authenticationRequest = new AuthenticationRequest("john", "password123");
		userDetails = User.builder()
				.username("john")
				.password("encoded-password")
				.roles("USER")
				.build();
	}

	@Test
	void testRegister_Success() {
		when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
		when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(false);
		when(passwordEncoder.encode(registerRequest.getPassword())).thenReturn("encoded-password");
		when(userDetailsService.loadUserByUsername(registerRequest.getUsername())).thenReturn(userDetails);

		AuthenticationResponse response = authenticationService.register(registerRequest);

		assertNotNull(response);
		assertEquals("john", response.getUsername());
		assertEquals("john@example.com", response.getEmail());
		assertEquals(Role.USER, response.getRole());
		assertEquals("Registered successfully", response.getMessage());
		assertEquals(null, response.getToken());

		ArgumentCaptor<com.hotelbooking.simplehotelbookingapp.entity.User> userCaptor = ArgumentCaptor.forClass(com.hotelbooking.simplehotelbookingapp.entity.User.class);
		verify(userRepository, times(1)).save(userCaptor.capture());
		assertEquals("john", userCaptor.getValue().getUsername());
		assertEquals("encoded-password", userCaptor.getValue().getPassword());
		assertEquals(Role.USER, userCaptor.getValue().getRole());
	}

	@Test
	void testRegister_UsernameAlreadyExists() {
		when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(true);

		assertThrows(UserAlreadyExistsException.class, () -> authenticationService.register(registerRequest));
		verify(userRepository, never()).save(any());
	}

	@Test
	void testRegister_EmailAlreadyExists() {
		when(userRepository.existsByUsername(registerRequest.getUsername())).thenReturn(false);
		when(userRepository.existsByEmail(registerRequest.getEmail())).thenReturn(true);

		assertThrows(UserAlreadyExistsException.class, () -> authenticationService.register(registerRequest));
		verify(userRepository, never()).save(any());
	}

	@Test
	void testLogin_Success() {
		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
				.thenReturn(new UsernamePasswordAuthenticationToken("john", "password123"));
		when(userDetailsService.loadUserByUsername(authenticationRequest.getUsername())).thenReturn(userDetails);
		com.hotelbooking.simplehotelbookingapp.entity.User appUser = new com.hotelbooking.simplehotelbookingapp.entity.User();
		appUser.setUsername("john");
		appUser.setEmail("john@example.com");
		appUser.setRole(Role.USER);
		when(userRepository.findByUsername("john")).thenReturn(Optional.of(appUser));
		when(jwtService.generateToken(userDetails)).thenReturn("jwt-token");

		AuthenticationResponse response = authenticationService.login(authenticationRequest);

		assertEquals("john", response.getUsername());
		assertEquals("john@example.com", response.getEmail());
		assertEquals(Role.USER, response.getRole());
		assertEquals("Logged in successfully", response.getMessage());
		assertEquals("jwt-token", response.getToken());
		verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
		verify(userDetailsService, times(1)).loadUserByUsername(eq("john"));
	}

	@Test
	void testLogin_InvalidCredentials() {
		when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
				.thenThrow(new BadCredentialsException("Bad credentials"));

		BadCredentialsException exception = assertThrows(BadCredentialsException.class,
				() -> authenticationService.login(authenticationRequest));

		assertEquals("Invalid username or password", exception.getMessage());
	}
}

