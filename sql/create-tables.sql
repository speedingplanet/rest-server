drop table Transactions;

drop table Users;

create table Users (
  id int generated by default as identity (start with 500) constraint Users_PK primary key,
  userVersion int not null default 1,
  active boolean not null default true,
  lastUpdated timestamp not null default current timestamp,
  displayName varchar(255) not null,
  zipPayId varchar(12) not null constraint Users_CK_zipPayId unique,
  email varchar(50),
  street varchar(255),
  city varchar(100),
  province varchar(100),
  postalCode varchar(10),
  country varchar(255),
  largeAvatar varchar(255),
  mediumAvatar varchar(255),
  thumbnailAvatar varchar(255),
  userType varchar(20) not null default 'person' constraint Users_CK_userType check (userType in ('person', 'corporation'))
);

create table Transactions (
  id int generated by default as identity (start with 2000) constraint Transactions_PK primary key,
  payorId varchar(12) not null constraint Transactions_CK_payorId references Users(zipPayId),
  payeeId varchar(12) not null constraint Transactions_CK_payeeId references Users(zipPayId),
  amount decimal(5, 2) not null,
  txDate timestamp not null default current timestamp,
  txType varchar(20) not null default 'payment' constraint Transactions_CK_txType check (txType in ('payment', 'charge')),
  txStatus varchar(20) not null default 'open' constraint Transactions_CK_txStatus check (txStatus in ('open', 'settled')),
  reason varchar(2048),
  visibility varchar(20) not null default 'public' constraint Transactions_CK_visibility check (visibility in ('public', 'private')),
  txVersion int default 1,
  active boolean not null default true,
  lastUpdated timestamp not null default current timestamp
);