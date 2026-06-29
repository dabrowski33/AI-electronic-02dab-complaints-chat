package com.nbp.copilot.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ChatRequest {

    @NotNull
    private List<ChatMessage> messages;

    @NotNull
    private ChatContext context;

    @Data
    public static class ChatMessage {
        /** "user" or "assistant" */
        private String role;
        private String content;
    }

    @Data
    public static class ChatContext {
        private String requestType;
        private String equipmentCategory;
        private String equipmentModel;
        private String purchaseDate;
        private String complaintReason;
        private String imageConditionSummary;
        private String decisionResult;
        private String decisionJustification;
        private List<String> rulesApplied;
    }
}
