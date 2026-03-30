CREATE DATABASE upx_5_stoky_easy;

USE upx_5_stoky_easy;

CREATE TABLE users(
	id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_email VARCHAR(150) NOT NULL,
    user_password VARCHAR(150) NOT NULL,
    full_name VARCHAR(100) NOT NULL, 
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    INDEX(deleted_at, user_email, user_password)
);