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
            // LDAP Operations 
            
            // Search for entries in the directory
            //  searchUser();
            // Call this inside the authentication success callback
            //   searchUser('Mike Johnson');
            
            // Add a new user to the directory
            // addUser();
            // Inside authenticateDN success callback
        //    addUser('jack Smith', 'Smith', 'jsmith', 'secure_password', 'jack.smith@nano.com', 'Developers');
            
            // Delete a user from the directory
            // deleteUser();
            //deleteUser('cn=Bob Green,ou=Developers,ou=Nano,dc=example,dc=com');

            
            // Create a new group
            // createGroup();
            //createGroup("Developers", "Group for all developers");
            // createGroup(
            //     "Developers", 
            //     "Software development team", 
            //     "cn=John Doe,ou=Developers,ou=Nano,dc=example,dc=com"
            // );
            //createGroup("marketing");

            //  listGroupMembers('cn=Administrators,ou=groups,dc=example,dc=com');
        //    listGroupMembers('cn=marketing,ou=groups,dc=example,dc=com');

// Inside your authentication success callback
// deleteUserFromGroup(
//     'cn=Administrators,ou=groups,dc=example,dc=com',
//     'cn=beenie  mac,ou=Developers,ou=Nano,dc=example,dc=com'
// );

            
            // Add a user to an existing group
            // addUserToGroup(
            //    'cn=Administrators,ou=groups,dc=example,dc=com',  
            //    'cn=beenie  mac,ou=Developers,ou=Nano,dc=example,dc=com'
            // );
            // Inside your authentication success callback
// deleteUserFromGroup(
//     'cn=Administrators,ou=groups,dc=example,dc=com',
//     'cn=beenie mac,ou=Developers,ou=Nano,dc=example,dc=com'
// );
            
            // List all members of a group
            // listGroupMembers('cn=Administrators,ou=groups,dc=example,dc=com');
            
            // Call the required function here
            // deleteUserFromGroup(
            //     'cn=Administrators,ou==example,dc=com',
            //     ' cn=Alice Brown,ou=Support,ou=Nano,dc=example,dc=com'
            // );
         // Inside your authentication success callback
            // updateUser(
            //     'cn=Alice Brown,ou=Support,ou=Nano,dc=example,dc=com', 
            //     'mail', 
            //     'alice.updated@nano.com', 
            //     'replace'
            // );

            // searchUser('cn', 'Alice Brown');
            // searchUser('mail', 'alice.brown@nano.com');
            // searchUser('cn', 'Alice Brown', ['mail', 'telephoneNumber', 'title']);



       // compare('cn=Alice Brown,ou=Support,ou=Nano,dc=example,dc=com', 'sn', 'Brown');

        
        
            //check users atributes 
            // checkUserAttributes('cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com');
            
            // compare( 'cn=Sarah Lee,ou=Developers,ou=Finserve,dc=example,dc=com');

            modifyDN('cn=Alice Brown,ou=Support,ou=Nano,dc=example,dc=com', 'cn=Alice Smith');
        }
    });
}

function searchUser(attributeName, attributeValue, returnAttributes = ['sn', 'cn', 'mail', 'uid']) {
    console.log(`Searching for ${attributeName}=${attributeValue}`);

    const opts = {
        filter: `(${attributeName}=${attributeValue})`,
        scope: 'sub',
        attributes: returnAttributes
    };

    client.search('dc=example,dc=com', opts, function (err, res) {
        if (err) { 
            console.error("Error in search:", err);
            return;
        }

        let foundEntries = 0;

        res.on('searchEntry', function (entry) {
            foundEntries++;
            console.log(`\nUser Found (#${foundEntries}):`);
            console.log(`DN: ${entry.dn}`);
            
            if (entry.attributes && entry.attributes.length > 0) {
                console.log("Attributes:");
                entry.attributes.forEach(attr => {
                    console.log(`  ${attr.type}: ${attr.vals.join(', ')}`);
                });
            } else {
                console.log("No attributes returned or user has no attributes.");
            }
        });

        res.on('error', function(err) {
            console.error("Error during search:", err);
        });

        res.on('end', function (result) {
            if (foundEntries === 0) {
                console.log(`No entries found for ${attributeName}=${attributeValue}`);
            }
            console.log(`\nSearch completed. Found ${foundEntries} entries.`);
        });
    });
}

function addUser(cn, sn,uid,password,email,ou) {
    const entry = {
        sn: 'sn',
        cn: 'cn',
        uid: 'uid',
        userPassword: 'password',
        mail: 'email',
        objectclass: ['inetOrgPerson', 'organizationalPerson', 'person', 'top']
    };
    const dn = `cn=${cn},ou=${ou},ou=Nano,dc=example,dc=com`;

    client.add(dn, entry, function (err) {
        if (err) {
            console.log("Error adding user:", err);
        } else {
            console.log(`User ${cn} added successfully with DN: ${dn}`);
        }



    });
}

function deleteUser(dn) {
    client.del(dn , function (err) {
        if (err) {
            console.log("Error deleting user:", err);
        } else {
            console.log("User deleted successfully");
        }
    });
}
function createGroup(groupName, description, initialMember) {
    groupName = groupName || 'DefaultGroup';
    description = description || 'Default Description';
    const defaultMember = 'uid=admin,ou=system';
    
    const entry = {
        objectclass: ['groupOfUniqueNames', 'top'],
        cn: groupName,
        description: description,
        uniqueMember: initialMember || defaultMember
    };

    const dn = `cn=${groupName},ou=groups,dc=example,dc=com`;
    
    client.add(dn, entry, function (err) {
        if (err) {
            console.log(`Error creating group ${groupName}:`, err);
        } else {
            console.log(`Group ${groupName} created successfully with DN: ${dn}`);
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
function updateUser(dn, attributeName, attributeValue, operation = 'add') {
    const change = new ldap.Change({
        operation: operation,
        modification: new ldap.Attribute({
            type: attributeName,
            values: [attributeValue]
        })
    });

    client.modify(dn, change, function (err) {
        if (err) {
            console.log(`Error updating user (${operation} ${attributeName}):`, err);
        } else {
            console.log(`User updated successfully (${operation} ${attributeName}=${attributeValue})`);
        }
    });
}
function updateUserSn(dn) {
    const change = new ldap.Change({
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
function compare(dn, attributeName, expectedValue) {
    console.log(`Comparing ${attributeName} attribute for ${dn}`);
    console.log(`Expected value: "${expectedValue}"`);
    
    client.compare(dn, attributeName, expectedValue, function (err, matched) {
        if (err) {
            console.log(`Error comparing ${attributeName}: ${err}`);
        } else {
            if (matched) {
                console.log(` Match: ${attributeName} equals "${expectedValue}"`);
            } else {
                console.log(`No match: ${attributeName} does NOT equal "${expectedValue}"`);
            }
        }
    });
}

function modifyDN(oldDN, newRDN) {
    console.log("Starting DN modification...");
    console.log("Old DN: " + oldDN);
    console.log("New RDN: " + newRDN);
    
    client.modifyDN(oldDN, newRDN, function (err) {
        if (err) {
            console.log("An error occurred while modifying DN:");
            console.log(err);
        } else {
            console.log("Modification successful!");
            console.log("Entry renamed to: " + newRDN);
        }
    });
}

// Run authentication
authenticateDN("uid=admin,ou=system", "secret");
  