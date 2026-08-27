export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import mysql from 'mysql2/promise';
import type { Metadata } from "next";
import PageHeader from '@/components/PageHeader';

export const metadata: Metadata = {
  title: "Blogs | JnS Education",
  description: "Stay updated with global education news, university admission guidance, and student visa updates.",
};

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jnsedu-db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000, // 30 seconds timeout to prevent Vercel 500 errors
  queueLimit: 0,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined
});

async function getGeneralBlogs() {
  try {
    const [rows] = await pool.query(
      `SELECT blogs.*, blog_categories.name AS category_name 
       FROM blogs 
       LEFT JOIN blog_categories ON blogs.category_id = blog_categories.id 
       WHERE LOWER(blogs.region) = 'general' AND LOWER(blogs.status) = 'published' 
       ORDER BY blogs.created_at DESC`
    );
    return rows as any[];
  } catch (error) {
    console.error('Error fetching general blogs:', error);
    return [];
  }
}