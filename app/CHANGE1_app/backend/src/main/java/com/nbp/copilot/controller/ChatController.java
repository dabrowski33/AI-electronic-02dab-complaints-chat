package com.nbp.copilot.controller;

import com.nbp.copilot.dto.ChatRequest;
import com.nbp.copilot.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/chat
     * Streaming SSE endpoint — returns text/event-stream.
     * Angular consumes this with EventSource or HttpClient (observe: 'events').
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@Valid @RequestBody ChatRequest request) {
        log.info("Chat request: {} messages, type={}", request.getMessages().size(),
                request.getContext().getRequestType());
        return chatService.streamChat(request);
    }
}
