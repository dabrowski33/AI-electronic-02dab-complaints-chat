package com.nbp.copilot.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AnalyseResponse {
    private ImageAnalysisResult imageAnalysis;
    private AgentDecision decision;
}
