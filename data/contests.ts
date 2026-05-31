import { StaticContest } from '@/types/database'
import { isExpiredContest } from '@/lib/utils'

export const STATIC_CONTESTS: StaticContest[] = [
  // 충청북도
  {
    id: 'cb-1',
    title: '미디어아트 판타지아 공모전',
    category: '디자인·미술',
    organizer: '충청북도문화재단',
    deadline: '2026-07-31',
    region: '충청북도',
    description: '충청북도의 자연과 문화를 주제로 한 미디어아트 작품을 공모합니다.',
  },
  {
    id: 'cb-2',
    title: '2026 충청권 유니버시아드 디자인 공모전',
    category: '디자인·미술',
    organizer: '충청북도',
    deadline: '2026-06-30',
    region: '충청북도',
    description: '2027 충청권 하계유니버시아드를 홍보하는 포스터 및 홍보물 디자인을 공모합니다.',
  },
  {
    id: 'cb-3',
    title: '충청U대회 숏폼 영상 공모전',
    category: '사진·영상',
    organizer: '충청북도 유니버시아드 조직위원회',
    deadline: '2026-08-15',
    region: '충청북도',
    description: '충청 유니버시아드를 알리는 60초 이내 숏폼 영상을 공모합니다.',
  },
  // 충청남도
  {
    id: 'cn-1',
    title: '충남관광 사진·영상 공모전',
    category: '사진·영상',
    organizer: '충청남도관광재단',
    deadline: '2026-09-30',
    region: '충청남도',
    description: '충청남도의 아름다운 관광지를 담은 사진 및 영상을 공모합니다.',
  },
  {
    id: 'cn-2',
    title: '2026 충청권 유니버시아드 디자인 공모전',
    category: '디자인·미술',
    organizer: '충청남도',
    deadline: '2026-06-30',
    region: '충청남도',
    description: '2027 충청권 하계유니버시아드를 홍보하는 포스터 및 홍보물 디자인을 공모합니다.',
  },
  {
    id: 'cn-3',
    title: '충남 방문의 해 기념 그림 공모전',
    category: '디자인·미술',
    organizer: '충청남도',
    deadline: '2026-07-15',
    region: '충청남도',
    description: '2026 충남 방문의 해를 기념하는 그림 작품을 공모합니다.',
  },
  {
    id: 'cn-4',
    title: '충청U대회 숏폼 영상 공모전',
    category: '사진·영상',
    organizer: '충청남도 유니버시아드 조직위원회',
    deadline: '2026-08-15',
    region: '충청남도',
    description: '충청 유니버시아드를 알리는 60초 이내 숏폼 영상을 공모합니다.',
  },
  // 세종특별자치시
  {
    id: 'sj-1',
    title: '지자체 캐릭터 페스티벌 공모전',
    category: '디자인·미술',
    organizer: '세종특별자치시',
    deadline: '2026-07-20',
    region: '세종특별자치시',
    description: '세종시를 대표하는 캐릭터 디자인을 공모합니다.',
  },
  {
    id: 'sj-2',
    title: '2026 충청권 유니버시아드 디자인 공모전',
    category: '디자인·미술',
    organizer: '세종특별자치시',
    deadline: '2026-06-30',
    region: '세종특별자치시',
    description: '2027 충청권 하계유니버시아드를 홍보하는 포스터 및 홍보물 디자인을 공모합니다.',
  },
  {
    id: 'sj-3',
    title: '충청U대회 숏폼 영상 공모전',
    category: '사진·영상',
    organizer: '세종특별자치시 유니버시아드 조직위원회',
    deadline: '2026-08-15',
    region: '세종특별자치시',
    description: '충청 유니버시아드를 알리는 60초 이내 숏폼 영상을 공모합니다.',
  },
  // 대전광역시
  {
    id: 'dj-1',
    title: '대전 공공디자인 공모전',
    category: '디자인·미술',
    organizer: '대전광역시',
    deadline: '2026-09-30',
    region: '대전광역시',
    description: '시민의 삶을 개선하는 공공공간 디자인 아이디어를 공모합니다.',
  },
  {
    id: 'dj-2',
    title: '대전부르스 창작가요제',
    category: '예술·공연',
    organizer: '대전광역시',
    deadline: '2026-07-31',
    region: '대전광역시',
    description: '대전을 주제로 한 창작곡을 공모하고 가요제를 개최합니다.',
  },
  {
    id: 'dj-3',
    title: '2026 충청권 유니버시아드 디자인 공모전',
    category: '디자인·미술',
    organizer: '대전광역시',
    deadline: '2026-06-30',
    region: '대전광역시',
    description: '2027 충청권 하계유니버시아드를 홍보하는 포스터 및 홍보물 디자인을 공모합니다.',
  },
  {
    id: 'dj-4',
    title: '대청호오백리길 사진 공모전',
    category: '사진·영상',
    organizer: '대전광역시',
    deadline: '2026-10-31',
    region: '대전광역시',
    description: '대청호오백리길의 아름다운 경관을 담은 사진을 공모합니다.',
  },
  {
    id: 'dj-5',
    title: '대전관광사진 공모전',
    category: '사진·영상',
    organizer: '대전관광공사',
    deadline: '2026-09-15',
    region: '대전광역시',
    description: '대전의 관광 명소를 담은 사진 작품을 공모합니다.',
  },
  {
    id: 'dj-6',
    title: '넥스트코드 작가 공모',
    category: 'IT·과학',
    organizer: '대전창조경제혁신센터',
    deadline: '2026-08-31',
    region: '대전광역시',
    description: '대전 IT 생태계를 이끌어갈 신진 개발자 및 창작자를 공모합니다.',
  },
  {
    id: 'dj-7',
    title: '충청U대회 숏폼 영상 공모전',
    category: '사진·영상',
    organizer: '대전광역시 유니버시아드 조직위원회',
    deadline: '2026-08-15',
    region: '대전광역시',
    description: '충청 유니버시아드를 알리는 60초 이내 숏폼 영상을 공모합니다.',
  },
]

export function getContestsByRegion(region: string): StaticContest[] {
  return STATIC_CONTESTS.filter(
    (c) => c.region === region && !isExpiredContest(c.deadline)
  )
}

export function getAllActiveContests(): StaticContest[] {
  return STATIC_CONTESTS.filter((c) => !isExpiredContest(c.deadline))
}
