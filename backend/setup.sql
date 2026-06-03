create table transactions(
    id integer,
    transactiondata integer,
    transactiontype text,
    title text,
    transactiodate timestampz,
    transactionid serial primary key,
    transactioncategory text
)
create table users(
    id serial primary key,
    email text,
    password text,
    username text,
    registereddate timestamp,
    transactiontypes text[]
)