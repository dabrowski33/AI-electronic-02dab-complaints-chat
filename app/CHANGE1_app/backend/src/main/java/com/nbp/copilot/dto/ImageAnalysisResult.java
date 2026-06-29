package com.nbp.copilot.dto;

import lombok.Data;

@Data
public class ImageAnalysisResult {
    /** "ok" or "unreadable" */
    private String status;
    private String conditionSummary;
    private boolean damagePresent;
    private String damageType;
    /** "manufacturing_defect" | "user_damage" | "wear_and_tear" | "unknown" | null */
    private String likelyCause;
    private Boolean signsOfUse;
    private Boolean resalable;
    private String unreadableReason;
}
