"""
충북대 매칭 플랫폼 - 시설 예약 현황 크롤러
대상: sports.cbnu.ac.kr (충북대 스포츠 시설 예약 시스템)
실행: GitHub Actions - 매 1시간마다
인증: 충북대 계정 세션 기반
주의: 학교 내부망에서만 접근 가능. GitHub Actions는 외부망이므로
      방화벽 차단 시 로그인 실패. self-hosted runner 필요할 수 있음.
"""

import os
import time
import logging
from datetime import datetime, date, timedelta, timezone
from typing import Optional

def get_kst_now():
    return datetime.now(timezone(timedelta(hours=9)))

import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s'
)
logger = logging.getLogger(__name__)

SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_KEY', '')

def supabase_upsert(table: str, data: list, on_conflict: str):
    url = f"{SUPABASE_URL}/rest/v1/{table}?on_conflict={on_conflict}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    resp = requests.post(url, json=data, headers=headers)
    resp.raise_for_status()
    return resp

FACILITIES = {
    'futsal_a':     'lMSUwWWYZcNpkZTEZ8NtxGSQmZCTlG2Xkmpv',
    'futsal_b':     'lMSUwWWYZcNpkZTEZ8NtxGSQmZCTlG2Xkmpv',
    'basketball_a': 'mcSVwWaYZ8NkkZLEbMNwxGiQk5CTlG2Xkmpv',
    'basketball_b': 'mcSVwWaYZ8NkkZLEbMNwxGiQk5CTlG2Xkmpv',
}

COURT_INDEX = {
    'futsal_a':     0,
    'futsal_b':     1,
    'basketball_a': 0,
    'basketball_b': 1,
}

FACILITY_HOURS = {
    'futsal_a':     (6, 22),
    'futsal_b':     (6, 22),
    'basketball_a': (6, 22),
    'basketball_b': (6, 22),
}

BASE_URL = 'https://sports.cbnu.ac.kr/'
SESSION = requests.Session()


def login() -> bool:
    login_url = BASE_URL + 'index.php?mid=cbnu_main&act=procMemberLogin'
    payload = {
        'user_id': os.environ.get('SPORTS_USERNAME', ''),
        'password': os.environ.get('SPORTS_PASSWORD', ''),
        'module': 'member',
        'act': 'procMemberLogin',
        'mid': 'cbnu_main',
    }
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': BASE_URL,
        'Referer': BASE_URL,
        'X-Requested-With': 'XMLHttpRequest',
    }
    try:
        resp = SESSION.post(login_url, data=payload, headers=headers, timeout=15)
        if 'xe_logged' in SESSION.cookies or resp.status_code == 200:
            logger.info("로그인 성공")
            return True
        logger.error(f"로그인 실패: status={resp.status_code}")
        return False
    except Exception as e:
        logger.error(f"로그인 오류 (학교 방화벽 차단 가능성): {e}")
        return False


def get_schedule(facility_type: str, code: str, target_date: str, api_cache: dict = None) -> list:
    court_idx = COURT_INDEX.get(facility_type)
    formatted_date = f"{target_date[:4]}-{target_date[4:6]}-{target_date[6:]}"
    date_key = f"day_{formatted_date}"
    cache_key = (code, target_date)

    if api_cache is not None and cache_key in api_cache:
        data = api_cache[cache_key]
    else:
        headers = {
            'Accept': 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded',
            'Origin': BASE_URL,
            'Referer': f'{BASE_URL}index.php?act=dispFacilityView&code={code}',
            'X-Requested-With': 'XMLHttpRequest',
        }
        payload = f'code={code}&days={target_date}&module=its&act=get_schedule'
        try:
            resp = SESSION.post(BASE_URL, data=payload, headers=headers, timeout=15)
            resp.raise_for_status()
            data = resp.json()
            if api_cache is not None:
                api_cache[cache_key] = data
        except Exception as e:
            logger.error(f"get_schedule 오류 ({facility_type}, {target_date}): {e}")
            return []

    try:
        day_items = data.get(date_key)
        if not day_items or not isinstance(day_items, list):
            return []

        items_to_process = day_items if court_idx is None else (
            [day_items[court_idx]] if court_idx < len(day_items) else []
        )

        fac_hours = FACILITY_HOURS.get(facility_type)
        slots = []
        for item in items_to_process:
            msg = item.get('msg', '')
            if "예약가능한 날짜가 아닙니다" in msg:
                return []

            unavailable = item.get('unavailable', [])
            if fac_hours:
                start_hour, end_hour = fac_hours
            else:
                time_s = item.get('time_s', '')
                time_e = item.get('time_e', '')
                if not time_s or not time_e:
                    continue
                start_hour = int(time_s.split(":")[0])
                end_hour = int(time_e.split(":")[0])

            for h in range(start_hour, end_hour):
                slot_start = f"{h:02d}:00"
                slot_end = "21:50" if end_hour == 22 and h == 21 else f"{h+1:02d}:00"
                is_unavailable = False
                for unav in unavailable:
                    time_part = unav.split(":")[0] if ":" in unav else unav
                    time_part_clean = time_part.replace(":", "-")
                    if "-" in time_part_clean:
                        try:
                            if int(time_part_clean.split("-")[0]) == h:
                                is_unavailable = True
                                break
                        except ValueError:
                            pass
                slots.append({
                    'facility': facility_type,
                    'reservation_date': formatted_date,
                    'start_time': slot_start,
                    'end_time': slot_end,
                    'status': 'reserved' if is_unavailable else 'available',
                    'last_crawled_at': get_kst_now().isoformat(),
                })
        return slots
    except Exception as e:
        logger.error(f"파싱 오류 ({facility_type}): {e}")
        return []


def upsert_slots(slots: list) -> int:
    if not slots:
        return 0
    try:
        supabase_upsert('sports_reservations', slots, on_conflict='facility,reservation_date,start_time')
        return len(slots)
    except Exception as e:
        logger.error(f"슬롯 upsert 오류: {e}")
        return 0


def delete_past_reservations():
    today = get_kst_now().date().isoformat()
    url = f"{SUPABASE_URL}/rest/v1/sports_reservations?reservation_date=lt.{today}"
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
    }
    try:
        resp = requests.delete(url, headers=headers)
        resp.raise_for_status()
        logger.info(f"지난 예약 데이터 삭제 완료 ({today} 이전)")
    except Exception as e:
        logger.error(f"지난 예약 삭제 오류: {e}")


def crawl_all():
    delete_past_reservations()
    if not login():
        logger.error("로그인 실패로 크롤링 중단")
        return

    today = get_kst_now().date()
    dates = [(today + timedelta(days=i)).strftime('%Y%m%d') for i in range(7)]
    logger.info(f"크롤링 대상: {dates[0]} ~ {dates[-1]}")

    api_cache = {}
    total = 0
    for facility_type, code in FACILITIES.items():
        logger.info(f"--- {facility_type} ---")
        for d in dates:
            is_cache = (code, d) in api_cache
            slots = get_schedule(facility_type, code, d, api_cache)
            count = upsert_slots(slots)
            total += count
            logger.info(f"  {d}: {count}슬롯 {'[캐시]' if is_cache else '[API]'}")
            if not is_cache:
                time.sleep(0.3)

    logger.info(f"총 {total}개 슬롯 처리 완료")


if __name__ == '__main__':
    logger.info("===== 시설 예약 크롤러 시작 =====")
    start = get_kst_now()
    crawl_all()
    elapsed = (get_kst_now() - start).seconds
    logger.info(f"===== 완료 ({elapsed}초) =====")
