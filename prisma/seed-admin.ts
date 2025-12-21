// Super Admin Seed Script
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function seedSuperAdmin() {
  try {
    console.log('🌱 Seeding Super Admin...');

    // Generate secure credentials
    const superAdminEmail = 'superadmin@vitvverse.com';
    const superAdminPassword = crypto.randomBytes(16).toString('hex'); // Random password
    const hashedPassword = await bcrypt.hash(superAdminPassword, 12);

    // Check if super admin already exists
    const existing = await prisma.users.findUnique({
      where: { userEmail: superAdminEmail },
    });

    if (existing) {
      console.log('⚠️  Super Admin already exists');
      return;
    }

    // Create super admin user
    const superAdmin = await prisma.users.create({
      data: {
        userName: 'Super Admin',
        userEmail: superAdminEmail,
        userPassword: hashedPassword,
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        isSuperAdmin: true,
      },
    });

    console.log('✅ Super Admin created successfully!');
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 SUPER ADMIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Email:    ${superAdminEmail}`);
    console.log(`Password: ${superAdminPassword}`);
    console.log(`User ID:  ${superAdmin.userID}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
    console.log('⚠️  These will NOT be shown again.\n');

    // Write credentials to a secure file
    const fs = await import('fs');
    const path = await import('path');
    const credsFile = path.join(process.cwd(), 'SUPER_ADMIN_CREDENTIALS.txt');
    
    const credsContent = `
VIT-Verse Super Admin Credentials
==================================
Created: ${new Date().toISOString()}

Email:    ${superAdminEmail}
Password: ${superAdminPassword}
User ID:  ${superAdmin.userID}

IMPORTANT:
- Keep this file secure and delete it after saving credentials elsewhere
- Never commit this file to version control
- Change the password after first login
- Use a password manager to store these credentials

Access the admin dashboard at: http://localhost:5173/admin
`;

    fs.writeFileSync(credsFile, credsContent.trim());
    console.log(`📄 Credentials saved to: ${credsFile}`);
    console.log('🔒 Delete this file after saving credentials securely!\n');

  } catch (error) {
    console.error('❌ Error seeding Super Admin:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
seedSuperAdmin()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
