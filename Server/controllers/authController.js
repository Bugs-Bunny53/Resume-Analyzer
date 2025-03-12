const router = require("../routers/routers");
const express = require("express");
const { User } = require("../data/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authenticationController = {};
