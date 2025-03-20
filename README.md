# LDAP Node.js Client

A comprehensive Node.js client implementation for interacting with LDAP directories, specifically optimized for Apache Directory Server.

## Overview

This repository contains a Node.js LDAP client that provides robust functionality for authentication, user management, group management, and attribute manipulation. It's designed to work seamlessly with Apache Directory Server but can be adapted for other LDAP servers.

## Features

- **Authentication**: Secure user authentication against LDAP directory
- **User Management**: Add, delete, and update user entries
- **Group Management**: Create groups, add/remove members, list group members
- **Directory Operations**: Search, compare, and modify entries
- **Attribute Handling**: Add, modify, and compare entry attributes
- **DN Management**: Modify distinguished names

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Apache Directory Server (v2.0.0+)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ldap-nodejs-client.git
cd ldap-nodejs-client
```

2. Install dependencies:
```bash
npm install express ldapjs
```

Or simply:
```bash
npm install
```
This will install both Express and LDAP.js packages defined in the package.json file.

## Setting Up the LDAP Server

### Apache Directory Server Setup

1. Download and install [Apache Directory Studio](https://directory.apache.org/studio/)
2. Create a new server:
   - Open Apache Directory Studio
   - Go to the Servers tab
   - Click "New Server"
   - Select "ApacheDS" and click Next
   - Name your server and set port to 10389
   - Finish and start the server

3. Create directory structure:
   - Navigate to LDAP Browser view
   - Connect to your server
   - Create organizational units:
     - ou=Groups,dc=example,dc=com
     - ou=Nano,dc=example,dc=com
     - ou=Developers,ou=Nano,dc=example,dc=com

## Configuration

Modify the LDAP connection settings in `app.js`:

```javascript
const client = ldap.createClient({
    url: 'ldap://127.0.0.1:10389'  // Change to your LDAP server address
});
```

## Usage

### Running the Application

```bash
node app.js
```

You should see: `Server started on port 3000` followed by the LDAP operations output.

### Core Functions

To perform operations, modify the `authenticateDN` function in `app.js` to call the desired functions:

#### Authentication

```javascript
authenticateDN("uid=admin,ou=system", "secret");
```

#### Adding a User

```javascript
addUser();
```

#### Creating a Group

```javascript
createGroup();
```

#### Adding a User to a Group

```javascript
addUserToGroup(
  'cn=Administrators,ou=groups,dc=example,dc=com',  
  'cn=Bob Green,ou=Developers,ou=Nano,dc=example,dc=com'
);
```

#### Searching Users

```javascript
searchUser();
```

#### Listing Group Members

```javascript
listGroupMembers('cn=Administrators,ou=groups,dc=example,dc=com');
```

## Common Issues and Troubleshooting

### "No Such Object" Error
This means the parent container doesn't exist. Make sure all parent OUs in the path exist before creating entries.

### "Attribute Or Value Exists" Error
This occurs when adding a duplicate attribute or value. Use 'replace' operation instead of 'add' to update existing attributes.

### Authentication Failures
Verify username and password. For Apache DS, default admin credentials are:
- Username: uid=admin,ou=system
- Password: secret

### Case Sensitivity Issues
LDAP DNs are case-sensitive. Ensure consistent casing in all paths (e.g., 'ou=Groups' vs 'ou=groups').

## Examples

### Complete User Management Flow

```javascript
// First authenticate
authenticateDN("uid=admin,ou=system", "secret");

// Then add a new user
addUser();

// Update the user's attributes
updateUser('cn=tommy,ou=Developers,ou=Nano,dc=example,dc=com');

// Add the user to a group
addUserToGroup(
  'cn=Administrators,ou=groups,dc=example,dc=com',
  'cn=tommy,ou=Developers,ou=Nano,dc=example,dc=com'
);

// List group members to verify
listGroupMembers('cn=Administrators,ou=groups,dc=example,dc=com');
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.