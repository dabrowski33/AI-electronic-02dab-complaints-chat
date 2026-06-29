package com.nbp.copilot.dto;

import lombok.Data;
import java.util.List;

@Data
public class AgentDecision {
    /** "zaakceptowano" | "odrzucono" | "wymaga_weryfikacji" */
    private String decision;
    private String justification;
    private List<String> rulesApplied;
    private List<String> nextSteps;
    private String disclaimer;
}
