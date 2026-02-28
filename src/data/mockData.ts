import type { EventItem, Friend, RecommendationReason, ScheduleBlock, User } from '@/types'

export const INTERESTS = [
  'basketball',
  'networking',
  'technology',
  'music',
  'cultural',
  'career',
  'wellness',
  'food',
  'innovation',
  'leadership',
]

export const mockStudentUser: User = {
  id: 'u-student-1',
  role: 'student',
  name: 'Alex Carter',
  email: 'alex.carter@osu.edu',
  major: 'CSE',
  interests: ['basketball', 'technology', 'networking', 'food'],
}

export const mockOrgUser: User = {
  id: 'u-org-1',
  role: 'organization',
  name: 'OUAB Events Team',
  email: 'ouab@osu.edu',
  organizationName: 'Ohio Union Activities Board',
  description: 'Planning student experiences across campus.',
  interests: ['cultural', 'leadership'],
  verified: true,
}

export const mockScheduleBlocks: ScheduleBlock[] = [
  { id: 's1', name: 'CSE 2221', day: 'Mon', start: '09:10', end: '10:05' },
  { id: 's2', name: 'CSE 2221', day: 'Wed', start: '09:10', end: '10:05' },
  { id: 's3', name: 'CSE 2221', day: 'Fri', start: '09:10', end: '10:05' },
  { id: 's4', name: 'Physics 1250', day: 'Mon', start: '11:30', end: '12:25' },
  { id: 's5', name: 'Physics 1250', day: 'Wed', start: '11:30', end: '12:25' },
  { id: 's6', name: 'Physics 1250', day: 'Fri', start: '11:30', end: '12:25' },
  { id: 's7', name: 'Math 2153', day: 'Tue', start: '13:00', end: '14:20' },
  { id: 's8', name: 'Math 2153', day: 'Thu', start: '13:00', end: '14:20' },
  { id: 's9', name: 'English 1110', day: 'Tue', start: '15:55', end: '17:15' },
  { id: 's10', name: 'English 1110', day: 'Thu', start: '15:55', end: '17:15' },
  { id: 's11', name: 'Club Meeting', day: 'Tue', start: '17:30', end: '18:30' },
]

