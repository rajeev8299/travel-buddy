// Who may use the admin panel. Authors and editors only get the Blog section;
// the API enforces the same split on every request.
export const STAFF_ROLES = ["admin", "editor", "author"];
export const isStaff = (role) => STAFF_ROLES.includes(role);
export const ROLE_LABEL = { user: "Traveller", client: "Client", author: "Author", editor: "Editor", admin: "Admin" };
