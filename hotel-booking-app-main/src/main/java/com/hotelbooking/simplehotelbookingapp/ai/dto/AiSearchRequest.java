package com.hotelbooking.simplehotelbookingapp.ai.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Natural language hotel search request.")
public record AiSearchRequest(

        @Schema(
                description = "Plain English search query.",
                example = "Hotels in Mumbai under ₹5000 from June 10 to June 15")
        @NotBlank(message = "Search query must not be blank")
        @Size(max = 500, message = "Query must not exceed 500 characters")
        String query

) {}