export const mockEvents: EventItem[] = [
  { id: 'e1', title: 'OUAB Trivia Night', description: 'Weekly team trivia with prizes and snacks.', aiSummary: 'A weekly trivia night hosted by OUAB featuring team-based competition, prizes, and a social atmosphere.', category: 'social', source: 'official', date: '2026-03-04', startTime: '18:00', endTime: '20:00', location: 'Ohio Union', rsvpCount: 154, orgId: 'u-org-1', orgName: 'OUAB', tags: ['social', 'trivia', 'food'] },
  { id: 'e2', title: 'Pickup Basketball', description: 'Open rec basketball at RPAC.', aiSummary: 'An open basketball session designed for casual play and meeting new students.', category: 'sports', source: 'official', date: '2026-03-05', startTime: '18:00', endTime: '19:30', location: 'RPAC Courts', rsvpCount: 120, orgId: 'u-org-2', orgName: 'Rec Sports', tags: ['basketball', 'fitness'] },
  { id: 'e3', title: 'Ramen Crawl', description: 'Explore top ramen spots near campus.', aiSummary: 'A food-focused social event featuring local ramen restaurants near OSU.', category: 'food', source: 'unofficial', date: '2026-03-07', startTime: '12:00', endTime: '14:00', location: 'High Street', rsvpCount: 83, tags: ['food', 'social'] },
  { id: 'e4', title: 'AI Career Mixer', description: 'Meet recruiters and alumni in AI/ML.', aiSummary: 'A networking mixer connecting students with employers in AI and software.', category: 'career', source: 'official', date: '2026-03-10', startTime: '16:00', endTime: '18:00', location: 'Hitchcock Hall', rsvpCount: 94, orgId: 'u-org-3', orgName: 'Engineering Career Services', tags: ['career', 'networking', 'technology'] },
  { id: 'e5', title: 'Cultural Night Market', description: 'Student-run cultural booths and performances.', aiSummary: 'A high-energy cultural showcase with performances, food, and student organizations.', category: 'cultural', source: 'official', date: '2026-03-08', startTime: '17:00', endTime: '21:00', location: 'South Oval', rsvpCount: 132, orgId: 'u-org-4', orgName: 'International Affairs', tags: ['cultural', 'community'] },
  { id: 'e6', title: 'Startup Pitch Sprint', description: '3-minute startup pitch challenge.', aiSummary: 'A fast-paced innovation event where teams pitch ideas and receive feedback.', category: 'innovation', source: 'official', date: '2026-03-11', startTime: '18:30', endTime: '20:30', location: 'Thompson Library', rsvpCount: 67, tags: ['innovation', 'networking', 'technology'] },
  { id: 'e7', title: 'Sunrise Yoga', description: 'Morning yoga for stress relief.', aiSummary: 'A wellness session focused on flexibility, mindfulness, and energy before class.', category: 'wellness', source: 'official', date: '2026-03-06', startTime: '08:00', endTime: '09:00', location: 'North Rec Lawn', rsvpCount: 42, tags: ['wellness', 'fitness'] },
  { id: 'e8', title: 'Buckeye Hack Lab', description: 'Collaborative coding night.', aiSummary: 'A project-based coding meetup for building and shipping prototypes with peers.', category: 'technology', source: 'unofficial', date: '2026-03-12', startTime: '19:00', endTime: '22:00', location: 'Dreese Labs', rsvpCount: 88, tags: ['technology', 'innovation'] },
  { id: 'e9', title: 'Jazz in the Union', description: 'Live student jazz showcase.', aiSummary: 'An evening of live jazz performances and open social seating at the Union.', category: 'music', source: 'official', date: '2026-03-09', startTime: '20:00', endTime: '22:00', location: 'Ohio Union Performance Hall', rsvpCount: 61, tags: ['music', 'social'] },
  { id: 'e10', title: 'Resume Review Pop-Up', description: 'Drop-in resume help.', aiSummary: 'A practical career support event with quick recruiter and advisor feedback.', category: 'career', source: 'official', date: '2026-03-06', startTime: '13:00', endTime: '15:00', location: 'Younkin Success Center', rsvpCount: 48, tags: ['career'] },
  { id: 'e11', title: 'Data Science Study Jam', description: 'Peer-led study and prep night.', aiSummary: 'A collaborative academic support session for data science and programming classes.', category: 'academic', source: 'unofficial', date: '2026-03-05', startTime: '17:00', endTime: '19:00', location: 'Caldwell Lab 120', rsvpCount: 39, tags: ['technology', 'academic'] },
  { id: 'e12', title: 'Global Tea Exchange', description: 'Tea tasting and conversations.', aiSummary: 'A cultural mixer where students share tea traditions and personal stories.', category: 'cultural', source: 'official', date: '2026-03-13', startTime: '16:30', endTime: '18:00', location: 'Hale Hall', rsvpCount: 57, tags: ['cultural', 'food'] },
  { id: 'e13', title: 'Women in Tech Panel', description: 'Leadership and mentorship panel.', aiSummary: 'An inspiring panel with professionals discussing growth paths in technology.', category: 'career', source: 'official', date: '2026-03-14', startTime: '17:30', endTime: '19:00', location: 'Knowlton Hall', rsvpCount: 73, tags: ['career', 'technology', 'leadership'] },
  { id: 'e14', title: 'Board Game Bash', description: 'Casual board game tournament.', aiSummary: 'A low-pressure social event with strategy and party games for all levels.', category: 'social', source: 'unofficial', date: '2026-03-15', startTime: '18:00', endTime: '21:00', location: 'Mendoza House', rsvpCount: 44, tags: ['social'] },
  { id: 'e15', title: 'Volunteer Day', description: 'Community service around Columbus.', aiSummary: 'A service-focused event connecting students to local volunteer projects.', category: 'community', source: 'official', date: '2026-03-16', startTime: '09:00', endTime: '12:00', location: 'Ohio Union East Plaza', rsvpCount: 110, tags: ['community', 'leadership'] },
  { id: 'e16', title: 'Design Sprint Workshop', description: 'Hands-on UX workshop.', aiSummary: 'A practical workshop on ideation, wireframing, and fast product validation.', category: 'innovation', source: 'official', date: '2026-03-17', startTime: '14:00', endTime: '16:30', location: 'Denney Hall', rsvpCount: 59, tags: ['innovation', 'technology'] },
  { id: 'e17', title: 'Late Night Study Cafe', description: 'Coffee + focused study blocks.', aiSummary: 'A structured late-night study event with accountability and breaks.', category: 'academic', source: 'official', date: '2026-03-18', startTime: '20:00', endTime: '23:00', location: 'Thompson 11th Floor', rsvpCount: 102, tags: ['academic', 'wellness'] },
  { id: 'e18', title: 'Campus Film Night', description: 'Outdoor movie screening with popcorn.', aiSummary: 'A relaxed campus movie night designed for socializing and unwinding after classes.', category: 'social', source: 'official', date: '2026-03-19', startTime: '19:30', endTime: '22:00', location: 'Browne Amphitheater', rsvpCount: 76, tags: ['social', 'music'] },
  { id: 'e19', title: 'Cloud Computing Crash Course', description: 'Hands-on intro to cloud services and deployment.', aiSummary: 'A beginner-friendly technical workshop covering cloud fundamentals and practical deployment skills.', category: 'technology', source: 'official', date: '2026-03-20', startTime: '15:00', endTime: '17:00', location: 'Dreese Labs 170', rsvpCount: 64, tags: ['technology', 'career', 'innovation'] },
  { id: 'e20', title: 'Mindful Walk & Talk', description: 'Guided campus walk focused on stress relief.', aiSummary: 'A wellness-focused social walk helping students de-stress and connect with peers.', category: 'wellness', source: 'unofficial', date: '2026-03-21', startTime: '10:00', endTime: '11:30', location: 'Mirror Lake Loop', rsvpCount: 28, tags: ['wellness', 'community'] },
  { id: 'e21', title: 'Hackathon Team Matchup', description: 'Find teammates and pitch project ideas.', aiSummary: 'A networking session where builders form hackathon teams around shared interests.', category: 'innovation', source: 'official', date: '2026-03-22', startTime: '17:00', endTime: '19:00', location: 'Enarson Classroom Building', rsvpCount: 91, tags: ['innovation', 'technology', 'networking'] },
]

