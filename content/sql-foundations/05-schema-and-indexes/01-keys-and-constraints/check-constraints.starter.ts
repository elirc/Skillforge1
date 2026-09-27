interface UserRow {
  id: number | null;
  email: string | null;
  age: number | null;
  teamId: number | null;
}

interface TeamRow {
  id: number;
  name: string;
}

// CREATE TABLE users (
//   id      INT           CONSTRAINT PK_users PRIMARY KEY,
//   email   NVARCHAR(256) NOT NULL          -- reported as NN_users_email
//                         CONSTRAINT UQ_users_email UNIQUE,
//   age     INT NULL      CONSTRAINT CK_users_age CHECK (age >= 0),
//   team_id INT NULL      CONSTRAINT FK_users_team REFERENCES teams(id)
// )
// Return the first violated constraint name for INSERT INTO users VALUES (newRow), or null.
export function checkConstraints(users: UserRow[], teams: TeamRow[], newRow: UserRow): string | null {
  if (newRow.age !== null && newRow.age < 0) return "CK_users_age";
  return null;
}
