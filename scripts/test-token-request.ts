import 'reflect-metadata';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';

dotenv.config();

(async ()=>{
  const secret = process.env.JWT_SECRET || 'secret';
  const token = jwt.sign({ id: '1' }, secret, { expiresIn: '7d' });
  console.log('Token:', token);
  const res = await fetch('http://localhost:5000/api/subscriptions/mine', {
    method: 'GET', headers: { Authorization: `Bearer ${token}` },
  });
  console.log('Status', res.status);
  const txt = await res.text();
  console.log('Body', txt.slice(0,1000));
})();
