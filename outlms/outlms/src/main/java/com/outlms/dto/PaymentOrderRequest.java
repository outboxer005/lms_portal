package com.outlms.dto;

import com.outlms.entity.PaymentType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderRequest {

    private PaymentType paymentType;
    private Double amount;
    private Long referenceId;  // BookIssuance ID or StudentMembership ID
    private String description;
}
