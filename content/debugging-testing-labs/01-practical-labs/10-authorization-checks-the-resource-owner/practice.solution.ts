export function canEdit(actor: string | null, owner: string): boolean { return actor !== null && actor === owner; }
export function regressionCases() { return [{"args":["alice","bob"],"expected":false},{"args":["alice","alice"],"expected":true},{"args":[null,"bob"],"expected":false}]; }