export const mockRecommendations: RecommendationReason[] = [
  { eventId: 'e2', reasons: ['Matches your interest in basketball', 'Fits between your classes', '3 CSE students attending', 'Trending this week'] },
  { eventId: 'e1', reasons: ['Matches your social interests', 'You are free 45 minutes before it starts', '3 friends going', 'Trending this week'] },
  { eventId: 'e4', reasons: ['Aligns with your career goals', 'No class conflicts detected', '5 CSE majors attending', 'Popular among tech students'] },
  { eventId: 'e3', reasons: ['Matches your interest in food events', 'Perfect weekend free-time fit', '2 classmates RSVP’d', 'High engagement this week'] },
]

export const mockFriends: Friend[] = [
  {
    id: 'f-1',
    name: 'Sarah Kim',
    email: 'kim.8834@osu.edu',
    eventIds: ['e1', 'e4'],
    status: 'accepted',
  },
  {
    id: 'f-2',
    name: 'Marcus Johnson',
    email: 'johnson.2947@osu.edu',
    eventIds: ['e2', 'e17', 'e19'],
    status: 'pending',
  },
  {
    id: 'f-3',
    name: 'Emily Patel',
    email: 'patel.1156@osu.edu',
    eventIds: ['e3', 'e12', 'e18'],
    status: 'accepted',
  },
  {
    id: 'f-4',
    name: 'Jordan Lee',
    email: 'lee.7723@osu.edu',
    eventIds: ['e21'],
    status: 'accepted',
  },
]

// TODO: Replace mock events and recommendations with canonical dataset from backend source of truth.
