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
  // PRIMARY KEY = NOT NULL + UNIQUE
  if (newRow.id === null || users.some((user) => user.id === newRow.id)) return "PK_users";

  if (newRow.email === null) return "NN_users_email";
  if (users.some((user) => user.email === newRow.email)) return "UQ_users_email";

  // CHECK rejects only FALSE; NULL >= 0 is UNKNOWN and passes.
  if (newRow.age !== null && !(newRow.age >= 0)) return "CK_users_age";

  // A NULL foreign key is not checked.
  if (newRow.teamId !== null && !teams.some((team) => team.id === newRow.teamId)) return "FK_users_team";

  return null;
}
