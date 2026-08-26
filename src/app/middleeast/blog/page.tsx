import React from 'react';
import Link from 'next/link';
import mysql from 'mysql2/promise';
import type { Metadata } from "next";
import PageHeader from '@/components/PageHeader';
export const metadata: Metadata = {
  title: "Blogs | JnS Education MiddleEast",
  description: "Stay updated with global education news, university admission guidance, and student visa updates.",
};
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jnsedu-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function getMiddleEastBlogs() {
  try {
    const [rows] = await pool.query(
      `SELECT blogs.*, blog_categories.name AS category_name 
       FROM blogs 
       LEFT JOIN blog_categories ON blogs.category_id = blog_categories.id 
       WHERE blogs.region = 'middleeast' AND blogs.status = 'published' 
       ORDER BY blogs.created_at DESC`
    );
    return rows as any[];
  } catch (error) {
    console.error('Error fetching middleeast blogs:', error);
    return [];
  }
}

export default async function MiddleEastBlogPage() {
  const blogs = await getMiddleEastBlogs();

  return (
    <>
    <PageHeader title='Blogs' />
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-3">
          <h2 className="best-heading font-extrabold text-gray-900 tracking-tight">Middle East Blogs & Insights</h2>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">Latest updates, educational pathways, and study abroad guides for Middle East students.</p>
        </div>

        {blogs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-200 shadow-xs max-w-xl mx-auto">
            <p className="text-gray-500 text-sm font-medium">No Middle East blogs found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {blogs.map((blog) => (
              <article key={blog.id} className="bg-white rounded-3xl overflow-hidden border border-gray-200/85 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div>
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    {blog.cover_image ? (
                      <img src={blog.cover_image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-semibold uppercase tracking-wider">JnS Education</div>
                    )}
                    <span className="absolute top-4 left-4 px-3 py-1 bg-white text-primary border border-primary rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                      {blog.category_name || 'Uncategorized'}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                      <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>By {blog.author_name || 'Admin'}</span>
                    </div>
                    <h2 className="small-heading text-gray-900 group-hover:text-primary transition-colors line-clamp-2">{blog.title}</h2>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Link href={`/middleeast/blog/${blog.slug}`} className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary transition-colors">
                    <span>Read Article</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
    </>
  );
}