const express = require('express');
const ldap = require('ldapjs');

const app = express();
const PORT = 3000;

app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}`);
});

const client = ldap.createClient({
    url: 'ldap://127.0.0.1:10389' 
});

function authenticateDN(username, password) {
    client.bind(username, password, function (err) {
        if (err) {
            console.log('Error in LDAP authentication:', err);
        } else {
            console.log("Authentication successful");
            // === LDAP Operations - Uncomment as needed ===
            
            // Search for entries in the directory
            // searchUser();
            
            // Add a new user to the directory
            // addUser();
            
            // Delete a user from the directory
            // deleteUser();
            
            // Create a new group
            // createGroup();
            
            // Add a user to an existing group
            // addUserToGroup(
            //     'cn=Administrators,ou=groups,dc=example,dc=com',  
            //     'cn=Bob Green,ou=Developers,ou=Nano,dc=example,dc=com'
            // );
            
            // List all members of a group
            // listGroupMembers('cn=Administrators,ou=groups,dc=example,dc=com');
            
            // Call the required function here
            // deleteUserFromGroup(
            //     'cn=Administrators,ou==example,dc=com',
            //     ' cn=Alice Brown,ou=Support,ou=Nano,dc=example,dc=com'
            // );
            // updateUser('cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com')
         //
        //  compare('cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com');        
            //check users atributes 
            // checkUserAttributes('cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com');
            
            compare( 'cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com');
        }
    });
}

function searchUser() {  
    console.log("Searching users in LDAP...");

    const opts = {
        filter: '(objectClass=*)',  
        scope: 'sub',                    
        attributes: ['sn', 'cn']  
    };

    client.search('dc=example,dc=com', opts, function (err, res) {
        if (err) { 
            console.error("Error in search:", err);
            client.unbind();
            return;
        }

        res.on('searchEntry', function (entry) {
            console.log('Entry Found:', entry.dn);
            entry.attributes.forEach(attr => {
                console.log(`${attr.type}: ${attr.vals.join(', ')}`);
            });
        });

        res.on('end', function () {
            console.log('Search completed.');
            client.unbind();
        });
    });
}

function addUser() {
    const entry = {
        sn: 'bar',
        cn: 'tommy',
        uid: 'btommy',
        userPassword: 'password123',
        mail: 'john.smith@nano.com',
        objectclass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top']
    };

    client.add('cn=tommy,ou=Developers,ou=Nano,dc=example,dc=com', entry, function (err) {
        if (err) {
            console.log("Error adding user:", err);
        } else {
            console.log("User added successfully");
        }
    });
}

function deleteUser() {
    client.del('cn=tommy,ou=Developers,ou=Nano,dc=example,dc=com', function (err) {
        if (err) {
            console.log("Error deleting user:", err);
        } else {
            console.log("User deleted successfully");
        }
    });
}

function createGroup() {
    const entry = {
        objectclass: ['groupOfUniqueNames', 'top'],
        cn: 'Administrators',
        description: 'Admin group',
        uniqueMember: 'uid=admin,ou=system'
    };

    client.add('cn=Administrators,ou=groups,dc=example,dc=com', entry, function (err) {
        if (err) {
            console.log("Error creating group:", err);
        } else {
            console.log("Group created successfully");
        }
    });
}

function listGroupMembers(groupDN) {
    console.log(`Listing members for group: ${groupDN}`);

    client.search(groupDN, { scope: 'base', attributes: ['uniqueMember'] }, function (err, res) {
        if (err) {
            console.log("Error retrieving group:", err);
            return;
        }

        res.on('searchEntry', function (entry) {
            console.log("Group entry found");
            entry.attributes.forEach(attr => {
                if (attr.type === 'uniqueMember') {
                    console.log("Members:");
                    attr.values.forEach((member, index) => {
                        console.log(`  ${index + 1}. ${member}`);
                    });
                }
            });
        });

        res.on('end', function () {
            console.log("Search completed");
        });
    });
}

function addUserToGroup(groupDN, userDN) {
    client.search(groupDN, { scope: 'base', attributes: ['uniqueMember'] }, function (err, res) {
        if (err) {
            console.log("Error searching group:", err);
            return;
        }

        let currentMembers = [];

        res.on('searchEntry', function (entry) {
            entry.attributes.forEach(attr => {
                if (attr.type === 'uniqueMember') {
                    currentMembers = attr.values;
                }
            });
        });

        res.on('end', function () {
            if (currentMembers.includes(userDN)) {
                console.log("User is already a member of the group");
                return;
            }

            currentMembers.push(userDN);

            const change = new ldap.Change({
                operation: 'replace',
                modification: new ldap.Attribute({ type: 'uniqueMember', values: currentMembers })
            });

            client.modify(groupDN, change, function (err) {
                if (err) {
                    console.log("Error modifying group:", err);
                } else {
                    console.log("User added to group successfully");
                }
            });
        });
    });
}

function deleteUserFromGroup(groupDN, userDN) {
    client.search(groupDN, { scope: 'base', attributes: ['uniqueMember'] }, function (err, res) {
        if (err) {
            console.log("Error searching group:", err);
            return;
        }

        let currentMembers = [];

        res.on('searchEntry', function (entry) {
            entry.attributes.forEach(attr => {
                if (attr.type === 'uniqueMember') {
                    currentMembers = attr.values;
                }
            });
        });

        res.on('end', function () {
            if (!currentMembers.includes(userDN)) {
                console.log("User is not in the group");
                return;
            }

            currentMembers = currentMembers.filter(member => member !== userDN);

            const change = new ldap.Change({
                operation: 'replace',
                modification: new ldap.Attribute({ type: 'uniqueMember', values: currentMembers })
            });

            client.modify(groupDN, change, function (err) {
                if (err) {
                    console.log("Error deleting user from group:", err);
                } else {
                    console.log("User deleted from group successfully");
                }
            });
        });
    });
}
function updateUser(dn) {
    var change = new ldap.Change({
        operation: 'add',
        modification: new ldap.Attribute({
            type: 'displayName',
            values: ['657']
        })
    });

    client.modify(dn, change, function (err) {
        if (err) {
            console.log("Error updating user:", err);
        } else {
            console.log("User updated successfully");
        }
    });
}
function updateUserSn(dn) {
    var change = new ldap.Change({
        operation: 'replace',
        modification: new ldap.Attribute({
            type: 'sn',
            values: ['657']
        })
    });

    client.modify(dn, change, function(err) {
        if (err) {
            console.log("Error updating user sn:", err);
        } else {
            console.log("User sn updated successfully");
            // Now run the compare
            compare(dn);
        }
    });
}
function checkUserAttributes(dn) {
    client.search(dn, {
        scope: 'base',
        attributes: ['sn']
    }, function(err, res) {
        if (err) {
            console.log("Error searching user:", err);
            return;
        }
        
        res.on('searchEntry', function(entry) {
            console.log("User attributes:");
            entry.attributes.forEach(attr => {
                console.log(`${attr.type}: ${attr.vals.join(', ')}`);
            });
        });
    });
}
function compare(dn) {
    client.compare(dn, 'sn', '657', function (err, matched) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :" + matched);
        }
    });
}

/*use this to modify the dn of existing user*/
function modifyDN(dn) {

    client.modifyDN(dn, 'cn=ba4r', function (err) {
        if (err) {
            console.log("err in update user " + err);
        } else {
            console.log("result :");
        }
    });
}






// Run authentication
authenticateDN("uid=admin,ou=system", "secret");
