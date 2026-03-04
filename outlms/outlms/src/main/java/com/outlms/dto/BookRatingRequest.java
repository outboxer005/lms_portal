package com.outlms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRatingRequest {
    /**
     * The issuance that is being reviewed (used to verify the student returned it).
     */
    private Long issuanceId;
    /** 1–5 star rating. */
    private Integer rating;
    /** Optional written comment. */
    private String review;
}
