package com.nbp.copilot.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnalyseRequest {

    @NotBlank
    @Pattern(regexp = "reklamacja|zwrot")
    private String requestType;

    @NotBlank
    private String equipmentCategory;

    @NotBlank
    @Size(max = 200)
    private String equipmentModel;

    @NotBlank
    private String purchaseDate;

    @Size(max = 2000)
    private String complaintReason;

    /** Base64-encoded image (JPEG/PNG/WebP, max 10 MB before encoding). */
    @NotBlank
    private String imageBase64;

    @NotBlank
    @Pattern(regexp = "image/jpeg|image/png|image/webp")
    private String imageMimeType;
}
