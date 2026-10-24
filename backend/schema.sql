-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Developers Table (caches GitHub profile info to minimize API calls)
CREATE TABLE IF NOT EXISTS developers (
    id SERIAL PRIMARY KEY,
    github_username VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    followers INT,
    public_repos INT,
    fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Repositories Table (caches repository stats for comparison)
CREATE TABLE IF NOT EXISTS repos (
    id SERIAL PRIMARY KEY,
    developer_id INT REFERENCES developers(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    stars INT DEFAULT 0,
    primary_language VARCHAR(100),
    pushed_at TIMESTAMP,
    CONSTRAINT unique_dev_repo UNIQUE (developer_id, name)
);

-- Create Comparisons Table (saved user comparisons)
CREATE TABLE IF NOT EXISTS comparisons (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction Table linking comparisons to multiple developers
CREATE TABLE IF NOT EXISTS comparison_devs (
    comparison_id INT REFERENCES comparisons(id) ON DELETE CASCADE,
    developer_id INT REFERENCES developers(id) ON DELETE CASCADE,
    PRIMARY KEY (comparison_id, developer_id)
);

-- Create Pins & Notes Table (CRUD for user's favorite repos)
CREATE TABLE IF NOT EXISTS pins (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    repo_id INT REFERENCES repos(id) ON DELETE CASCADE,
    note TEXT,
    tags VARCHAR(255),
    CONSTRAINT unique_user_repo_pin UNIQUE (user_id, repo_id)
);