package com.hotelbooking.simplehotelbookingapp.ai.controller;

import com.hotelbooking.simplehotelbookingapp.ai.dto.AiSearchRequest;
import com.hotelbooking.simplehotelbookingapp.ai.dto.AiSearchResponse;
import com.hotelbooking.simplehotelbookingapp.ai.service.AiSearchOrchestrator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Tag(
        name = "AI Search",
        description = "Natural language hotel and room search powered by Claude AI (Anthropic). " +
                "Accepts plain English queries and returns matching hotels and/or available rooms. " +
                "Requires USER or ADMIN role.")
@SecurityRequirement(name = "bearerAuth")
public class AiSearchController {

    private final AiSearchOrchestrator aiSearchOrchestrator;

    // ─────────────────────────────────────────────────────────────────────────
    // SEARCH
    // ─────────────────────────────────────────────────────────────────────────

    @PostMapping("/search")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Operation(
            summary = "Natural language hotel & room search",
            description = "Accepts a plain English query and returns results in two phases:\n\n" +
                    "**Phase 1 — always runs:** Claude extracts `location`, `city`, `country`, " +
                    "`hotelName`, `starRating` and delegates to the existing hotel search filters.\n\n" +
                    "**Phase 2 — runs when dates are present:** Claude additionally extracts " +
                    "`checkInDate` and `checkOutDate`, then returns only rooms that are AVAILABLE " +
                    "and have no overlapping bookings for those dates.\n\n" +
                    "**Example queries:**\n" +
                    "- `Hotels in Mumbai`\n" +
                    "- `Hotels in Mumbai under ₹5000`\n" +
                    "- `Available rooms in Singapore next weekend`\n" +
                    "- `Hotels in New York from June 10 to June 15 under $300`")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Search completed successfully",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AiSearchResponse.class))),
            @ApiResponse(responseCode = "400", description = "Blank query or query exceeds 500 characters",
                    content = @Content),
            @ApiResponse(responseCode = "401", description = "Unauthorized — JWT token missing or invalid",
                    content = @Content),
            @ApiResponse(responseCode = "403", description = "Forbidden — USER or ADMIN role required",
                    content = @Content),
            @ApiResponse(responseCode = "500",
                    description = "AI service error — check that ANTHROPIC_API_KEY is set correctly",
                    content = @Content)
    })
    public ResponseEntity<AiSearchResponse> search(@Valid @RequestBody AiSearchRequest request) {
        return ResponseEntity.ok(aiSearchOrchestrator.search(request));
    }
}

