package com.nbp.copilot.controller;

import com.nbp.copilot.dto.AnalyseRequest;
import com.nbp.copilot.dto.AnalyseResponse;
import com.nbp.copilot.dto.ImageAnalysisResult;
import com.nbp.copilot.service.ImageAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AnalyseController {

    private final ImageAnalysisService imageAnalysisService;

    /**
     * POST /api/analyse
     * Accepts form data + base64 image, runs vision + decision agent, returns decision.
     */
    @PostMapping("/analyse")
    public ResponseEntity<?> analyse(@Valid @RequestBody AnalyseRequest request) {
        log.info("Analyse request: type={}, model={}", request.getRequestType(), request.getEquipmentModel());

        ImageAnalysisResult imageAnalysis = imageAnalysisService.analyse(request);

        if ("unreadable".equals(imageAnalysis.getStatus())) {
            return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                    .body(Map.of("error", "unreadable_image", "reason", imageAnalysis.getUnreadableReason()));
        }

        // TODO: call decision agent service (ADR-003)
        var placeholderDecision = new com.nbp.copilot.dto.AgentDecision();
        placeholderDecision.setDecision("wymaga_weryfikacji");
        placeholderDecision.setJustification("Decision agent not yet implemented.");
        placeholderDecision.setRulesApplied(java.util.List.of());
        placeholderDecision.setNextSteps(java.util.List.of("Skontaktuj się z przełożonym"));
        placeholderDecision.setDisclaimer("Decyzja wygenerowana przez AI — wymaga weryfikacji człowieka.");

        return ResponseEntity.ok(new AnalyseResponse(imageAnalysis, placeholderDecision));
    }
}
