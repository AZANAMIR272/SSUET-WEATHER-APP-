create database WeatherzDB;
use WeatherzDB;

CREATE TABLE WeatherRecords (
  id INT IDENTITY(1,1) PRIMARY KEY,
  city VARCHAR(100),
  country VARCHAR(50),
  temp FLOAT,
  temp_min FLOAT,
  temp_max FLOAT,
  feels_like FLOAT,
  humidity INT,
  pressure INT,
  wind_speed FLOAT,
  weather_main VARCHAR(50),
  weather_description VARCHAR(255),
  recorded_at DATETIME DEFAULT GETDATE()
);
select *from WeatherRecords;

INSERT INTO WeatherRecords(city, country, temp, temp_min, temp_max, feels_like, humidity, pressure, wind_speed, weather_main, weather_description, recorded_at)
VALUES
('New York', 'US', 25.4, 22.0, 28.5, 26.0, 65, 1013, 5.5, 'Clear', 'Clear sky', '2025-05-23T12:30:00'),
('Los Angeles', 'US', 27.8, 25.0, 30.0, 28.0, 55, 1010, 4.2, 'Sunny', 'Sunny day', '2025-05-22T10:15:00'),
('London', 'UK', 15.2, 13.0, 17.5, 14.5, 75, 1015, 3.1, 'Clouds', 'Partly cloudy', '2025-05-21T16:45:00');


CREATE TABLE Admins (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE, 
    password_hash NVARCHAR(255) NOT NULL, 
    email NVARCHAR(100) UNIQUE, 
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE NewsletterSubscriptions (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME DEFAULT GETDATE()
);

INSERT INTO Admins (username, password_hash, email)
VALUES
('admin1', 'hash12345', 'admin1@example.com'),
('admin2', 'hash67890', 'admin2@example.com'),
('superadmin', 'superhash54321', 'superadmin@example.com');

INSERT INTO NewsletterSubscriptions (email)
VALUES
('subscriber1@example.com'),
('subscriber2@example.com'),
('subscriber3@example.com'),
('subscriber4@example.com'),
('subscriber5@example.com');
INSERT INTO Admins (username, password_hash, email) VALUES ('admin', '$2b$10$XQoYMqMTK8LvdxXYG3nZ4Tz+uC4A/g+f+A+B+C+D+E+F+G+H+I+J+K+L+M', 'admin@example.com');
select * from Admins;



IF OBJECT_ID('Admins', 'U') IS NOT NULL
DROP TABLE Admins;




CREATE TABLE Admins (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL,
    password NVARCHAR(50) NOT NULL, 
    email NVARCHAR(100) ,
    created_at DATETIME DEFAULT GETDATE()
);

INSERT INTO Admins (username, password, email) VALUES
('testadmin', 'testpass', 'testadmin@example.com'),
('adminuser', 'adminpass', 'admin.user@domain.com');

CREATE TABLE NewsletterSubscriptions (
    id INT PRIMARY KEY IDENTITY(1,1),
    email NVARCHAR(255) NOT NULL UNIQUE,
    subscribed_at DATETIME DEFAULT GETDATE()
);

INSERT INTO NewsletterSubscriptions (email) VALUES
('john.doe@example.com'),
('jane.smith@mail.com'),
('newsletter.fan@web.net');


drop table Admins;
