jest.mock("ldapjs"); // Mock ldapjs

const ldap = require("ldapjs");
const { authenticateDN, searchUser, addUser, deleteUser, createGroup, addUserToGroup, deleteUserFromGroup, listGroupMembers, updateUser } = require("../your-ldap-module"); // Adjust path accordingly

describe("LDAP Operations", () => {
    let client;

    beforeEach(() => {
        client = {
            bind: jest.fn((dn, password, callback) => callback(null)),
            search: jest.fn((base, options, callback) => {
                const res = {
                    on: (event, handler) => {
                        if (event === "searchEntry") handler({ dn: "cn=John Doe,dc=example,dc=com" });
                        if (event === "end") handler();
                    }
                };
                callback(null, res);
            }),
            add: jest.fn((dn, entry, callback) => callback(null)),
            del: jest.fn((dn, callback) => callback(null)),
            modify: jest.fn((dn, change, callback) => callback(null)),
        };
        ldap.createClient.mockReturnValue(client);
    });

    test("LDAP Authentication Success", (done) => {
        authenticateDN("uid=admin,ou=system", "secret");
        expect(client.bind).toHaveBeenCalledWith("uid=admin,ou=system", "secret", expect.any(Function));
        done();
    });

    test("Search User", (done) => {
        searchUser("cn", "John Doe");
        expect(client.search).toHaveBeenCalled();
        done();
    });

    test("Add User", (done) => {
        addUser("John Doe", "Doe", "jdoe", "password", "jdoe@example.com", "Developers");
        expect(client.add).toHaveBeenCalled();
        done();
    });

    test("Delete User", (done) => {
        deleteUser("cn=John Doe,dc=example,dc=com");
        expect(client.del).toHaveBeenCalled();
        done();
    });

    test("Create Group", (done) => {
        createGroup("Developers", "Software Dev Group");
        expect(client.add).toHaveBeenCalled();
        done();
    });

    test("Add User to Group", (done) => {
        addUserToGroup("cn=Developers,ou=groups,dc=example,dc=com", "cn=John Doe,dc=example,dc=com");
        expect(client.modify).toHaveBeenCalled();
        done();
    });

    test("Delete User from Group", (done) => {
        deleteUserFromGroup("cn=Developers,ou=groups,dc=example,dc=com", "cn=John Doe,dc=example,dc=com");
        expect(client.modify).toHaveBeenCalled();
        done();
    });

    test("Update User Attribute", (done) => {
        updateUser("cn=John Doe,dc=example,dc=com", "mail", "newemail@example.com", "replace");
        expect(client.modify).toHaveBeenCalled();
        done();
    });
});
