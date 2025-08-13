-- Posts table schema
CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    image_alt TEXT,
    pub_date TEXT NOT NULL,
    tags TEXT, -- JSON string or comma-separated
    content TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_pub_date ON posts(pub_date);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);