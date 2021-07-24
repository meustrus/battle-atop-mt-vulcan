<?php

require_once 'getdb.php';

getdb()->query(<<<SQL
  CREATE TABLE IF NOT EXISTS players (
    username varchar(32) NOT NULL,
    lastaccess datetime,
    gameid bigint NULL,
    level int NOT NULL DEFAULT 0,
    action varchar(255) NULL,
    PRIMARY KEY (username)
  )
SQL
);
