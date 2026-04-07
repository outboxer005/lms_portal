# SQL Server Setup Guide for Library Management System

## Prerequisites
- SQL Server installed and running
- TCP/IP protocol enabled for SQL Server
- Database created: `library_management`
- User with appropriate permissions

## Step 1: Enable TCP/IP in SQL Server
1. Open **SQL Server Configuration Manager**
2. Go to **SQL Server Network Configuration** → **Protocols for SQLEXPRESS** (or your instance name)
3. Enable **TCP/IP** protocol
4. Right-click TCP/IP → **Properties** → **IP Addresses** tab
5. Scroll to **IPAll** → Set **TCP Port** to **1433**
6. Restart SQL Server service

## Step 2: Create Database
```sql
-----
GO
```

## Step 3: Create Login/User (if needed)
```sql
-- Create login for your application
CREATE LOGIN outlms_user WITH PASSWORD = 'your_secure_password';
GO

-- Use your database
USE library_management;
GO

-- Create user in database
CREATE USER outlms_user FOR LOGIN outlms_user;
GO

-- Grant permissions
ALTER ROLE db_owner ADD MEMBER outlms_user;
GO
```

## Step 4: Update Application Properties
Update `src/main/resources/application.properties`:

```properties
# Database Configuration
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=library_management;encrypt=false;trustServerCertificate=true;
spring.datasource.username=outlms_user
spring.datasource.password=your_secure_password
spring.datasource.driver-class-name=com.microsoft.sqlserver.jdbc.SQLServerDriver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.SQLServerDialect
spring.jpa.properties.hibernate.format_sql=true
```

## Step 5: Test Connection
Run the application and check for successful connection.

## Common Issues & Solutions

### Issue: "Connection refused: getsockopt"
**Solution**: 
- Verify SQL Server is running
- Check TCP/IP is enabled on port 1433
- Restart SQL Server service

### Issue: "Login failed for user"
**Solution**:
- Verify username and password
- Check if user has database permissions
- Ensure SQL Server authentication is enabled

### Issue: "Cannot open database"
**Solution**:
- Create the database first
- Verify database name spelling
- Check user permissions

## Alternative: Use SQL Server Express
If you don't have SQL Server, you can install SQL Server Express:
1. Download from Microsoft website
2. Install with SQL Server Authentication mode
3. Follow steps above

## Testing SQL Connection
You can test connection using:
```bash
# Using sqlcmd (if installed)
sqlcmd -S localhost -U outlms_user -P your_password -d library_management

# Or test with telnet
telnet localhost 1433
```

## Firewall Configuration
If connection still fails, check Windows Firewall:
1. Allow SQL Server through firewall
2. Add inbound rule for port 1433
3. Allow SQL Server Browser service (if using named instances)
