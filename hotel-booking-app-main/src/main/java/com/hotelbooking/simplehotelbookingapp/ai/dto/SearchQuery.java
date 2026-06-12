package com.hotelbooking.simplehotelbookingapp.ai.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * Structured output DTO populated by LangChain4j / Claude from a natural language query.
 * Must be a plain class with a no-arg constructor so LangChain4j can deserialize the AI response.
 */
@Getter
@Setter
@NoArgsConstructor
public class SearchQuery {

    /** General area or neighbourhood (e.g. "Bandra", "Downtown"). */
    private String location;

    /** Specific city name (e.g. "Mumbai", "New York"). */
    private String city;

    /** Country name (e.g. "India", "USA"). */
    private String country;

    /** Specific hotel name if mentioned. */
    private String hotelName;

    /** Minimum price per night (currency-symbol stripped). */
    private BigDecimal minPrice;

    /** Maximum price per night (currency-symbol stripped). */
    private BigDecimal maxPrice;

    /** Star rating 1–5, if mentioned. */
    private Integer starRating;

    /** Check-in date in YYYY-MM-DD format, if mentioned. */
    private String checkInDate;

    /** Check-out date in YYYY-MM-DD format, if mentioned. */
    private String checkOutDate;
}

