package com.hotelbooking.simplehotelbookingapp.security;

import com.hotelbooking.simplehotelbookingapp.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

	private JwtService jwtService;
	private UserDetails userDetails;

	@BeforeEach
	void setUp() {
		JwtProperties jwtProperties = new JwtProperties();
		jwtProperties.setSecret("R2l0SHViQ29waWxvdFNwcmluZ0Jvb3RKd3RTZWNyZXRLZXlGb3JIUzI1NkFsZ29yaXRobQ==");
		jwtProperties.setExpiration(60000L);
		jwtService = new JwtService(jwtProperties);
		userDetails = User.builder()
				.username("jwt-user")
				.password("encoded-password")
				.roles("USER")
				.build();
	}

	@Test
	void testGenerateTokenAndExtractUsername() {
		String token = jwtService.generateToken(userDetails);

		assertNotNull(token);
		assertEquals("jwt-user", jwtService.extractUsername(token));
	}

	@Test
	void testValidateToken_WithMatchingUser() {
		String token = jwtService.generateToken(userDetails);

		assertTrue(jwtService.validateToken(token, userDetails));
	}

	@Test
	void testValidateToken_WithDifferentUser() {
		String token = jwtService.generateToken(userDetails);
		UserDetails anotherUser = User.builder()
				.username("other-user")
				.password("encoded-password")
				.roles("USER")
				.build();

		assertFalse(jwtService.validateToken(token, anotherUser));
	}
}

