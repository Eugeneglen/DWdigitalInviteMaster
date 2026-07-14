import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding database...');

  // 1. Create Dreamweavers Super Admin
  const adminPassword = await bcrypt.hash('Admin@2024', 12);
  const admin = await db.user.upsert({
    where: { email: 'admin@dreamweavers.sg' },
    // Include passwordHash in update so re-seeding an existing DB keeps the
    // demo admin password in sync with this file (prevents drift like the
    // @123 vs @2024 production issue).
    update: { role: 'SUPER_ADMIN', passwordHash: adminPassword },
    create: {
      email: 'admin@dreamweavers.sg',
      passwordHash: adminPassword,
      name: 'Dreamweavers Admin',
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });
  console.log(`✅ Admin user: ${admin.email} (${admin.role})`);

  // 2. Create a sample couple user
  const couplePassword = await bcrypt.hash('Couple@2024', 12);
  const couple = await db.user.upsert({
    where: { email: 'eleanor@wedding.com' },
    // Include passwordHash in update — see admin upsert note above.
    update: { role: 'COUPLE', passwordHash: couplePassword },
    create: {
      email: 'eleanor@wedding.com',
      passwordHash: couplePassword,
      name: 'Eleanor',
      role: 'COUPLE',
      isActive: true,
    },
  });
  console.log(`✅ Couple user: ${couple.email} (${couple.role})`);

  // 3. Create sample wedding account
  const weddingDate = new Date('2027-12-25T16:00:00');
  const wedding = await db.weddingAccount.upsert({
    where: { slug: 'eleanor-james-2027' },
    // Re-link the wedding to the current couple user on re-seed. This fixes
    // orphaned owner links (e.g. if the couple user was recreated with a new
    // id, the wedding's ownerId would still point at the old id, causing the
    // Couple CMS to show "No wedding account assigned"). Only ownerId is
    // updated here so existing wedding customizations are preserved.
    update: { ownerId: couple.id },
    create: {
      slug: 'eleanor-james-2027',
      coupleName: 'Eleanor & James',
      brideName: 'Eleanor',
      groomName: 'James',
      weddingDate,
      weddingTime: '16:00',
      venue: 'The Fullerton Hotel',
      venueAddress: '38 Cuscaden Road, Singapore 249731',
      googleMapsUrl: 'https://maps.google.com/?q=1.3066+103.8290',
      status: 'ACTIVE',
      plan: 'PLATINUM',
      heroImageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeAe38AA5-0h4B5MmgQCqv54oQXyPMGznDKaw2sJI_FnTbB_yXXWOpirFlFycj_2VI02IVLouUTt86Y1J7Ls-bRsMOHPAcfSqruVoh87sfhw3vi2Z6t1C7ogCLtkvF6QbJkwuV0av8pXTrUeAAi6ymnZpvyOr8qVjTNNorAOmqRrW_fohX_xlkscmBh39K4Wtvs6TH0Nvb_X3LQQRD9W_sySN_iWbWw9O0au8u1jO-hSekE9pSGNo5zsTz3o9PWy5xbzc6lq3knkIy',
      bannerUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-OyKfcsxXAmZDArHbDXl1cVCgGUG5liFPzyHdVvMG6_4jN9pNTrN9GCrkdnegli9UPJUSPs39KJRsRP7AiLem4xYS-q1ZYq1T3DAIqyvn3wAvbdkoMVkufft0SpQw4gDTPSnIml6k62lRYobUrNu70UGIILiMZQ0fAydTXXwVZ1oswQZ-mjPT8H9mDDqfhxsMSI5zla8GKz_ILXbmdRjtRUk682dPEDBD6I81DzEx7dITgjb6vxQoee5599jkYf_vCYP7npydvxqx',
      ownerId: couple.id,
    },
  });
  console.log(`✅ Wedding account: ${wedding.coupleName} (${wedding.slug})`);

  // 4. Enable default features for the wedding
  const defaultFeatures = [
    'countdown', 'schedule', 'rsvp', 'story', 'gallery',
    'wishes', 'getting-there', 'qa', 'moments', 'music', 'video',
  ];
  for (const key of defaultFeatures) {
    await db.weddingFeature.upsert({
      where: { weddingId_featureKey: { weddingId: wedding.id, featureKey: key } },
      update: { isEnabled: true },
      create: { weddingId: wedding.id, featureKey: key, isEnabled: true },
    });
  }
  console.log(`✅ ${defaultFeatures.length} features enabled`);

  // 5. Seed default content for the wedding
  const contentItems = [
    { section: 'hero', fieldKey: 'subtitle', fieldValue: 'Together with their families, request the pleasure of your company', fieldType: 'TEXT' },
    { section: 'hero', fieldKey: 'description', fieldValue: 'We invite you to share in our joy as we begin our forever together.', fieldType: 'TEXT' },
    { section: 'story', fieldKey: 'title', fieldValue: 'Our Story', fieldType: 'TEXT' },
    { section: 'story', fieldKey: 'subtitle', fieldValue: 'The Prelude', fieldType: 'TEXT' },
    { section: 'story', fieldKey: 'intro', fieldValue: 'Every great romance is a narrative woven over time. Ours began with a serendipitous meeting and has evolved into a tapestry of shared adventures, quiet moments, and a profound commitment to one another.', fieldType: 'RICHTEXT' },
    { section: 'schedule', fieldKey: 'title', fieldValue: 'The Day', fieldType: 'TEXT' },
    { section: 'getting-there', fieldKey: 'title', fieldValue: 'Getting There', fieldType: 'TEXT' },
    { section: 'wishes', fieldKey: 'title', fieldValue: 'Wishes', fieldType: 'TEXT' },
    { section: 'wishes', fieldKey: 'subtitle', fieldValue: 'Weave Your Blessing Into Our Archive', fieldType: 'TEXT' },
    { section: 'qa', fieldKey: 'title', fieldValue: 'Questions & Answers', fieldType: 'TEXT' },
    { section: 'moments', fieldKey: 'title', fieldValue: 'Moments', fieldType: 'TEXT' },
    { section: 'tea-ceremony', fieldKey: 'title', fieldValue: 'The Tea Ceremony', fieldType: 'TEXT' },
    { section: 'tea-ceremony', fieldKey: 'label', fieldValue: 'The Tradition', fieldType: 'TEXT' },
  ];
  for (const item of contentItems) {
    await db.weddingContent.upsert({
      where: {
        weddingId_section_fieldKey: {
          weddingId: wedding.id,
          section: item.section,
          fieldKey: item.fieldKey,
        },
      },
      update: { fieldValue: item.fieldValue },
      create: {
        weddingId: wedding.id,
        ...item,
      },
    });
  }
  console.log(`✅ ${contentItems.length} content items seeded`);

  // 6. Seed sample schedule
  // Delete existing schedule items for this wedding first to prevent
  // duplicates on re-seed (previous versions used bare create() which
  // appended a new set every run, causing 40+ duplicate rows).
  await db.eventSchedule.deleteMany({ where: { weddingId: wedding.id } });
  const scheduleItems = [
    { eventType: 'TEA_CEREMONY', title: 'Tea Ceremony', description: 'Traditional tea ceremony with both families', startTime: '10:00', endTime: '12:00', location: 'Bride\'s Residence', sortOrder: 1 },
    { eventType: 'CEREMONY', title: 'Wedding Ceremony', description: 'Exchange of vows and rings', startTime: '16:00', endTime: '17:00', location: 'The Fullerton Hotel — Grand Ballroom', sortOrder: 2 },
    { eventType: 'RECEPTION', title: 'Cocktail Reception', description: 'Drinks and canapés by the poolside', startTime: '17:00', endTime: '18:00', location: 'The Fullerton Hotel — Poolside Terrace', sortOrder: 3 },
    { eventType: 'DINNER', title: 'Wedding Dinner', description: 'Eight-course Chinese banquet dinner', startTime: '18:00', endTime: '22:00', location: 'The Fullerton Hotel — Grand Ballroom', sortOrder: 4 },
  ];
  for (const item of scheduleItems) {
    await db.eventSchedule.create({
      data: { weddingId: wedding.id, ...item },
    });
  }
  console.log(`✅ ${scheduleItems.length} schedule items seeded`);

  // 7. Seed sample FAQs
  // Delete existing FAQs for this wedding first to prevent duplicates on re-seed.
  await db.fAQ.deleteMany({ where: { weddingId: wedding.id } });
  const faqs = [
    { question: 'What is the dress code?', answer: 'The dress code is formal / black tie. We kindly request guests to avoid wearing white.', sortOrder: 1 },
    { question: 'Can I bring a plus one?', answer: 'Your invitation will indicate whether a plus one is included. If you\'re unsure, please reach out to us.', sortOrder: 2 },
    { question: 'Is parking available?', answer: 'Yes, complimentary valet parking is available at The Fullerton Hotel. Self-parking is also available at $6/hour.', sortOrder: 3 },
    { question: 'Are children welcome?', answer: 'We love your little ones! However, due to venue restrictions, this will be an adults-only celebration.', sortOrder: 4 },
    { question: 'Can I take photos during the ceremony?', answer: 'We kindly request an unplugged ceremony. A professional photographer will capture every moment, and we\'ll share the photos with you afterwards.', sortOrder: 5 },
    { question: 'Where can I stay nearby?', answer: 'We\'ve arranged special rates at The Fullerton Hotel and several nearby hotels. Please contact us for the booking links.', sortOrder: 6 },
  ];
  for (const faq of faqs) {
    await db.fAQ.create({
      data: { weddingId: wedding.id, ...faq },
    });
  }
  console.log(`✅ ${faqs.length} FAQs seeded`);

  // 8. Seed sample story items
  // Delete existing story items for this wedding first to prevent duplicates on re-seed.
  await db.storyItem.deleteMany({ where: { weddingId: wedding.id } });
  const stories = [
    { title: 'How We Met', content: 'It was a rainy Tuesday at a cozy bookstore in Chinatown. Both reaching for the same worn copy of "Love in the Time of Cholera," our hands touched, and the rest of the world faded away. We spent three hours talking over coffee that day, and neither of us wanted to leave.', date: 'March 2023', sortOrder: 1, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQPSczTWgJLZS_vzNbN6wuPsTVw72YpOY0ldIaXb2nEM0DjbAoH__IyOfEvlXkIvif3k6TiVwdgbsAPvCUuustCXJ5ogM8o9Mf8qfnHNM052duEcCK8KPbJVfqn8sOuo9cpUPx6XWqHpBxvEfinvKzqiiI7zy3XkVYQ7w0ElfPw1kVlE-oTiwbdti2a6Q3pUBuogYx0KyKtviULD2olRj3ZTd29I37Yi80hUtQtS9LWTuKEtFJvAKUdLp2wmjdEM8om4Ku67LEDI4t' },
    { title: 'The First Date', content: 'James planned an elaborate dinner at a hidden omakase bar. Eleanor showed up 20 minutes late (she\'ll deny it), but the sushi was worth the wait. By dessert, we both knew this was something special.', date: 'April 2023', sortOrder: 2, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm-8WDgkq_3PeNjdM4_SPcbdyPc4j1BN1NYWpstlUalLgRDkOi-VrJG2ZcdDt04YwBhlSegxOEQ4dbw-6zr2xKHQeTO5gJe67RlcYJ2IkUn3Dp8ZbTzfL8aD2Tq8rbse4QsZBGuz1fOPmW42rjorV-F8aY14aRHg_wk_TAMAaeqaBllL8Qpx_POk9EP9b5wjS_YXtMBnKH7-nGAPwIbuNCwetnkUm6A1gonIw4KTEsPRqq2sW_1A3jAX6wnSIeZTPdzM3VYkva56VG' },
    { title: 'Adventures Together', content: 'From hiking the trails of Bukit Timah at dawn to getting lost in the streets of Kyoto during cherry blossom season, every adventure with you has been my favorite chapter. Here\'s to a thousand more.', date: '2023–2024', sortOrder: 3, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaySYsDYGyX6N9CoV24yS9bjuLYqQWIJwG8qS2qCMj2do69ncL22s286MrboC8HGtgl1tP6_JTj85seIO4TolelvHDIqTInWBTwFyuk_MJZN0a5w6P0QX4AQUVLx2oCOPDelyGCdOmRviKG1bD4nqPr3zkgUKWgXNmnGP5a0b4U2k-nDG2Hl_lDM2moRehiYXKnwB872KgPkaI7Br6uq1DHIKKb34AY9ybXoB9pT-x3W5PKHguLL3DaI6VsnfHWT18OAeoVAgwQsvH' },
    { title: 'The Proposal', content: 'Under a canopy of fairy lights at Gardens by the Bay, James got down on one knee. Eleanor said yes before he could finish the question. It was perfect — just like us.', date: 'December 2024', sortOrder: 4, imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBzzvAxvGICtmDJ5Ase_8SKR0gvAAqXe_96pLSdSUEjYyVgenag3qekxDbjpLG_SXknWJEoOXPP_XcdU4WMSloZvzj9Pn-dxdG0BBlp0lglCSzzoxLL3-2CaKrawuVRqBglPiiimHDNTlMHai2pnrr404Xg8EgQq8tdW5qRhs-bx2k6N52M80DDUW27KtR0Nc4-WkNjwCsNX8XuiyHBZTqdhpBqml323YRMNj-0offH-_Sn3jp1yxw-EAZs939pzoyGzEfpRwsteoXv' },
  ];
  for (const story of stories) {
    await db.storyItem.create({
      data: { weddingId: wedding.id, ...story },
    });
  }
  console.log(`✅ ${stories.length} story items seeded`);

  // 9. Seed platform system settings
  const platformSettings = [
    { key: 'default_couple_password', value: 'Couple@123' },
    { key: 'couple_access_expiry_days', value: '30' },
    { key: 'expiry_notification_days', value: '7' },
    { key: 'default_plan', value: 'GOLD' },
    { key: 'default_wedding_status', value: 'DRAFT' },
    {
      key: 'package_templates',
      value: JSON.stringify([
        {
          name: 'GOLD',
          label: 'Gold',
          features: ['countdown', 'schedule', 'rsvp', 'getting-there'],
          maxGuests: 100,
          maxMedia: 20,
          sortOrder: 1,
        },
        {
          name: 'PLATINUM',
          label: 'Platinum',
          features: ['countdown', 'schedule', 'rsvp', 'getting-there', 'story', 'wishes', 'qa'],
          maxGuests: 200,
          maxMedia: 50,
          sortOrder: 2,
        },
        {
          name: 'DIAMOND',
          label: 'Diamond',
          features: ['countdown', 'schedule', 'rsvp', 'getting-there', 'story', 'wishes', 'qa', 'moments', 'music', 'video'],
          maxGuests: 500,
          maxMedia: 100,
          sortOrder: 3,
        },
      ]),
    },
  ];

  for (const setting of platformSettings) {
    await db.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log(`✅ ${platformSettings.length} platform settings seeded (package templates, couple password, expiry config)`);

  // 10. Update existing wedding plan to PLATINUM (from old PREMIUM)
  await db.weddingAccount.update({
    where: { slug: 'eleanor-james-2027' },
    data: {
      plan: 'PLATINUM',
      coupleEmail: 'eleanor@wedding.com',
      accountStatus: 'ACTIVE',
    },
  });
  console.log(`✅ Updated demo wedding plan to PLATINUM, accountStatus to ACTIVE`);

  console.log('\n🎉 Seed complete!');
  console.log('---');
  console.log('Admin login: admin@dreamweavers.sg / Admin@2024');
  console.log('Couple login: eleanor@wedding.com / Couple@2024');
}

seed()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));