package com.nbp.copilot.service;

import com.nbp.copilot.dto.ChatRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatModel;  // ChatModel extends StreamingChatModel in 1.0.x
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatModel chatModel;

    public Flux<String> streamChat(ChatRequest request) {
        List<Message> messages = new ArrayList<>();
        messages.add(new SystemMessage(buildSystemPrompt(request.getContext())));
        messages.addAll(toSpringMessages(request.getMessages()));

        return chatModel.stream(new Prompt(messages))
                .map(response -> response.getResult().getOutput().getText())
                .filter(text -> text != null && !text.isEmpty());
    }

    private String buildSystemPrompt(ChatRequest.ChatContext ctx) {
        return """
                Jesteś asystentem NBP obsługującym zgłoszenia serwisowe sprzętu.
                Pomagasz pracownikom w procesie obsługi %s.

                Dane zgłoszenia:
                - Typ: %s
                - Kategoria: %s
                - Model: %s
                - Data zakupu: %s
                - Powód (jeśli reklamacja): %s

                Analiza zdjęcia: %s
                Decyzja: %s
                Uzasadnienie: %s

                Odpowiadaj tylko na pytania związane z tym zgłoszeniem. Kieruj się procedurami NBP.
                """.formatted(
                ctx.getRequestType(),
                ctx.getRequestType(),
                ctx.getEquipmentCategory(),
                ctx.getEquipmentModel(),
                ctx.getPurchaseDate(),
                ctx.getComplaintReason() != null ? ctx.getComplaintReason() : "—",
                ctx.getImageConditionSummary(),
                ctx.getDecisionResult(),
                ctx.getDecisionJustification()
        );
    }

    private List<Message> toSpringMessages(List<ChatRequest.ChatMessage> messages) {
        return messages.stream().map(m -> switch (m.getRole()) {
            case "user" -> (Message) new UserMessage(m.getContent());
            case "assistant" -> new AssistantMessage(m.getContent());
            default -> new UserMessage(m.getContent());
        }).collect(Collectors.toList());
    }
}
