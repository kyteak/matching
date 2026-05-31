export type SkillLevel = '초급' | '중급' | '고수'
export type Sport = '축구' | '풋살' | '농구' | 'e스포츠'
export type MatchSize = '1vs1' | '3vs3' | '5vs5' | '11vs11'
export type MatchStatus = '모집중' | '매치확정' | '취소됨'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type ContestStatus = '모집중' | '마감'
export type NotificationType =
  | 'match_apply'
  | 'match_accept'
  | 'match_reject'
  | 'match_cancel'
  | 'new_message'
  | 'contest_apply'
  | 'contest_accept'
  | 'contest_reject'

export interface Profile {
  id: string
  username: string
  nickname: string
  full_name: string
  student_id: string
  skill_level: SkillLevel
  department: string
  contest_count: number
  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  author_id: string
  team_name: string
  sport: Sport
  match_size: MatchSize
  location: string
  description: string
  required_level: SkillLevel
  status: MatchStatus
  match_datetime: string
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface MatchApplication {
  id: string
  match_id: string
  applicant_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
  matches?: Match
  profiles?: Profile
}

export interface MessageRoom {
  id: string
  application_id: string
  participant_1: string
  participant_2: string
  created_at: string
  updated_at: string
  match_applications?: MatchApplication
  participant1_profile?: Profile
  participant2_profile?: Profile
  last_message?: Message
}

export interface Message {
  id: string
  room_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  profiles?: Profile
}

export interface Review {
  id: string
  match_id: string
  reviewer_id: string
  reviewee_id: string
  rating: number
  created_at: string
  profiles?: Profile
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  message: string
  related_id: string | null
  is_read: boolean
  created_at: string
}

export interface ContestMatch {
  id: string
  author_id: string
  contest_name: string
  contest_category: string
  region: string
  deadline: string
  team_size: number
  current_count: number
  description: string
  status: ContestStatus
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface ContestApplication {
  id: string
  contest_match_id: string
  applicant_id: string
  status: ApplicationStatus
  created_at: string
  updated_at: string
  contest_matches?: ContestMatch
  profiles?: Profile
}

export interface ContestChatRoom {
  id: string
  contest_match_id: string
  name: string
  created_at: string
  contest_matches?: ContestMatch
  member_count?: number
}

export interface ContestChatMember {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  profiles?: Profile
}

export interface ContestChatMessage {
  id: string
  room_id: string
  sender_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface ExternalContest {
  id: string
  title: string
  url: string
  category: string
  organizer: string
  deadline: string
  source: 'all-con' | 'linkareer'
  description: string
  created_at: string
}

export interface StaticContest {
  id: string
  title: string
  category: string
  organizer: string
  deadline: string
  region: '충청북도' | '충청남도' | '세종특별자치시' | '대전광역시'
  description: string
  url?: string
}
