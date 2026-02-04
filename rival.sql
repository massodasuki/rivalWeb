-- USERS
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    skill_level INT,
    location VARCHAR(500), -- latitude/longitude
    sport_preferences TEXT[],         -- array of sports
    created_at TIMESTAMP DEFAULT NOW()
);

-- FRIENDSHIPS
CREATE TABLE friendships (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    friend_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- TEAMS
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    sport VARCHAR(50) NOT NULL,
    captain_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- TEAM MEMBERS
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player', -- player, captain
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- TEAM INVITATIONS
CREATE TABLE team_invitations (
    id SERIAL PRIMARY KEY,
    team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    invited_email VARCHAR(100) NOT NULL,
    inviter_id INT REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(team_id, invited_email, status)
);

-- MATCHES
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    home_team_id INT REFERENCES teams(id) ON DELETE CASCADE,
    away_team_id INT REFERENCES teams(id),
    home_team_name VARCHAR(100),
    away_team_name VARCHAR(100),
    sport VARCHAR(50) NOT NULL,
    location VARCHAR(500),
    scheduled_at TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, completed, cancelled
    max_players INT DEFAULT 10,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Migration: Add new columns to existing matches table
-- ALTER TABLE matches ADD COLUMN home_team_name VARCHAR(100);
-- ALTER TABLE matches ADD COLUMN away_team_name VARCHAR(100);
-- ALTER TABLE matches ADD COLUMN max_players INT DEFAULT 10;
-- ALTER TABLE matches ADD COLUMN description VARCHAR(500);

-- MATCH PARTICIPANTS
CREATE TABLE match_participants (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'player', -- player, substitute
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, user_id)
);

-- MATCH STATS
CREATE TABLE match_stats (
    id SERIAL PRIMARY KEY,
    match_id INT REFERENCES matches(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    rating INT,
    UNIQUE(match_id, user_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- match_invite, team_invite, announcement
    message TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- CHAT ROOMS
CREATE TABLE chat_rooms (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20), -- team, match, community
    name VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- CHAT MESSAGES
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    room_id INT REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- COMMUNITY POSTS
CREATE TABLE community_posts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200),
    content TEXT,
    type VARCHAR(50) DEFAULT 'discussion', -- discussion, announcement
    created_at TIMESTAMP DEFAULT NOW()
);

-- LEADERBOARDS / ACHIEVEMENTS
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50), -- win_streak, total_goals, ranking
    value INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);
