create table UserAvatars (
  id int not null generated by default as identity constraint UserAvatars_PK primary key,
  large varchar(255),
  medium varchar(255),
  thumbnail varchar(255)
);