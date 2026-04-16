CREATE TABLE posts (
  id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  account_id VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  thumbnail VARCHAR(2048),

  category_id SMALLINT,

  published_at TIMESTAMPTZ,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,

  CONSTRAINT fk_posts_account
    FOREIGN KEY (account_id) REFERENCES accounts(account_id),

  CONSTRAINT fk_posts_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,

  CONSTRAINT uq_posts_account_slug
    UNIQUE (account_id, slug)
);