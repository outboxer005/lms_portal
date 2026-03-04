package com.outlms.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookRequest {
    private String title;
    private String author;
    private String isbn;
    private String publisher;
    private String genre;
    private Integer publicationYear;
    private Integer totalCopies;
    private String description;
    private String coverImageUrl;
    private String frontPageImageUrl;
    private Boolean premiumBook;
}
