-- NETogether MVP. Flyway location: src/main/resources/db/migration.
-- Demo accounts and their password hashes are created separately in the demo profile.

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(254) NOT NULL UNIQUE,
    password_hash varchar(255) NOT NULL,
    nickname varchar(30) NOT NULL CHECK (char_length(btrim(nickname)) > 0),
    bio varchar(500) NOT NULL DEFAULT '',
    skills text[] NOT NULL DEFAULT '{}',
    github_url varchar(2048) CHECK (github_url LIKE 'https://%'),
    created_at timestamptz NOT NULL DEFAULT now(),
    CHECK (email = lower(btrim(email)) AND char_length(email) > 0),
    CHECK (cardinality(skills) <= 10)
);

CREATE TABLE tags (
    code varchar(20) PRIMARY KEY,
    label varchar(40) NOT NULL
);

INSERT INTO tags (code, label) VALUES
    ('AI', 'AI'),
    ('WEB', '웹'),
    ('APP', '앱'),
    ('DATA', '데이터'),
    ('ALGORITHM', '알고리즘'),
    ('SECURITY', '보안'),
    ('CLOUD', '클라우드');

CREATE TABLE user_interest_tags (
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tag_code varchar(20) NOT NULL REFERENCES tags(code),
    PRIMARY KEY (user_id, tag_code)
);

CREATE TABLE posts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id uuid NOT NULL REFERENCES users(id),
    title varchar(100) NOT NULL CHECK (char_length(btrim(title)) > 0),
    description varchar(4000) NOT NULL CHECK (char_length(btrim(description)) > 0),
    category varchar(20) NOT NULL CHECK (category IN ('COMPETITION', 'CAPSTONE', 'STUDY', 'SIDE_PROJECT')),
    status varchar(10) NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    closed_at timestamptz,
    CHECK ((status = 'CLOSED') = (closed_at IS NOT NULL))
);

CREATE TABLE post_tags (
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_code varchar(20) NOT NULL REFERENCES tags(code),
    PRIMARY KEY (post_id, tag_code)
);

CREATE TABLE post_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    role_code varchar(20) NOT NULL CHECK (role_code IN ('AI', 'BACKEND', 'FRONTEND', 'PRESENTATION', 'DESIGN', 'OTHER')),
    capacity integer NOT NULL CHECK (capacity BETWEEN 1 AND 10),
    UNIQUE (post_id, role_code),
    UNIQUE (post_id, id)
);

CREATE TABLE applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL,
    role_id uuid NOT NULL,
    applicant_id uuid NOT NULL REFERENCES users(id),
    message varchar(500) NOT NULL CHECK (char_length(btrim(message)) > 0),
    status varchar(10) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    decided_at timestamptz,
    FOREIGN KEY (post_id, role_id) REFERENCES post_roles(post_id, id),
    CONSTRAINT uq_application_post_applicant UNIQUE (post_id, applicant_id),
    CHECK ((status = 'PENDING') = (decided_at IS NULL))
);

CREATE TABLE team_spaces (
    post_id uuid PRIMARY KEY REFERENCES posts(id) ON DELETE CASCADE,
    notice varchar(1000),
    chat_url varchar(2048) CHECK (chat_url LIKE 'https://%'),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id uuid NOT NULL UNIQUE REFERENCES applications(id),
    type varchar(30) NOT NULL CHECK (type IN ('APPLICATION_APPROVED', 'APPLICATION_REJECTED')),
    created_at timestamptz NOT NULL DEFAULT now(),
    read_at timestamptz
);

CREATE INDEX idx_posts_status_newest ON posts (status, created_at DESC, id DESC);
CREATE INDEX idx_posts_author_newest ON posts (author_id, created_at DESC, id DESC);
CREATE INDEX idx_post_tags_tag_post ON post_tags (tag_code, post_id);
CREATE INDEX idx_applications_role_status ON applications (role_id, status);
CREATE INDEX idx_applications_post_newest ON applications (post_id, created_at DESC, id DESC);
CREATE INDEX idx_applications_applicant_newest ON applications (applicant_id, created_at DESC, id DESC);
