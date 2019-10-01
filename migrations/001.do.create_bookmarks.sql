CREATE TABLE bookmarks(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    RATING DECIMAL(10,2) NOT NULL
);