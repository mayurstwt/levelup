const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const authRoutes = require('../routes/auth');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Auth Endpoints', () => {
    beforeAll(async () => {
        const uri = 'mongodb://localhost:27017/level_up_test_db';
        await mongoose.connect(uri);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('should register a new user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                name: 'Test Setup User',
                email: 'testauth@example.com',
                password: 'password123',
                role: 'buyer'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('token');
        expect(res.body.user).toHaveProperty('email', 'testauth@example.com');
    });

    it('should login an existing user successfully', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({
                email: 'testauth@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
    });
});
