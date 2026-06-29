package com.nbp.copilot.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nbp.copilot.dto.AnalyseRequest;
import com.nbp.copilot.dto.ImageAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.content.Media;  // renamed in Spring AI 1.0.x (was org.springframework.ai.model.Media)
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeType;

import java.util.Base64;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageAnalysisService {

    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    @Value("${openrouter.vision-model:openai/gpt-5.4-mini}")
    private String visionModel;

    public ImageAnalysisResult analyse(AnalyseRequest request) {
        byte[] imageBytes = Base64.getDecoder().decode(request.getImageBase64());
        MimeType mimeType = MimeType.valueOf(request.getImageMimeType());

        // Spring AI 1.0.x builder pattern for UserMessage with media
        var imageMedia = new Media(mimeType, new ByteArrayResource(imageBytes));
        var userMessage = UserMessage.builder()
                .text(buildPrompt(request))
                .media(List.of(imageMedia))
                .build();

        var response = chatModel.call(new Prompt(userMessage));
        String content = response.getResult().getOutput().getText();
        log.debug("Vision model response: {}", content);

        return parseResult(content);
    }

    private String buildPrompt(AnalyseRequest request) {
        String type = "reklamacja".equals(request.getRequestType()) ? "complaint" : "return";
        return """
                Analyse the equipment photo for a %s request.
                Return JSON only (no markdown) with fields:
                status ("ok"|"unreadable"), conditionSummary, damagePresent (boolean),
                damageType (string|null), likelyCause ("manufacturing_defect"|"user_damage"|"wear_and_tear"|"unknown"|null),
                signsOfUse (boolean|null), resalable (boolean|null), unreadableReason (string|null).
                """.formatted(type);
    }

    private ImageAnalysisResult parseResult(String json) {
        try {
            String cleaned = json.replaceAll("```json\\s*", "").replaceAll("```\\s*", "").trim();
            return objectMapper.readValue(cleaned, ImageAnalysisResult.class);
        } catch (Exception e) {
            log.error("Failed to parse image analysis response", e);
            var fallback = new ImageAnalysisResult();
            fallback.setStatus("unreadable");
            fallback.setUnreadableReason("Could not parse model response");
            return fallback;
        }
    }
}
