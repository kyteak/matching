-- =====================================================
-- 충북match 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요.
-- =====================================================

-- ENUM 타입 정의
CREATE TYPE match_status AS ENUM ('모집중', '매치확정', '취소됨');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE contest_status AS ENUM ('모집중', '마감');
CREATE TYPE notification_type AS ENUM (
  'match_apply', 'match_accept', 'match_reject', 'match_cancel',
  'new_message', 'contest_apply', 'contest_accept', 'contest_reject'
);

-- =====================================================
-- profiles 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  full_name TEXT,
  student_id TEXT NOT NULL,
  department TEXT,
  skill_level TEXT,
  contest_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- matches 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  sport TEXT NOT NULL,
  match_size TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  required_level TEXT NOT NULL,
  match_datetime TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT '모집중' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- match_applications 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS match_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, applicant_id)
);

-- =====================================================
-- message_rooms 테이블 (1:1 채팅)
-- =====================================================
CREATE TABLE IF NOT EXISTS message_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id UUID REFERENCES match_applications(id) ON DELETE CASCADE,
  participant_1 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  participant_2 UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- messages 테이블 (1:1 채팅 메시지)
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES message_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- notifications 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- reviews 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(match_id, reviewer_id)
);

-- =====================================================
-- contest_matches 테이블 (공모전 팀 모집)
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_matches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  contest_name TEXT NOT NULL,
  contest_category TEXT NOT NULL,
  region TEXT NOT NULL,
  deadline DATE NOT NULL,
  team_size INTEGER DEFAULT 3 NOT NULL,
  current_count INTEGER DEFAULT 0 NOT NULL,
  description TEXT,
  status TEXT DEFAULT '모집중' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- contest_applications 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_match_id UUID REFERENCES contest_matches(id) ON DELETE CASCADE NOT NULL,
  applicant_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(contest_match_id, applicant_id)
);

-- =====================================================
-- contest_chat_rooms 테이블 (그룹 채팅방)
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contest_match_id UUID REFERENCES contest_matches(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- contest_chat_members 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_chat_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES contest_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- =====================================================
-- contest_chat_messages 테이블
-- =====================================================
CREATE TABLE IF NOT EXISTS contest_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES contest_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- external_contests 테이블 (외부 공모전)
-- =====================================================
CREATE TABLE IF NOT EXISTS external_contests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  category TEXT,
  organizer TEXT,
  deadline DATE,
  source TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- 인덱스
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_matches_datetime ON matches(match_datetime);
CREATE INDEX IF NOT EXISTS idx_matches_author ON matches(author_id);
CREATE INDEX IF NOT EXISTS idx_matches_sport ON matches(sport);
CREATE INDEX IF NOT EXISTS idx_match_applications_match ON match_applications(match_id);
CREATE INDEX IF NOT EXISTS idx_match_applications_applicant ON match_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_contest_matches_status ON contest_matches(status);
CREATE INDEX IF NOT EXISTS idx_contest_applications_match ON contest_applications(contest_match_id);
CREATE INDEX IF NOT EXISTS idx_contest_chat_members_room ON contest_chat_members(room_id);
CREATE INDEX IF NOT EXISTS idx_contest_chat_members_user ON contest_chat_members(user_id);
CREATE INDEX IF NOT EXISTS idx_contest_chat_messages_room ON contest_chat_messages(room_id);

-- =====================================================
-- RLS (Row Level Security) 활성화
-- =====================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_chat_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contest_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_contests ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS 정책 — profiles
-- =====================================================
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- RLS 정책 — matches
-- =====================================================
CREATE POLICY "matches_select" ON matches FOR SELECT USING (true);
CREATE POLICY "matches_insert" ON matches FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "matches_update" ON matches FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "matches_delete" ON matches FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- RLS 정책 — match_applications
-- =====================================================
CREATE POLICY "apps_select" ON match_applications FOR SELECT
  USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (SELECT author_id FROM matches WHERE id = match_id)
  );
CREATE POLICY "apps_insert" ON match_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "apps_update" ON match_applications FOR UPDATE
  USING (
    auth.uid() IN (SELECT author_id FROM matches WHERE id = match_id)
    OR auth.uid() = applicant_id
  );
CREATE POLICY "apps_delete" ON match_applications FOR DELETE USING (auth.uid() = applicant_id);

-- =====================================================
-- RLS 정책 — message_rooms
-- =====================================================
CREATE POLICY "rooms_select" ON message_rooms FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- =====================================================
-- RLS 정책 — messages
-- =====================================================
CREATE POLICY "messages_select" ON messages FOR SELECT
  USING (
    auth.uid() IN (
      SELECT participant_1 FROM message_rooms WHERE id = room_id
      UNION
      SELECT participant_2 FROM message_rooms WHERE id = room_id
    )
  );
CREATE POLICY "messages_insert" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (
      SELECT participant_1 FROM message_rooms WHERE id = room_id
      UNION
      SELECT participant_2 FROM message_rooms WHERE id = room_id
    )
  );

-- =====================================================
-- RLS 정책 — notifications
-- =====================================================
CREATE POLICY "notif_select" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================================
-- RLS 정책 — reviews
-- =====================================================
CREATE POLICY "reviews_select" ON reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- =====================================================
-- RLS 정책 — contest_matches
-- =====================================================
CREATE POLICY "cm_select" ON contest_matches FOR SELECT USING (true);
CREATE POLICY "cm_insert" ON contest_matches FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "cm_update" ON contest_matches FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "cm_delete" ON contest_matches FOR DELETE USING (auth.uid() = author_id);

-- =====================================================
-- RLS 정책 — contest_applications
-- =====================================================
CREATE POLICY "ca_select" ON contest_applications FOR SELECT
  USING (
    auth.uid() = applicant_id
    OR auth.uid() IN (SELECT author_id FROM contest_matches WHERE id = contest_match_id)
  );
CREATE POLICY "ca_insert" ON contest_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "ca_update" ON contest_applications FOR UPDATE
  USING (
    auth.uid() IN (SELECT author_id FROM contest_matches WHERE id = contest_match_id)
    OR auth.uid() = applicant_id
  );

-- =====================================================
-- RLS 정책 — contest_chat_rooms
-- =====================================================
CREATE POLICY "ccr_select" ON contest_chat_rooms FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM contest_chat_members WHERE room_id = id)
  );

-- =====================================================
-- RLS 정책 — contest_chat_members
-- =====================================================
CREATE POLICY "ccm_select" ON contest_chat_members FOR SELECT
  USING (
    room_id IN (SELECT room_id FROM contest_chat_members WHERE user_id = auth.uid())
  );
CREATE POLICY "ccm_delete" ON contest_chat_members FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- RLS 정책 — contest_chat_messages
-- =====================================================
CREATE POLICY "ccmsg_select" ON contest_chat_messages FOR SELECT
  USING (
    auth.uid() IN (SELECT user_id FROM contest_chat_members WHERE room_id = contest_chat_messages.room_id)
  );
CREATE POLICY "ccmsg_insert" ON contest_chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND auth.uid() IN (SELECT user_id FROM contest_chat_members WHERE room_id = contest_chat_messages.room_id)
  );

-- =====================================================
-- RLS 정책 — external_contests
-- =====================================================
CREATE POLICY "ec_select" ON external_contests FOR SELECT USING (true);

-- =====================================================
-- Supabase Realtime 활성화 안내
-- 대시보드 > Database > Replication 에서 아래 테이블을 활성화하세요:
--   - notifications
--   - match_applications
--   - messages
--   - contest_chat_messages
-- =====================================================
