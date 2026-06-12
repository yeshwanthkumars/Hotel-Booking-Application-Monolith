package com.hotelbooking.simplehotelbookingapp.ai.service;

import com.hotelbooking.simplehotelbookingapp.ai.dto.SearchQuery;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;

/**
 * LangChain4j AI service interface.
 * LangChain4j creates a proxy at runtime (via {@code AiServices.create()}) that:
 *  1. Builds a prompt from the system + user message templates.
 *  2. Calls the configured Claude model.
 *  3. Deserializes the JSON response into {@link SearchQuery}.
 */
public interface QueryParserAiService {

    @SystemMessage("You are a hotel search query parser. " +
            "Extract hotel search parameters from the user input. " +
            "The fields to extract are: " +
            "location (general area or neighbourhood), " +
            "city (specific city), " +
            "country, " +
            "hotelName (specific hotel name if mentioned), " +
            "minPrice (number only, no currency symbols — for 'over $100' set minPrice=100), " +
            "maxPrice (number only, no currency symbols — for 'under $300' or 'under ₹5000' set maxPrice=300 or 5000), " +
            "starRating (integer 1-5), " +
            "checkInDate (YYYY-MM-DD format), " +
            "checkOutDate (YYYY-MM-DD format). " +
            "Use null for any field not mentioned in the query. " +
            "For relative dates like 'next weekend' or 'this Friday', compute the actual dates from today's date provided in the user message.")
    @UserMessage("Today is {{today}}. Parse this hotel search query: {{query}}")
    SearchQuery parse(@V("query") String query, @V("today") String today);
}

