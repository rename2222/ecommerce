package com.example.demo.entity;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "ecommerce")
@Data
public class Product {
    @Id
     private String ProductId;
    private String  proname;
    private String discription;
    private int price ;
    private int  quantity;
    private String  category;
    @Data
    public static class CategoryInfo{
        private String id ;
        private String name ;

    }

}
