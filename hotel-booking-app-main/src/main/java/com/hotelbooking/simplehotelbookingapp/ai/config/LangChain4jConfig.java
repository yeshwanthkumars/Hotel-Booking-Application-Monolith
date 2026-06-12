package com.hotelbooking.simplehotelbookingapp.ai.config;

import com.hotelbooking.simplehotelbookingapp.ai.service.QueryParserAiService;
import dev.langchain4j.model.anthropic.AnthropicChatModel;
import dev.langchain4j.service.AiServices;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Registers LangChain4j beans:
 * <ul>
 *   <li>{@link AnthropicChatModel} — the Claude client (API key + model configured via properties).</li>
 *   <li>{@link QueryParserAiService} — a LangChain4j proxy that converts natural language to
 *       a strongly-typed {@link com.hotelbooking.simplehotelbookingapp.ai.dto.SearchQuery}.</li>
 * </ul>
 *
 * <p>Set the {@code ANTHROPIC_API_KEY} environment variable before starting the application,
 * or override {@code anthropic.api.key} in {@code application.properties}.
 */
@Configuration
public class LangChain4jConfig {

    @Value("${anthropic.api.key}")
    private String apiKey;

    @Value("${anthropic.model-name:claude-3-haiku-20240307}")
    private String modelName;

    @Bean
    public AnthropicChatModel anthropicChatModel() {
        return AnthropicChatModel.builder()
                .apiKey(apiKey)
                .modelName(modelName)
                .maxTokens(512)
                .temperature(0.0)   // deterministic output for structured extraction
                .build();
    }

    @Bean
    public QueryParserAiService queryParserAiService(AnthropicChatModel model) {
        return AiServices.create(QueryParserAiService.class, model);
    }
}

