jest.mock("ldapjs", () => ({
    createClient: jest.fn(() => ({
        bind: jest.fn((dn, password, callback) => callback(null)), // Mock bind success
    })),
}));

const ldap = require("ldapjs");

test("LDAP Authentication Success", (done) => {
    const client = ldap.createClient();

    client.bind("uid=admin,ou=system", "secret", (err) => {
        expect(err).toBeNull(); 
        done();
    });
});
