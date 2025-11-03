package com.example.demo.entity;

import com.mongodb.client.model.Collation;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection="user")
@Data
public class user {
    @Id
    private String id;
    private String usernme ;
    private String email;
    private String password ;
    private String role ;
    private boolean enabled = true;
    public user(String username , String email , String password ,String role ){
        this.email = email;
        this.role= role;
        this.usernme = username;
        this.password= password;
    }
}
